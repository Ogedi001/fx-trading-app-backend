import { QueryRunner } from 'typeorm';
import { WalletEntity } from '../entities/wallet.entity';
import { WalletBalanceEntity } from '../entities/wallet-balance.entity';
import { Currency } from 'src/common/enums/currency.enum';

export interface IWalletRepository {
  findByUserId(
    userId: string,
    queryRunner?: QueryRunner,
  ): Promise<WalletEntity | null>;

  lockWallet(walletId: string, queryRunner: QueryRunner): Promise<void>;

  save(wallet: WalletEntity, queryRunner?: QueryRunner): Promise<WalletEntity>;
}

export interface IWalletBalanceRepository {
  findByWalletAndCurrency(
    walletId: string,
    currency: Currency,
    queryRunner?: QueryRunner,
  ): Promise<WalletBalanceEntity | null>;

  lockBalance(balanceId: string, queryRunner: QueryRunner): Promise<void>;

  save(
    balance: WalletBalanceEntity,
    queryRunner?: QueryRunner,
  ): Promise<WalletBalanceEntity>;
}
