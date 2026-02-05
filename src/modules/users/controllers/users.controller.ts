import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UserEntity } from '../entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users/me
  @Get('me')
  async me(@CurrentUser() user: UserEntity) {
    return user;
  }

  // GET /users (ADMIN & SUPPORT only)
  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  async findAll() {
    return this.usersService.findAll();
  }
}
