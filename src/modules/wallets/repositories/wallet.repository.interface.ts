import { Currency } from 'src/common/enums/currency.enum';
import { WalletEntity } from '../entities/wallet.entity';
import { WalletBalanceEntity } from '../entities/wallet-balance.entity';

export interface IWalletRepository {
  findByUserId(userId: string): Promise<WalletEntity | null>;
  lockWallet(walletId: string): Promise<void>;
  save(wallet: WalletEntity): Promise<WalletEntity>;
}

export interface IWalletBalanceRepository {
  findByWalletAndCurrency(
    walletId: string,
    currency: Currency,
  ): Promise<WalletBalanceEntity | null>;

  lockBalance(balanceId: string): Promise<void>;

  save(balance: WalletBalanceEntity): Promise<WalletBalanceEntity>;
}
