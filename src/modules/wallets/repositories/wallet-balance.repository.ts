import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { WalletBalanceEntity } from '../entities/wallet-balance.entity';
import { IWalletBalanceRepository } from './wallet.repository.interface';
import { Currency } from 'src/common/enums/currency.enum';

@Injectable()
export class WalletBalanceRepository implements IWalletBalanceRepository {
  constructor(
    @InjectRepository(WalletBalanceEntity)
    private readonly repo: Repository<WalletBalanceEntity>,
  ) {}

  findByWalletAndCurrency(
    walletId: string,
    currency: Currency,
    queryRunner?: QueryRunner,
  ) {
    const manager = queryRunner?.manager ?? this.repo.manager;

    return manager.findOne(WalletBalanceEntity, {
      where: { walletId, currency },
    });
  }

  async lockBalance(balanceId: string, queryRunner: QueryRunner) {
    await queryRunner.manager.query(
      `SELECT 1 FROM wallet_balances WHERE id = $1 FOR UPDATE`,
      [balanceId],
    );
  }

  save(balance: WalletBalanceEntity, queryRunner?: QueryRunner) {
    const manager = queryRunner?.manager ?? this.repo.manager;
    return manager.save(WalletBalanceEntity, balance);
  }
}
