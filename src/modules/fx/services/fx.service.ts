import { Currency } from 'src/common/enums/currency.enum';
import { FxRateCacheService } from './fx-rate-cache.service';
import { BadRequestException } from 'src/common/exceptions';
import { ErrorCodes } from 'src/common/constants/error-codes';
import { FxApiAdapter } from 'src/infrastructure/fx-api/fx-api.adapter';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FxService {
  constructor(
    private readonly cacheService: FxRateCacheService,
    private readonly fxApiAdapter: FxApiAdapter,
  ) {}

  async getRate(base: Currency, target: Currency): Promise<string> {
    if (base === target) return '1';

    let rate = await this.cacheService.getCachedRate(base, target);

    if (!rate) {
      const rates = await this.fxApiAdapter.fetchRates(base);
      const fetchedRate = rates[target];

      if (!fetchedRate) {
        throw new BadRequestException(
          ErrorCodes.FX_RATE_NOT_FOUND,
          'Rate not found',
        );
      }

      rate = await this.cacheService.saveRate(
        base,
        target,
        fetchedRate.toString(),
        'exchangerate-api',
      );
    }

    return rate.rate;
  }

  async getAllRates(base: Currency): Promise<Record<string, number>> {
    const rates = await this.fxApiAdapter.fetchRates(base);

    // Get all supported currency codes from the enum
    const supportedCurrencies = Object.values(Currency);

    // Filter only supported ones
    const filteredRates: Record<string, number> = {};

    for (const currency of supportedCurrencies) {
      if (rates[currency] !== undefined) {
        filteredRates[currency] = rates[currency];
      }
    }

    return filteredRates;
  }
}
