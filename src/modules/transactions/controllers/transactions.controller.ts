import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { TransactionsService } from '../services/transactions.service';
import { ParseUUIDPipe } from '@nestjs/common';
import { UserEntity } from 'src/modules/users/entities/user.entity';

@ApiTags('Transactions')
@ApiBearerAuth('access-token')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get user transactions',
    description:
      'Retrieves all transactions for the authenticated user. Users only see their own transactions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
    example: {
      message: 'Transactions retrieved successfully',
      data: [
        {
          id: 'transaction-uuid',
          userId: 'user-uuid',
          type: 'TRANSFER',
          status: 'COMPLETED',
          amount: '500.00',
          currency: 'NGN',
          fromUserId: 'user-uuid',
          toUserId: 'recipient-uuid',
          createdAt: '2026-02-06T00:00:00Z',
          updatedAt: '2026-02-06T00:00:00Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyTransactions(@CurrentUser() user) {
    const transactions = await this.transactionsService.findAllForUser(
      user.userId,
    );
    return {
      message: 'Transactions retrieved successfully',
      data: transactions,
    };
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT, UserRole.USER)
  @ApiOperation({
    summary: 'Get transaction details',
    description:
      'Retrieves details of a specific transaction. Users can only see their own transactions. ADMIN and SUPPORT can see any transaction.',
  })
  @ApiParam({
    name: 'id',
    description: 'Transaction ID (UUID)',
    example: '18f29e0b-7eac-4cac-bb01-2d607ebfe28a',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction details retrieved successfully',
    example: {
      message: 'Transaction details retrieved successfully',
      data: {
        id: 'transaction-uuid',
        userId: 'user-uuid',
        type: 'TRANSFER',
        status: 'COMPLETED',
        amount: '500.00',
        currency: 'NGN',
        fromUserId: 'user-uuid',
        toUserId: 'recipient-uuid',
        description: 'Payment transfer',
        createdAt: '2026-02-06T00:00:00Z',
        updatedAt: '2026-02-06T00:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - cannot view other user transactions',
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransactionById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: UserEntity,
  ) {
    const transaction = await this.transactionsService.findById(id, user);
    return {
      message: 'Transaction details retrieved successfully',
      data: transaction,
    };
  }
}
