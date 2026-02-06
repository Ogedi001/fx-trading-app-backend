import { Inject, Injectable } from '@nestjs/common';
import { type ITransactionRepository } from '../repositories/transaction.repository.interface';
import { TransactionEntity } from '../entities/transaction.entity';
import { ForbiddenException, NotFoundException } from 'src/common/exceptions';
import { ErrorCodes } from 'src/common/constants/error-codes';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class TransactionsService {
  constructor(
    @Inject('ITransactionRepository')
    private readonly transactionRepo: ITransactionRepository,
  ) {}

  async findAllForUser(userId: string): Promise<TransactionEntity[]> {
    return this.transactionRepo.findAllByUser(userId);
  }

  async findById(id: string, user: any): Promise<TransactionEntity> {
    const tx = await this.transactionRepo.findById(id);

    if (!tx) {
      throw new NotFoundException(
        ErrorCodes.TRANSACTION_NOT_FOUND,
        'Transaction not found',
      );
    }

    // Owner or admin/support
    if (
      tx.userId !== user.userId &&
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.SUPPORT
    ) {
      throw new ForbiddenException(
        ErrorCodes.AUTH_FORBIDDEN,
        'You cannot access this transaction',
      );
    }

    return tx;
  }
}
