import { ErrorCodes } from 'src/common/constants/error-codes';
import { WalletStatus } from 'src/common/enums/wallet-status.enum';
import { ConflictException } from 'src/common/exceptions/conflict.exception';

export class WalletDomain {
  constructor(
    readonly id: string,
    readonly userId: string,
    private status: WalletStatus,
  ) {}

  ensureActive() {
    if (this.status !== WalletStatus.ACTIVE) {
      throw new ConflictException(
        ErrorCodes.WALLET_INACTIVE,
        'Wallet is not active',
      );
    }
  }

  lock() {
    this.status = WalletStatus.LOCKED;
  }

  suspend() {
    this.status = WalletStatus.SUSPENDED;
  }
}
