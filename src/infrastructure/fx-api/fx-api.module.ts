import { Module } from '@nestjs/common';
import { ExchangeRateApiProvider } from './exchangerate-api.provider';
import { FxApiAdapter } from './fx-api.adapter';

@Module({
  providers: [ExchangeRateApiProvider, FxApiAdapter],
  exports: [FxApiAdapter],
})
export class FxApiModule {}
