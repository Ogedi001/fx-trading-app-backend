// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
//import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { StringValue } from 'ms';

//import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    // PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fx_secret_key',
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN ?? '1d') as StringValue,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService /*JwtStrategy*/],
  exports: [AuthService],
})
export class AuthModule {}
