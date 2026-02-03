import { BaseEntity, Entity, Column, OneToOne } from 'typeorm';
import { Wallet } from '../wallets/wallet.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ default: false })
  isVerified: boolean;

  @OneToOne(() => Wallet, (wallet) => wallet.user)
  wallet: Wallet;
}
