import { TransactionEntity } from '../entities/transaction.entity';

export interface ITransactionRepository {
  findById(id: string): Promise<TransactionEntity | null>;
  findByIdempotencyKey(key: string): Promise<TransactionEntity | null>;
  save(tx: TransactionEntity): Promise<TransactionEntity>;
}
