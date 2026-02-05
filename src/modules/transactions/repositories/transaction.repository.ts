import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionEntity } from '../entities/transaction.entity';
import { ITransactionRepository } from './transaction.repository.interface';

@Injectable()
export class TransactionRepository implements ITransactionRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly repo: Repository<TransactionEntity>,
  ) {}

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  findByIdempotencyKey(key: string) {
    return this.repo.findOne({ where: { idempotencyKey: key } });
  }

  save(tx: TransactionEntity) {
    return this.repo.save(tx);
  }
}
