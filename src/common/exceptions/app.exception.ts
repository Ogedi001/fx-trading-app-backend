import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    code: string,
    message: string,
    status: HttpStatus,
    details?: any,
  ) {
    super({ code, message, details }, status);
  }
}
