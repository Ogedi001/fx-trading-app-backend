import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class InternalServerException extends AppException {
  constructor(
    code = 'INTERNAL_SERVER_ERROR',
    message = 'Something went wrong',
    details?: any,
  ) {
    super(code, message, HttpStatus.INTERNAL_SERVER_ERROR, details);
  }
}
