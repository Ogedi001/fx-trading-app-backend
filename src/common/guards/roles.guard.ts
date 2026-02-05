import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ErrorCodes } from '../constants/error-codes';
import { ForbiddenException } from '../exceptions';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    console.log({ user });
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        ErrorCodes.AUTH_FORBIDDEN,
        'Insufficient role permission',
      );
    }

    return true;
  }
}
