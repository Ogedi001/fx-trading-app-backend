import { DeepPartial, QueryRunner } from 'typeorm';
import { TransactionEntity } from '../entities/transaction.entity';

export interface ITransactionRepository {
  findById(
    id: string,
    queryRunner?: QueryRunner,
  ): Promise<TransactionEntity | null>;

  findByIdempotencyKey(
    userId: string,
    key: string,
    queryRunner?: QueryRunner,
  ): Promise<TransactionEntity | null>;

  findAllByUser(
    userId: string,
    queryRunner?: QueryRunner,
  ): Promise<TransactionEntity[]>;

  save(
    tx: DeepPartial<TransactionEntity>,
    queryRunner?: QueryRunner,
  ): Promise<TransactionEntity>;
}
