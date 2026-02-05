import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class RateLimitException extends AppException {
  constructor(
    code = 'RATE_LIMIT_EXCEEDED',
    message = 'Too many requests. Please try again later.',
  ) {
    super(code, message, HttpStatus.TOO_MANY_REQUESTS);
  }
}
