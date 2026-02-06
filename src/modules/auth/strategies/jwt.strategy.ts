import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { FastifyRequest } from 'fastify';

import { TokenService } from '../services/token.service';
import { UnauthorizedException } from 'src/common/exceptions';
import { ErrorCodes } from 'src/common/constants/error-codes';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly tokenService: TokenService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'fx_secret_key',
      passReqToCallback: true, //  important
    });
  }

  async validate(req: FastifyRequest, payload: any) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    if (!token) {
      throw new UnauthorizedException(
        ErrorCodes.AUTH_TOKEN_MISSING,
        'Missing token',
      );
    }

    const blacklisted = await this.tokenService.isTokenBlacklisted(token);
    if (blacklisted) {
      throw new UnauthorizedException(
        ErrorCodes.AUTH_UNAUTHORIZED,
        'Token has been revoked',
      );
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
