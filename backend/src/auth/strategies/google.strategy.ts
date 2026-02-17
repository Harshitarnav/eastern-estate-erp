import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;
    
    if (!emails || emails.length === 0) {
      return done(new UnauthorizedException('No email found in Google profile'), null);
    }

    const email = emails[0].value;
    
    // ✅ DOMAIN VALIDATION - Only allow @eecd.in emails
    if (!email.endsWith('@eecd.in')) {
      return done(
        new UnauthorizedException(
          'Access denied. Only @eecd.in email addresses are allowed to access this system.'
        ),
        null
      );
    }

    // Find or create user
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      // Auto-create user for valid domain
      const firstName = name?.givenName || email.split('@')[0];
      const lastName = name?.familyName || '';
      
      user = await this.usersService.create({
        email,
        username: email.split('@')[0],
        password: `google_oauth_${Date.now()}`, // Random password, won't be used
        firstName,
        lastName,
        roleIds: [], // Will be assigned 'staff' role by default in create method
        profileImage: photos && photos.length > 0 ? photos[0].value : null,
      }, null); // No creator for auto-created users
      
      // Fetch the created user with roles
      user = await this.usersService.findByEmail(email);
    } else if (!user.isActive) {
      return done(
        new UnauthorizedException('Your account has been deactivated. Please contact administrator.'),
        null
      );
    }

    // Ensure we have user with roles for JWT payload
    if (!user.roles || user.roles.length === 0) {
      user = await this.usersService.findByEmail(email);
    }

    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage || (photos && photos.length > 0 ? photos[0].value : null),
      googleId: id,
      roles: user.roles || [],
    };

    return done(null, userData);
  }
}
