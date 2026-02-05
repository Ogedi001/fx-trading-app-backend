import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { ErrorCodes } from 'src/common/constants/error-codes';

import {
  BadRequestException,
  UnauthorizedException,
  InternalServerException,
  RateLimitException,
} from 'src/common/exceptions';

import { redisConfig } from 'src/config/redis.config';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { UserEntity } from 'src/modules/users/entities/user.entity';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  /* ---------------------------------- */
  /* Utils                              */
  /* ---------------------------------- */

  private generateRawToken(length = 48): string {
    return crypto.randomBytes(length).toString('hex');
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private generateOtp(length = 6): string {
    let code = '';
    for (let i = 0; i < length; i++) {
      code += Math.floor(Math.random() * 10);
    }
    return code;
  }

  /* ---------------------------------- */
  /* JWT TOKENS                         */
  /* ---------------------------------- */

  generateAccessToken(user: UserEntity): string {
    try {
      return this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      throw new InternalServerException(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        'Failed to generate access token',
      );
    }
  }

  async generateRefreshToken(user: UserEntity): Promise<string> {
    const token = this.generateRawToken(
      redisConfig.constants.REFRESH_TOKEN_LENGTH / 2,
    );

    const key = redisConfig.prefix.refreshToken(token);

    await this.redisService.set(
      key,
      user.id,
      redisConfig.constants.REFRESH_TOKEN_DURATION,
    );

    await this.redisService.set(
      redisConfig.prefix.userRefreshTokens(user.id),
      token,
      redisConfig.constants.REFRESH_TOKEN_DURATION,
    );

    return token;
  }

  async validateRefreshToken(token: string): Promise<string> {
    const userId = await this.redisService.get(
      redisConfig.prefix.refreshToken(token),
    );

    if (!userId) {
      throw new UnauthorizedException(
        ErrorCodes.AUTH_REFRESH_TOKEN_INVALID,
        'Invalid or expired refresh token',
      );
    }

    return userId;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.redisService.del(redisConfig.prefix.refreshToken(token));
  }

  /* ---------------------------------- */
  /* EMAIL VERIFY TOKEN (OTP)           */
  /* ---------------------------------- */

  async generateVerifyToken(email: string): Promise<string> {
    const token = this.generateOtp(6);

    const key = redisConfig.prefix.verifyToken(token);

    await this.redisService.set(
      key,
      email,
      redisConfig.constants.VERIFY_TOKEN_DURATION,
    );

    return token;
  }

  async validateVerifyToken(token: string, email: string): Promise<void> {
    const storedEmail = await this.redisService.get(
      redisConfig.prefix.verifyToken(token),
    );

    if (!storedEmail) {
      throw new BadRequestException(
        ErrorCodes.OTP_EXPIRED,
        'Verification token expired or invalid',
      );
    }

    if (storedEmail !== email) {
      throw new BadRequestException(
        ErrorCodes.OTP_INVALID,
        'Verification token does not match user',
      );
    }

    await this.redisService.del(redisConfig.prefix.verifyToken(token));
  }

  /* ---------------------------------- */
  /* PASSWORD RESET TOKEN               */
  /* ---------------------------------- */

  async generatePasswordResetToken(
    userId: string,
  ): Promise<{ rawToken: string; tokenHash: string }> {
    const rawToken = this.generateRawToken();
    const tokenHash = this.hashToken(rawToken);

    const cooldownKey = redisConfig.prefix.resetCooldown(userId);

    const cooldownExists = await this.redisService.exists(cooldownKey);
    if (cooldownExists) {
      throw new RateLimitException(
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        `Please wait ${redisConfig.func.resetExpInMins()} before requesting again`,
      );
    }

    await this.redisService.set(
      redisConfig.prefix.resetToken(tokenHash),
      userId,
      redisConfig.constants.RESET_TOKEN_DURATION,
    );

    await this.redisService.set(
      cooldownKey,
      'true',
      redisConfig.constants.RESET_COOLDOWN,
    );

    return { rawToken, tokenHash };
  }

  async validatePasswordResetToken(token: string): Promise<string> {
    const tokenHash = this.hashToken(token);

    const userId = await this.redisService.get(
      redisConfig.prefix.resetToken(tokenHash),
    );

    if (!userId) {
      throw new BadRequestException(
        ErrorCodes.OTP_INVALID,
        'Reset token invalid or expired',
      );
    }

    await this.redisService.del(redisConfig.prefix.resetToken(tokenHash));

    return userId;
  }

  /* ---------------------------------- */
  /* BLACKLIST (LOGOUT)                 */
  /* ---------------------------------- */

  async blacklistAccessToken(token: string, ttl: number): Promise<void> {
    const key = redisConfig.prefix.blacklist(token);

    await this.redisService.set(key, 'true', ttl);
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    return this.redisService.exists(redisConfig.prefix.blacklist(token));
  }

  /* ---------------------------------- */
  /* FAILED ATTEMPTS / LOCKOUT          */
  /* ---------------------------------- */

  async recordFailedAttempt(email: string): Promise<void> {
    const key = redisConfig.prefix.failedAttempt(email);

    const attempts = await this.redisService.incr(key);

    if (attempts === 1) {
      await this.redisService.set(
        key,
        '1',
        redisConfig.constants.RESET_ATTEMPT_WINDOW,
      );
    }

    if (attempts >= redisConfig.constants.FAILED_ATTEMPT_LIMIT) {
      throw new RateLimitException(
        ErrorCodes.AUTH_ACCOUNT_LOCKED,
        `Account locked for ${redisConfig.func.getLockoutDuration()}`,
      );
    }
  }

  async clearFailedAttempts(email: string): Promise<void> {
    await this.redisService.del(redisConfig.prefix.failedAttempt(email));
  }

  /* ---------------------------------- */
  /* DAILY TX LIMIT (BONUS)             */
  /* ---------------------------------- */

  async incrementDailyTx(userId: string): Promise<number> {
    const key = redisConfig.prefix.dailyTxLimit(userId);
    const count = await this.redisService.incr(key);

    if (count === 1) {
      await this.redisService.set(key, '1', 86400);
    }

    return count;
  }
}
