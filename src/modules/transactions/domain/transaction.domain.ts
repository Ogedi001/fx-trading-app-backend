import { TransactionStatus } from 'src/common/enums/transaction-status.enum';
import { TransactionType } from 'src/common/enums/transaction-type.enum';

export class TransactionDomain {
  constructor(
    readonly id: string,
    private status: TransactionStatus,
    readonly type: TransactionType,
  ) {}

  complete() {
    if (this.status !== TransactionStatus.PENDING) {
      throw new Error('Transaction cannot be completed');
    }
    this.status = TransactionStatus.COMPLETED;
  }

  fail() {
    this.status = TransactionStatus.FAILED;
  }
}
