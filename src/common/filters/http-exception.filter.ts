import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : {};

    const code = exceptionResponse['code'] || 'INTERNAL_SERVER_ERROR';

    const message = exceptionResponse['message'] || 'Something went wrong';

    const details = exceptionResponse['details'];

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        details,
      },
      meta: {
        requestId: request.requestId,
        timestamp: new Date().toISOString(),
        version: process.env.API_VERSION || 'v1',
        extra: {
          path: request.url,
          method: request.method,
        },
      },
    });
  }
}
