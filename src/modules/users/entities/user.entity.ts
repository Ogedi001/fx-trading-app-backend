import { BaseEntity } from 'src/common/base/base.entity';
import { UserRole } from 'src/common/enums/user-role.enum';
import { WalletEntity } from 'src/modules/wallets/entities/wallet.entity';
import { Entity, Column, OneToOne, Index } from 'typeorm';

@Entity('users')
@Index(['email'], { unique: true })
export class UserEntity extends BaseEntity {
  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @OneToOne(() => WalletEntity, (wallet) => wallet.user)
  wallet: WalletEntity;
}
