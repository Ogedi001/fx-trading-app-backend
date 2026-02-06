import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletEntity } from './entities/wallet.entity';
import { WalletBalanceEntity } from './entities/wallet-balance.entity';
import { WalletRepository } from './repositories/wallet.repository';
import { WalletBalanceRepository } from './repositories/wallet-balance.repository';
import { WalletDomain } from './domain/wallet.domain';
import { BalanceCalculator } from './domain/balance-calculator';
import { FxModule } from '../fx/fx.module';
import { WalletsService } from './services/wallets.service';
import { WalletsController } from './controllers/wallets.controller';

import { TransactionsModule } from '../transactions/transactions.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletEntity, WalletBalanceEntity]),
    FxModule,
    TransactionsModule,
    UsersModule,
  ],
  controllers: [WalletsController],
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
    WalletsService,
    BalanceCalculator,
  ],
  exports: ['IWalletRepository', 'IWalletBalanceRepository', WalletsService],
})
export class WalletsModule {}
