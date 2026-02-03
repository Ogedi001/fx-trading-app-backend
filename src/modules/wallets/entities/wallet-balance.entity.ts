import { Currency } from 'src/common/enums/currency.enum';
import { Entity, Unique, BaseEntity, ManyToOne, Column } from 'typeorm';
import { Wallet } from './wallet.entity';

@Entity('wallet_balances')
@Unique(['wallet', 'currency'])
export class WalletBalance extends BaseEntity {
  @ManyToOne(() => Wallet, (wallet) => wallet.balances)
  wallet: Wallet;

  @Column({ type: 'enum', enum: Currency })
  currency: Currency;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  balance: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  lockedBalance: string;
}
