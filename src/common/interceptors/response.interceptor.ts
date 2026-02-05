import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((response) => {
        return {
          success: true,
          message: response?.message || 'Request successful',
          data: response?.data ?? response,
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: process.env.API_VERSION || 'v1',
            extra: response?.metaExtra,
          },
        };
      }),
    );
  }
}
