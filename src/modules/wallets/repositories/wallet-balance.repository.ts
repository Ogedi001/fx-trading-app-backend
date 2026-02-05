import { Currency } from 'src/common/enums/currency.enum';
import { WalletBalanceEntity } from '../entities/wallet-balance.entity';
import { IWalletBalanceRepository } from './wallet.repository.interface';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class WalletBalanceRepository implements IWalletBalanceRepository {
  constructor(
    @InjectRepository(WalletBalanceEntity)
    private readonly repo: Repository<WalletBalanceEntity>,
  ) {}

  findByWalletAndCurrency(walletId: string, currency: Currency) {
    return this.repo.findOne({
      where: { walletId, currency },
    });
  }

  async lockBalance(balanceId: string) {
    await this.repo.query(
      `SELECT 1 FROM wallet_balances WHERE id = $1 FOR UPDATE`,
      [balanceId],
    );
  }

  save(balance: WalletBalanceEntity) {
    return this.repo.save(balance);
  }
}
