import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception.js';

export class ConflictException extends AppException {
  constructor(code: string, message: string, details?: any) {
    super(code, message, HttpStatus.CONFLICT, details);
  }
}
