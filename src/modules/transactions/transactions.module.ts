// src/modules/transactions/transactions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { TransactionsController } from './controllers/transactions.controller';
// import { TransactionsService } from './services/transactions.service';
// import { TransactionRecorderService } from './services/transaction-recorder.service';
// import { IdempotencyService } from './services/idempotency.service';
import { TransactionEntity } from './entities/transaction.entity.js';
import { TransactionRepository } from './repositories/transaction.repository.js';
import { TransactionDomain } from './domain/transaction.domain.js';
import { WalletsModule } from '../wallets/wallets.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity]), WalletsModule],
  controllers: [],
  providers: [
    // TransactionsService,
    // TransactionRecorderService,
    // IdempotencyService,
    TransactionRepository,
    TransactionDomain,
  ],
  exports: [],
})
export class TransactionsModule {}
