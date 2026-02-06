import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner, DeepPartial } from 'typeorm';
import { TransactionEntity } from '../entities/transaction.entity';
import { ITransactionRepository } from './transaction.repository.interface';

@Injectable()
export class TransactionRepository implements ITransactionRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly repo: Repository<TransactionEntity>,
  ) {}

  findById(id: string, queryRunner?: QueryRunner) {
    const manager = queryRunner?.manager ?? this.repo.manager;
    return manager.findOne(TransactionEntity, { where: { id } });
  }

  findByIdempotencyKey(userId: string, key: string, queryRunner?: QueryRunner) {
    const manager = queryRunner?.manager ?? this.repo.manager;
    return manager.findOne(TransactionEntity, {
      where: { userId, idempotencyKey: key },
    });
  }

  findAllByUser(userId: string, queryRunner?: QueryRunner) {
    const manager = queryRunner?.manager ?? this.repo.manager;
    return manager.find(TransactionEntity, {
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  save(tx: DeepPartial<TransactionEntity>, queryRunner?: QueryRunner) {
    const manager = queryRunner?.manager ?? this.repo.manager;
    return manager.save(TransactionEntity, tx);
  }
}
