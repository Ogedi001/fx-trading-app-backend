import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UnauthorizedException } from '../exceptions';
import { ErrorCodes } from '../constants/error-codes';
import { UsersService } from 'src/modules/users/services/users.service';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log({ user });
    const dbUser = await this.usersService.findById(user.id);
    console.log({ dbUser });
    if (!dbUser) {
      throw new UnauthorizedException(ErrorCodes.USER_NOT_FOUND);
    }

    if (!dbUser.isVerified) {
      throw new UnauthorizedException(ErrorCodes.AUTH_EMAIL_NOT_VERIFIED);
    }

    return true;
  }
}
