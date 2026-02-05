import { BaseEntity } from 'src/common/base/base.entity';
import { Currency } from 'src/common/enums/currency.enum';
import { TransactionStatus } from 'src/common/enums/transaction-status.enum';
import { TransactionType } from 'src/common/enums/transaction-type.enum';
import { WalletEntity } from 'src/modules/wallets/entities/wallet.entity';
import { Column, Entity, Index, ManyToOne } from 'typeorm';

@Entity('transactions')
@Index(['idempotencyKey'], { unique: true })
export class TransactionEntity extends BaseEntity {
  @Column()
  walletId: string;

  @ManyToOne(() => WalletEntity, (wallet) => wallet.transactions)
  wallet: WalletEntity;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'enum', enum: TransactionStatus })
  status: TransactionStatus;

  @Column({ type: 'enum', enum: Currency })
  fromCurrency: Currency;

  @Column({ type: 'enum', enum: Currency })
  toCurrency: Currency;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  fromAmount: string;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  toAmount: string;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  rate: string;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  fee: string;

  @Column()
  idempotencyKey: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date;
}
