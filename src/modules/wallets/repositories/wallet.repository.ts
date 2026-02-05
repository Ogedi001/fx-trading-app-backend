import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IWalletRepository } from './wallet.repository.interface.js';
import { WalletEntity } from '../entities/wallet.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class WalletRepository implements IWalletRepository {
  constructor(
    @InjectRepository(WalletEntity)
    private readonly repo: Repository<WalletEntity>,
  ) {}

  findByUserId(userId: string) {
    return this.repo.findOne({
      where: { userId },
      relations: ['balances'],
    });
  }

  async lockWallet(walletId: string) {
    await this.repo.query(`SELECT 1 FROM wallets WHERE id = $1 FOR UPDATE`, [
      walletId,
    ]);
  }

  save(wallet: WalletEntity) {
    return this.repo.save(wallet);
  }
}
