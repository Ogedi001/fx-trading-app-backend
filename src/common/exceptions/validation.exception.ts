import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class ValidationException extends AppException {
  constructor(details: any) {
    super(
      'VALIDATION_ERROR',
      'Invalid input provided',
      HttpStatus.UNPROCESSABLE_ENTITY,
      details,
    );
  }
}
