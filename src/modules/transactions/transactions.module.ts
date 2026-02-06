// src/modules/transactions/transactions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from './entities/transaction.entity.js';
import { TransactionRepository } from './repositories/transaction.repository.js';
import { TransactionDomain } from './domain/transaction.domain.js';
import { TransactionsController } from './controllers/transactions.controller.js';
import { TransactionsService } from './services/transactions.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity])],
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    TransactionDomain,
    {
      provide: 'ITransactionRepository',
      useClass: TransactionRepository,
    },
  ],
  exports: ['ITransactionRepository', TransactionsService],
})
export class TransactionsModule {}
