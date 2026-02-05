import { ValidationPipe, HttpStatus } from '@nestjs/common';
import { AppException } from '../exceptions/app.exception';

export const GlobalValidationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  exceptionFactory: (errors) => {
    const formattedErrors = errors.map((err) => ({
      field: err.property,
      message: Object.values(err.constraints || {}).join(', '),
    }));

    return new AppException(
      'VALIDATION_ERROR',
      'Invalid input provided',
      HttpStatus.UNPROCESSABLE_ENTITY,
      formattedErrors,
    );
  },
});
