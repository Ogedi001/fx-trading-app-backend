import { Injectable } from '@nestjs/common';
import { FxRateRepository } from '../repositories/fx-rate.repository';
import { Currency } from 'src/common/enums/currency.enum';
import { FxRateDomain } from '../domain/fx-rate.domain';
import { RateValidator } from '../domain/rate-validator';
import { FxRateEntity } from '../entities/fx-rate.entity';
import { RedisService } from 'src/infrastructure/redis/redis.service';
@Injectable()
export class FxRateCacheService {
  constructor(
    private readonly fxRateRepo: FxRateRepository,
    private readonly redisService: RedisService,
  ) {}

  private cacheKey(base: Currency, target: Currency): string {
    return `fx:${base}:${target}`;
  }

  async getCachedRate(
    base: Currency,
    target: Currency,
  ): Promise<FxRateEntity | null> {
    const key = this.cacheKey(base, target);

    // Try Redis first (memory)
    const cached = await this.redisService.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    //  Try DB
    const rate = await this.fxRateRepo.findRate(base, target);
    if (!rate) return null;

    const domain = new FxRateDomain(rate.rate, rate.validUntil);
    if (domain.isExpired()) return null;

    //  Store in Redis for faster access
    await this.redisService.set(
      key,
      JSON.stringify(rate),
      60, // 1 minute TTL
    );

    return rate;
  }

  async saveRate(
    base: Currency,
    target: Currency,
    rate: string,
    source: string,
    ttlMinutes = 5,
  ): Promise<FxRateEntity> {
    RateValidator.validate(rate);

    const entity = new FxRateEntity();
    entity.baseCurrency = base;
    entity.targetCurrency = target;
    entity.rate = rate;
    entity.source = source;
    entity.validUntil = new Date(Date.now() + ttlMinutes * 60 * 1000);

    const saved = await this.fxRateRepo.save(entity);

    // also cache in Redis
    await this.redisService.set(
      this.cacheKey(base, target),
      JSON.stringify(saved),
      60,
    );

    return saved;
  }
}
