import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UnauthorizedException } from '../exceptions';
import { ErrorCodes } from '../constants/error-codes';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user.isVerified) {
      throw new UnauthorizedException(ErrorCodes.AUTH_EMAIL_NOT_VERIFIED);
    }

    return true;
  }
}
