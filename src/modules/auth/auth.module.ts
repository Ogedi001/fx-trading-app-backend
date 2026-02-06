// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
//import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { StringValue } from 'ms';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TokenService } from './services/token.service';

import { JwtStrategy } from './strategies/jwt.strategy';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  imports: [
    // PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fx_secret_key',
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN ?? '1d') as StringValue,
      },
    }),
    UsersModule,
    NotificationsModule,
    WalletsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, TokenService],
  exports: [AuthService, TokenService],
})
export class AuthModule {}
