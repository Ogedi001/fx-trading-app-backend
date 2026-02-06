// src/modules/fx/fx.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FxRateEntity } from './entities/fx-rate.entity';
import { FxRateRepository } from './repositories/fx-rate.repository';
import { FxRateDomain } from './domain/fx-rate.domain';
import { RateValidator } from './domain/rate-validator';
import { FxApiModule } from 'src/infrastructure/fx-api/fx-api.module';
import { FxRateCacheService } from './services/fx-rate-cache.service';
import { FxCalculationService } from './services/fx-calculation.service';
import { FxService } from './services/fx.service';
import { FxController } from './controllers/fx.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FxRateEntity]), FxApiModule],
  controllers: [FxController],
  providers: [
    FxRateRepository,
    { provide: 'IFxRateRepository', useClass: FxRateRepository },
    FxRateDomain,
    RateValidator,
    FxRateCacheService,
    FxCalculationService,
    FxService,
  ],
  exports: ['IFxRateRepository', FxCalculationService],
})
export class FxModule {}
