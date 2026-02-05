// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { UserDomain } from './domain/user.domain';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [
    UserRepository,
    { provide: 'IUserRepository', useClass: UserRepository },
    UserDomain,
    UsersService,
  ],
  exports: ['IUserRepository', UsersService],
})
export class UsersModule {}
