import 'reflect-metadata';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import { randomUUID } from 'crypto';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { GlobalValidationPipe } from './common/pipes/global-validation.pipe';

async function bootstrap() {
  const adapter = new FastifyAdapter({
    genReqId: () => randomUUID(), // Fastify-native requestId
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    {
      bufferLogs: true,
    },
  );

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix, {
    exclude: [
      { path: '/', method: RequestMethod.GET },
      { path: '/health', method: RequestMethod.GET },
    ],
  });

  // ---------------- SWAGGER SETUP ----------------
  const swaggerConfig = new DocumentBuilder()
    .setTitle('FX Trading API')
    .setDescription('Wallet, FX Conversion & Trading API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api/docs', app, document);
  // Security headers
  await app.register(helmet);

  // Compression
  await app.register(compress);

  // CORS
  app.enableCors({
    origin: '*', // tighten in prod
    credentials: true,
  });

  // Global pipes (DTO validation safety net)
  app.useGlobalPipes(GlobalValidationPipe);

  // Global Interceptor (success responses)
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global Exception Filter (error responses)
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  Logger.log(
    `🚀 Application running at http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
