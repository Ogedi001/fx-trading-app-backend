import { Currency } from 'src/common/enums/currency.enum';
import { TransactionStatus } from 'src/common/enums/transaction-status.enum';
import { TransactionType } from 'src/common/enums/transaction-type.enum';
import { BaseEntity, Column, Entity } from 'typeorm';

@Entity('transactions')
export class Transaction extends BaseEntity {
  @Column()
  userId: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'enum', enum: Currency })
  fromCurrency: Currency;

  @Column({ type: 'enum', enum: Currency })
  toCurrency: Currency;

  @Column('decimal', { precision: 18, scale: 2 })
  amount: string;

  @Column('decimal', { precision: 18, scale: 6 })
  rate: string;

  @Column({ type: 'enum', enum: TransactionStatus })
  status: TransactionStatus;

  @Column({ unique: true })
  reference: string;
}
