import { Injectable } from '@nestjs/common';
import { Currency } from 'src/common/enums/currency.enum';
import { ExchangeRateApiProvider } from './exchangerate-api.provider';

@Injectable()
export class FxApiAdapter {
  constructor(
    private readonly exchangeRateProvider: ExchangeRateApiProvider,
    //private readonly currencyApiProvider: CurrencyApiProvider, // fallback
  ) {}

  async fetchRates(
    base: Currency,
  ): Promise<Record<string, number> > {
    //try {
      return await this.exchangeRateProvider.getRates(base);
    //} catch (err) {
      // return await this.currencyApiProvider.getRates(base);
   // }
  }
}
