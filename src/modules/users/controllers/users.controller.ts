import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UserEntity } from '../entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns the profile information of the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user profile retrieved successfully',
    example: {
      id: 'uuid',
      email: 'user@example.com',
      emailVerified: true,
      role: 'USER',
      createdAt: '2026-02-06T00:00:00Z',
      updatedAt: '2026-02-06T00:00:00Z',
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  async me(@CurrentUser() user: UserEntity) {
    return user;
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({
    summary: 'Get all users',
    description:
      'Retrieves a list of all users. Only accessible by ADMIN and SUPPORT roles.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all users retrieved successfully',
    example: [
      {
        id: 'uuid',
        email: 'user@example.com',
        emailVerified: true,
        role: 'USER',
        createdAt: '2026-02-06T00:00:00Z',
        updatedAt: '2026-02-06T00:00:00Z',
      },
    ],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async findAll() {
    return this.usersService.findAll();
  }
}
