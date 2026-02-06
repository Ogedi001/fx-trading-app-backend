import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ThrottlerException } from '@nestjs/throttler';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Something went wrong';
    let details: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;

      if (exception instanceof NotFoundException) {
        code = 'ROUTE_NOT_FOUND';
        message = 'The requested resource was not found';
      } else if (exception instanceof ThrottlerException) {
        code = 'RATE_LIMIT_EXCEEDED';
        message = 'Too many requests. Please try again later.';
        status = HttpStatus.TOO_MANY_REQUESTS;
      } else {
        code = res?.code || exception.name;
        message = res?.message || exception.message;
        details = res?.details;
      }
    }

    // Log the exception for debugging (stack traces will appear in server logs)
    // eslint-disable-next-line no-console
    console.error('Unhandled exception caught by GlobalExceptionFilter:', exception);

    reply.status(status).send({
      success: false,
      error: {
        code,
        message,
        details,
      },
      meta: {
        requestId: (request as any).requestId || (request as any).id,
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
