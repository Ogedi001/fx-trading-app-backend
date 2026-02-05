import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletEntity } from './entities/wallet.entity';
import { WalletBalanceEntity } from './entities/wallet-balance.entity';
import { WalletRepository } from './repositories/wallet.repository';
import { WalletBalanceRepository } from './repositories/wallet-balance.repository';
import { WalletDomain } from './domain/wallet.domain';
import { BalanceCalculator } from './domain/balance-calculator';
import { FxModule } from '../fx/fx.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletEntity, WalletBalanceEntity]),
    FxModule,
  ],
  providers: [
    WalletRepository,
    WalletBalanceRepository,

    {
      provide: 'IWalletRepository',
      useClass: WalletRepository,
    },
    {
      provide: 'IWalletBalanceRepository',
      useClass: WalletBalanceRepository,
    },
    WalletDomain,
    BalanceCalculator,
  ],
  exports: ['IWalletRepository', 'IWalletBalanceRepository'],
})
export class WalletsModule {}
