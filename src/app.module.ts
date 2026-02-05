import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import databaseConfig from './config/db.config.js';
import { StringValue } from 'ms';

import { AuthModule } from './modules/auth/auth.module.js';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module.js';
import { WalletsModule } from './modules/wallets/wallets.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { TransactionsModule } from './modules/transactions/transactions.module.js';
import { FxModule } from './modules/fx/fx.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { RedisModule } from './infrastructure/redis/redis.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard.js';
import { JwtModule } from '@nestjs/jwt';
import { HealthModule } from './modules/health/health.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [databaseConfig],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 100,
      },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fx_secret_key',
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN ?? '1d') as StringValue,
      },
    }),

    RedisModule,
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    WalletsModule,
    TransactionsModule,
    FxModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
