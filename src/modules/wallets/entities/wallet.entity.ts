import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from '../users/user.entity';
import { WalletBalance } from './wallet-balance.entity';

@Entity('wallets')
export class Wallet extends BaseEntity {
  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @OneToMany(() => WalletBalance, (balance) => balance.wallet)
  balances: WalletBalance[];

  @Column({ default: 'ACTIVE' })
  status: string;
}
