import { Injectable } from '@nestjs/common';
import { FxRateCacheService } from './fx-rate-cache.service';
import { NotFoundException } from 'src/common/exceptions';
import { ErrorCodes } from 'src/common/constants/error-codes';
import { Currency } from 'src/common/enums/currency.enum';

@Injectable()
export class FxCalculationService {
  constructor(private readonly fxCache: FxRateCacheService) {}

  calculate(amount: string, rate: string): string {
    return (Number(amount) * Number(rate)).toFixed(8);
  }
  async convert(from: Currency, to: Currency, amount: string) {
    if (from === to) {
      return {
        rate: '1',
        fromAmount: amount,
        toAmount: amount,
      };
    }

    const rateEntity = await this.fxCache.getCachedRate(from, to);
    if (!rateEntity) {
      throw new NotFoundException(
        ErrorCodes.FX_RATE_NOT_FOUND,
        'FX rate not available',
      );
    }

    const converted = (Number(amount) * Number(rateEntity.rate)).toFixed(8);

    return {
      rate: rateEntity.rate,
      fromAmount: amount,
      toAmount: converted,
      base: from,
      target: to,
      validUntil: rateEntity.validUntil,
    };
  }
}
