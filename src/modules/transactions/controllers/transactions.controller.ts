import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { TransactionsService } from '../services/transactions.service';

@ApiTags('Transactions')
@ApiBearerAuth('access-token')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get user transactions',
    description: 'Retrieves all transactions for the authenticated user. Users only see their own transactions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
    example: [
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
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyTransactions(@CurrentUser() user) {
    return this.transactionsService.findAllForUser(user.userId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT, UserRole.USER)
  @ApiOperation({
    summary: 'Get transaction details',
    description: 'Retrieves details of a specific transaction. Users can only see their own transactions. ADMIN and SUPPORT can see any transaction.',
  })
  @ApiParam({
    name: 'id',
    description: 'Transaction ID',
    example: 'transaction-uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction details retrieved successfully',
    example: {
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
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - cannot view other user transactions' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransactionById(@Param('id') id: string, @CurrentUser() user) {
    return this.transactionsService.findById(id, user);
  }
}
