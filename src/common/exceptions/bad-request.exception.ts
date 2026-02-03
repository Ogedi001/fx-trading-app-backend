import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class BadRequestException extends AppException {
  constructor(code: string, message: string, details?: any) {
    super(code, message, HttpStatus.BAD_REQUEST, details);
  }
}
