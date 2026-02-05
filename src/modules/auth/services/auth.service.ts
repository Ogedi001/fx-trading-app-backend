import {
  ConflictException,
  UnauthorizedException,
  ValidationException,
} from 'src/common/exceptions';
import { ErrorCodes } from 'src/common/constants/error-codes';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/services/users.service';

import { TokenService } from './token.service';
import { compare, encrypt } from 'src/common/utils/crypto.util';
import { MailService } from 'src/modules/notifications/services/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
  ) {}

  // REGISTER
  async register(email: string, password: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException(
        ErrorCodes.USER_ALREADY_EXISTS,
        'Email already registered',
      );
    }

    const hashedPassword = await encrypt.password(password);

    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      isVerified: false,
    });

    const verificationToken =
      await this.tokenService.generateVerifyToken(email);

    await this.mailService.sendVerificationEmail(
      user.email,
      user.email.split('@')[0],
      verificationToken,
    );

    return { id: user.id, email: user.email };
  }

  // VERIFY ACCOUNT
  async verifyAccount(email: string, otp: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new ValidationException(ErrorCodes.USER_NOT_FOUND);
    }
    if (user.isVerified) {
      throw new ConflictException(
        ErrorCodes.USER_EMAIL_ALREADY_VERIFIED,
        'Email already verified',
      );
    }

    await this.tokenService.validateVerifyToken(otp, email);

    await this.mailService.sendWelcomeEmail(
      user.email,
      user.email.split('@')[0],
    );

    await this.usersService.markVerified(user.id);

    return { verified: true };
  }

  // RESEND VERIFICATION
  async resendVerification(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return {
        message: 'If the account exists, a verification email has been sent.',
      };
    }

    if (user.isVerified) {
      throw new ConflictException(
        ErrorCodes.USER_EMAIL_ALREADY_VERIFIED,
        'Email already verified',
      );
    }

    const verificationToken =
      await this.tokenService.generateVerifyToken(email);

    await this.mailService.sendVerificationEmail(
      user.email,
      user.email.split('@')[0],
      verificationToken,
    );

    return { message: 'Verification email resent successfully' };
  }

  // LOGIN
  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException(ErrorCodes.AUTH_INVALID_CREDENTIALS);
    }

    if (!user.isVerified) {
      throw new UnauthorizedException(ErrorCodes.AUTH_EMAIL_NOT_VERIFIED);
    }

    const passwordValid = await compare.password(password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException(
        ErrorCodes.AUTH_INVALID_CREDENTIALS,
        'Invalid credentials',
      );
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
