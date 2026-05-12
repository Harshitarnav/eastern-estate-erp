import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from '../modules/users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PropertyAccessService } from '../modules/users/services/property-access.service';

export type PropertyAccessMode = 'wide' | 'assigned';

export interface AuthUserDto {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profileImage?: string;
  roles: Array<{ id: string; name: string; displayName: string }>;
  propertyAccessMode: PropertyAccessMode;
  assignedPropertyIds?: string[];
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private propertyAccessService: PropertyAccessService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
      select: ['id', 'email', 'username', 'password', 'firstName', 'lastName', 'isActive', 'isVerified'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      throw new UnauthorizedException('Account is temporarily locked. Please try again later.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Increment failed login attempts (handle null/undefined)
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
      }
      
      await this.usersRepository.save(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date();
    await this.usersRepository.save(user);

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const payload = {
        sub: user.id,
        email: user.email,
        roles: user.roles.map((r: any) => r.name),
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.createRefreshToken(user.id, ipAddress, userAgent);

    const userDto = await this.buildAuthUserDto(user as User);

    return {
      accessToken,
      refreshToken: refreshToken.token,
      user: userDto,
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: [
        { email: registerDto.email },
        { username: registerDto.username },
      ],
    });

    if (existingUser) {
      throw new BadRequestException('User already exists with this email or username');
    }

    // Hash password
    const saltRounds = this.configService.get<number>('security.bcryptRounds') ?? 12;
    const password = await bcrypt.hash(registerDto.password, saltRounds);

    // Create user
    const user = this.usersRepository.create({
      email: registerDto.email,
      username: registerDto.username,
      password,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      phone: registerDto.phone,
    });

    await this.usersRepository.save(user);

    const { password: _, ...result } = user;
    return result;
  }

  async refreshAccessToken(refreshToken: string) {
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
      relations: ['user', 'user.roles'],
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (new Date(tokenRecord.expiresAt) < new Date()) {
      await this.refreshTokenRepository.remove(tokenRecord);
      throw new UnauthorizedException('Refresh token expired');
    }

    const payload = {
      sub: tokenRecord.user.id,
      email: tokenRecord.user.email,
      roles: tokenRecord.user.roles.map(r => r.name),
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      refreshToken: tokenRecord.token,
    };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.refreshTokenRepository.delete({ token: refreshToken });
    } else {
      await this.refreshTokenRepository.delete({ user: { id: userId } });
    }
    return { message: 'Logged out successfully' };
  }

  async googleLogin(user: any, ipAddress?: string, userAgent?: string) {
    // User is already validated by GoogleStrategy
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((r: any) => r.name),
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.createRefreshToken(user.id, ipAddress, userAgent);

    const userDto = await this.buildAuthUserDto(user as User);

    return {
      accessToken,
      refreshToken: refreshToken.token,
      user: userDto,
    };
  }

  /** Same public user shape as login — plus `permissions` for JWT /auth/me parity. */
  async getAuthenticatedProfile(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    const userDto = await this.buildAuthUserDto(user);
    const permissions = user.roles.flatMap((role) => role.permissions || []);

    return {
      ...userDto,
      permissions,
    };
  }

  private mapUserRoles(roles: any[] | undefined): AuthUserDto['roles'] {
    return (roles || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      displayName: r.displayName,
    }));
  }

  /**
   * `wide` = org-wide project list (privileged role with no explicit assignments, or super_admin).
   * `assigned` = only projects in user_property_access (or customer booking projects).
   */
  private async buildAuthUserDto(user: User | any): Promise<AuthUserDto> {
    const roles = user.roles || [];
    const roleNames: string[] = roles.map((r: any) =>
      typeof r === 'string' ? r : r.name,
    );

    const base: AuthUserDto = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: this.mapUserRoles(roles),
      propertyAccessMode: 'assigned',
    };

    if (user.phone) {
      base.phone = user.phone;
    }
    if (user.profileImage) {
      base.profileImage = user.profileImage;
    }

    if (roleNames.includes('super_admin')) {
      base.propertyAccessMode = 'wide';
      return base;
    }

    const assigned = await this.propertyAccessService.getUserPropertyIds(user.id);
    if (assigned.length > 0) {
      base.propertyAccessMode = 'assigned';
      base.assignedPropertyIds = assigned;
      return base;
    }

    if (roleNames.includes('customer')) {
      const customerId = await this.propertyAccessService.getUserCustomerId(user.id);
      const ids = customerId
        ? await this.propertyAccessService.getPropertyIdsForCustomerBookings(customerId)
        : [];
      base.propertyAccessMode = 'assigned';
      base.assignedPropertyIds = ids;
      return base;
    }

    const wideUnassigned =
      roleNames.includes('head_accountant') ||
      roleNames.includes('admin') ||
      roleNames.includes('hr');
    if (wideUnassigned) {
      base.propertyAccessMode = 'wide';
      return base;
    }

    base.propertyAccessMode = 'assigned';
    base.assignedPropertyIds = [];
    return base;
  }

  private async createRefreshToken(userId: string, ipAddress?: string, userAgent?: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const token = this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        // Cast required: @nestjs/jwt v11 expects branded `StringValue` from `ms`,
        // but ConfigService returns plain `string`. Value is valid at runtime.
        expiresIn: (this.configService.get<string>('jwt.refreshExpiration') ?? '7d') as unknown as number,
      },
    );

    const refreshToken = this.refreshTokenRepository.create({
      user: { id: userId },
      token,
      expiresAt,
      ipAddress,
      userAgent,
    });

    return await this.refreshTokenRepository.save(refreshToken);
  }
}