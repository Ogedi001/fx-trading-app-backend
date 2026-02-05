import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  RATE_LIMIT_KEY,
  RateLimitOptions,
} from '../decorators/rate-limit.decorator';

import { RateLimitException } from '../exceptions';
import { RedisService } from 'src/infrastructure/redis/redis.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    if (!options) return true;

    const request = context.switchToHttp().getRequest();
    const key = `rate_limit:${request.ip}:${request.route.path}`;

    const count = await this.redisService.incr(key);

    if (count === 1) {
      await this.redisService.expire(key, options.ttl);
    }

    if (count > options.limit) {
      throw new RateLimitException();
    }

    return true;
  }
}
