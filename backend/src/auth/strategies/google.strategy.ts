import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, StrategyOptions } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';

// Extend StrategyOptions to include the prompt parameter
interface ExtendedStrategyOptions extends StrategyOptions {
  prompt?: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    const options: ExtendedStrategyOptions = {
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
      prompt: 'select_account', // Force account selection every time
    };
    
    super(options as StrategyOptions);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { emails, name, photos } = profile;
    
    if (!emails || emails.length === 0) {
      return done(new UnauthorizedException('No email found from Google'), null);
    }

    const email = emails[0].value;
    const emailDomain = email.split('@')[1];

    // Restrict to @eecd.in domain only
    if (emailDomain !== 'eecd.in') {
      return done(
        new UnauthorizedException('Only @eecd.in domain emails are allowed'),
        null,
      );
    }

    // Check if user exists in database (pre-registered by HR)
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });

    // If user doesn't exist, they haven't been registered by HR yet
    if (!user) {
      return done(
        new UnauthorizedException(
          'You do not have access yet. Please contact HR to set up your account.',
        ),
        null,
      );
    }

    // Check if user account is active
    if (!user.isActive) {
      return done(
        new UnauthorizedException('Your account has been deactivated. Please contact HR.'),
        null,
      );
    }

    // Update user's last login and Google profile info
    user.lastLoginAt = new Date();
    if (!user.profileImage && photos && photos.length > 0) {
      user.profileImage = photos[0].value;
    }
    if (!user.firstName && name?.givenName) {
      user.firstName = name.givenName;
    }
    if (!user.lastName && name?.familyName) {
      user.lastName = name.familyName;
    }

    await this.usersRepository.save(user);

    const userPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      roles: user.roles,
      permissions: user.roles.flatMap(role => role.permissions),
    };

    return done(null, userPayload);
  }
}
