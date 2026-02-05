import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RedisService } from 'src/infrastructure/redis/redis.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  async checkDatabase(): Promise<'up' | 'down'> {
    try {
      await this.dataSource.query('SELECT 1');
      return 'up';
    } catch {
      return 'down';
    }
  }

  async checkRedis(): Promise<'up' | 'down'> {
    try {
      await this.redisService.ping();
      return 'up';
    } catch {
      return 'down';
    }
  }

  async healthCheck() {
    const checks = {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
    };

    const total = Object.keys(checks).length;
    const healthy = Object.values(checks).filter((v) => v === 'up').length;
    const healthPercent = Math.round((healthy / total) * 100);

    return {
      status: healthPercent === 100 ? 'healthy' : 'degraded',
      health: healthPercent,
      checks,
    };
  }
}
