import { UserRole } from 'src/common/enums/user-role.enum';
import { ForbiddenException } from 'src/common/exceptions/forbidden.exception';
import { UserEntity } from '../entities/user.entity';

export class UserDomain {
  constructor(
    readonly id: string,
    readonly email: string,
    private isVerified: boolean,
    private role: UserRole,
  ) {}

  verifyEmail() {
    this.isVerified = true;
  }

  ensureAdmin() {
    if (this.role !== UserRole.ADMIN) {
      throw new ForbiddenException('', 'admin access required');
    }
  }

  canTrade(): boolean {
    return this.isVerified;
  }

  createUser(data: Partial<UserEntity>): UserEntity {
    console.log('Creating user with data:', data);
    const user = new UserEntity();
    user.email = data.email!;
    user.role = data.role ?? UserRole.USER;
    user.isVerified = false;
    user.password = data.password!;
    return user;
  }
}
