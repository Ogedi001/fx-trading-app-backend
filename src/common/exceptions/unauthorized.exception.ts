import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class UnauthorizedException extends AppException {
  constructor(code = 'UNAUTHORIZED', message = 'Authentication required') {
    super(code, message, HttpStatus.UNAUTHORIZED);
  }
}
