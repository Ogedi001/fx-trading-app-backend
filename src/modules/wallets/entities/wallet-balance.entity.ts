import { Currency } from 'src/common/enums/currency.enum';
import { Entity, Unique, ManyToOne, Column } from 'typeorm';
import { WalletEntity } from './wallet.entity';
import { BaseEntity } from 'src/common/base/base.entity';

@Entity('wallet_balances')
@Unique(['wallet', 'currency'])
export class WalletBalanceEntity extends BaseEntity {
  @Column()
  walletId: string;

  @ManyToOne(() => WalletEntity, (wallet) => wallet.balances)
  wallet: WalletEntity;

  @Column({ type: 'enum', enum: Currency })
  currency: Currency;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  balance: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  lockedBalance: string;
}
