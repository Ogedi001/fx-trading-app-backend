import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception.js';

export class ForbiddenException extends AppException {
  constructor(code = 'FORBIDDEN', message = 'Access denied') {
    super(code, message, HttpStatus.FORBIDDEN);
  }
}
