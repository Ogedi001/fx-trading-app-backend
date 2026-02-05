import { Inject, Injectable } from '@nestjs/common';
import type { IUserRepository } from '../repositories/user.repository.interface';
import { UserDomain } from '../domain/user.domain';
import { UserEntity } from '../entities/user.entity';
import { NotFoundException } from 'src/common/exceptions';
import { ErrorCodes } from 'src/common/constants/error-codes';

@Injectable()
export class UsersService {
  constructor(
    private readonly userDomain: UserDomain,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findByEmail(email);
  }

  findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findById(id);
  }

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.findAll();
  }

  async create(data: Partial<UserEntity>): Promise<UserEntity> {
    const user = this.userDomain.createUser(data);
    return this.userRepository.save(user);
  }

  async markVerified(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(ErrorCodes.USER_NOT_FOUND, 'user not found');
    }
    user.isVerified = true;
    await this.userRepository.save(user);
  }
}
