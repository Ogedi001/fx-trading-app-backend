import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { WalletEntity } from '../entities/wallet.entity';
import { IWalletRepository } from './wallet.repository.interface';

@Injectable()
export class WalletRepository implements IWalletRepository {
  constructor(
    @InjectRepository(WalletEntity)
    private readonly repo: Repository<WalletEntity>,
  ) {}

  findByUserId(userId: string, queryRunner?: QueryRunner) {
    const manager = queryRunner?.manager ?? this.repo.manager;

    return manager.findOne(WalletEntity, {
      where: { userId },
      relations: ['balances'],
    });
  }

  async lockWallet(walletId: string, queryRunner: QueryRunner) {
    await queryRunner.manager.query(
      `SELECT 1 FROM wallets WHERE id = $1 FOR UPDATE`,
      [walletId],
    );
  }

  save(wallet: WalletEntity, queryRunner?: QueryRunner) {
    const manager = queryRunner?.manager ?? this.repo.manager;
    return manager.save(WalletEntity, wallet);
  }
}
