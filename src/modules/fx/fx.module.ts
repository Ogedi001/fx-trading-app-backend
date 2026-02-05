// src/modules/fx/fx.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { FxController } from './controllers/fx.controller';
// import { FxService } from './services/fx.service';
// import { FxRateSyncService } from './services/fx-rate-sync.service';
// import { FxRateCacheService } from './services/fx-rate-cache.service';
// import { FxCalculationService } from './services/fx-calculation.service';
import { FxRateEntity } from './entities/fx-rate.entity';
import { FxRateRepository } from './repositories/fx-rate.repository';
import { FxRateDomain } from './domain/fx-rate.domain';
import { RateValidator } from './domain/rate-validator';
//import { FxApiModule } from '../../infrastructure/fx-api/fx-api.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FxRateEntity]),
    // FxApiModule
  ],
  controllers: [],
  providers: [
    // FxService,
    // FxRateSyncService,
    // FxRateCacheService,
    // FxCalculationService,
    FxRateRepository,
    { provide: 'IFxRateRepository', useClass: FxRateRepository },
    FxRateDomain,
    RateValidator,
  ],
  exports: ['IFxRateRepository'],
})
export class FxModule {}
