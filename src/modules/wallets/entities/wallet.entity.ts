import { UserEntity } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { WalletBalanceEntity } from './wallet-balance.entity';
import { TransactionEntity } from 'src/modules/transactions/entities/transaction.entity';
import { WalletStatus } from 'src/common/enums/wallet-status.enum';
import { BaseEntity } from 'src/common/base/base.entity';

@Entity('wallets')
export class WalletEntity extends BaseEntity {
  @Column()
  userId: string;

  @Column({ type: 'enum', enum: WalletStatus })
  status: WalletStatus;

  @OneToOne(() => UserEntity, (user) => user.wallet)
  @JoinColumn()
  user: UserEntity;

  @OneToMany(() => WalletBalanceEntity, (b) => b.wallet)
  balances: WalletBalanceEntity[];

  @OneToMany(() => TransactionEntity, (tx) => tx.wallet)
  transactions: TransactionEntity[];
}
