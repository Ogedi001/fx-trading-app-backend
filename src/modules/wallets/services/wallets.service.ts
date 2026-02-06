import { Inject, Injectable } from '@nestjs/common';
import {
  type IWalletBalanceRepository,
  type IWalletRepository,
} from '../repositories/wallet.repository.interface';
import { type ITransactionRepository } from 'src/modules/transactions/repositories/transaction.repository.interface';
import { ConflictException, NotFoundException } from 'src/common/exceptions';
import { ErrorCodes } from 'src/common/constants/error-codes';
import { Currency } from 'src/common/enums/currency.enum';
import { BalanceCalculator } from '../domain/balance-calculator';
import { WalletDomain } from '../domain/wallet.domain';
import { TransactionType } from 'src/common/enums/transaction-type.enum';
import { TransactionStatus } from 'src/common/enums/transaction-status.enum';
import { TransactionEntity } from 'src/modules/transactions/entities/transaction.entity';
import { WalletStatus } from 'src/common/enums/wallet-status.enum';
import { WalletBalanceEntity } from '../entities/wallet-balance.entity';
//import { FxCalculationService } from 'src/modules/fx/services/fx-calculation.service';

@Injectable()
export class WalletsService {
  constructor(
    @Inject('IWalletRepository')
    private readonly walletRepo: IWalletRepository,

    @Inject('IWalletBalanceRepository')
    private readonly balanceRepo: IWalletBalanceRepository,

    @Inject('ITransactionRepository')
    private readonly transactionRepo: ITransactionRepository,

    //private readonly fxCalculationService: FxCalculationService,
  ) {}

  //  Create wallet + initial NGN balance
  async createWalletForUser(userId: string) {
    const existing = await this.walletRepo.findByUserId(userId);
    if (existing) return existing;

    const wallet = await this.walletRepo.save({
      userId,
      status: WalletStatus.ACTIVE,
    } as any);

    const ngnBalance = new WalletBalanceEntity();
    ngnBalance.walletId = wallet.id;
    ngnBalance.currency = Currency.NGN;
    ngnBalance.balance = '0';

    await this.balanceRepo.save(ngnBalance);

    return wallet;
  }

  async getMyWallet(userId: string) {
    const wallet = await this.walletRepo.findByUserId(userId);
    if (!wallet) {
      throw new NotFoundException(
        ErrorCodes.WALLET_NOT_FOUND,
        'Wallet not found',
      );
    }
    return wallet;
  }

  // get balance for currency (auto-create if missing)
  async getBalance(userId: string, currency: Currency) {
    const wallet = await this.getMyWallet(userId);

    let balance = await this.balanceRepo.findByWalletAndCurrency(
      wallet.id,
      currency,
    );

    if (!balance) {
      balance = new WalletBalanceEntity();
      balance.walletId = wallet.id;
      balance.currency = currency;
      balance.balance = '0';
      await this.balanceRepo.save(balance);
    }

    return balance;
  }

  //FUND wallet
  async fundWallet(
    userId: string,
    currency: Currency,
    amount: string,
    idempotencyKey: string,
  ) {
    const wallet = await this.getMyWallet(userId);

    const domain = new WalletDomain(wallet.id, wallet.userId, wallet.status);
    domain.ensureActive();

    const existingTx =
      await this.transactionRepo.findByIdempotencyKey(idempotencyKey);
    if (existingTx) return existingTx;

    const balance = await this.getBalance(userId, currency);

    await this.balanceRepo.lockBalance(balance.id);

    balance.balance = BalanceCalculator.credit(balance.balance, amount);

    await this.balanceRepo.save(balance);

    const tx = this.transactionRepo.save({
      walletId: wallet.id,
      userId,
      type: TransactionType.FUND,
      status: TransactionStatus.COMPLETED,
      fromCurrency: currency,
      toCurrency: currency,
      fromAmount: amount,
      toAmount: amount,
      rate: '1',
      fee: '0',
      idempotencyKey,
      completedAt: new Date(),
    } as TransactionEntity);

    return tx;
  }

  async withdrawWallet(
    userId: string,
    currency: Currency,
    amount: string,
    idempotencyKey: string,
  ) {
    const wallet = await this.getMyWallet(userId);

    const balance = await this.getBalance(userId, currency);

    if (!BalanceCalculator.canDebit(balance.balance, amount)) {
      throw new ConflictException(
        ErrorCodes.WALLET_INSUFFICIENT_BALANCE,
        'Insufficient funds',
      );
    }

    const existingTx =
      await this.transactionRepo.findByIdempotencyKey(idempotencyKey);
    if (existingTx) return existingTx;

    await this.balanceRepo.lockBalance(balance.id);

    balance.balance = BalanceCalculator.debit(balance.balance, amount);
    await this.balanceRepo.save(balance);

    const tx = await this.transactionRepo.save({
      walletId: wallet.id,
      userId,
      type: TransactionType.WITHDRAW,
      status: TransactionStatus.COMPLETED,
      fromCurrency: currency,
      toCurrency: currency,
      fromAmount: amount,
      toAmount: amount,
      rate: '1',
      fee: '0',
      idempotencyKey,
      completedAt: new Date(),
    } as TransactionEntity);

    return tx;
  }

  // TRADE (FX)
  async trade(
    userId: string,
    from: Currency,
    to: Currency,
    amount: string,
    rate: string,
    idempotencyKey: string,
  ) {
    const wallet = await this.getMyWallet(userId);

    const fromBalance = await this.getBalance(userId, from);

    const toBalance = await this.getBalance(userId, to);

    if (!BalanceCalculator.canDebit(fromBalance.balance, amount)) {
      throw new ConflictException(
        ErrorCodes.WALLET_INSUFFICIENT_BALANCE,
        'Insufficient funds',
      );
    }

    const existingTx =
      await this.transactionRepo.findByIdempotencyKey(idempotencyKey);
    if (existingTx) return existingTx;

    await this.balanceRepo.lockBalance(fromBalance.id);
    await this.balanceRepo.lockBalance(toBalance.id);

    const converted = (Number(amount) * Number(rate)).toFixed(8);

    fromBalance.balance = BalanceCalculator.debit(fromBalance.balance, amount);
    toBalance.balance = BalanceCalculator.credit(toBalance.balance, converted);

    await this.balanceRepo.save(fromBalance);
    await this.balanceRepo.save(toBalance);

    return this.transactionRepo.save({
      walletId: wallet.id,
      userId,
      type: TransactionType.TRADE,
      status: TransactionStatus.COMPLETED,
      fromCurrency: from,
      toCurrency: to,
      fromAmount: amount,
      toAmount: converted,
      rate,
      fee: '0',
      idempotencyKey,
      completedAt: new Date(),
    } as TransactionEntity);
  }

  async transfer(
    senderUserId: string,
    receiverUserId: string,
    currency: Currency,
    amount: string,
    idempotencyKey: string,
  ) {
    if (senderUserId === receiverUserId) {
      throw new ConflictException(
        ErrorCodes.WALLET_TRANSFER_SELF,
        'Cannot transfer to self',
      );
    }

    const existingTx = await this.transactionRepo.findByIdempotencyKey(
      idempotencyKey + '_OUT',
    );
    if (existingTx) return existingTx;

    const senderWallet = await this.walletRepo.findByUserId(senderUserId);
    if (!senderWallet)
      throw new NotFoundException(
        ErrorCodes.WALLET_NOT_FOUND,
        'Sender wallet not found',
      );

    const receiverWallet = await this.walletRepo.findByUserId(receiverUserId);
    if (!receiverWallet)
      throw new NotFoundException(
        ErrorCodes.WALLET_NOT_FOUND,
        'Receiver wallet not found',
      );

    const senderBalance = await this.getBalance(senderUserId, currency);
    const receiverBalance = await this.getBalance(receiverUserId, currency);

    if (!BalanceCalculator.canDebit(senderBalance.balance, amount)) {
      throw new ConflictException(
        ErrorCodes.WALLET_INSUFFICIENT_BALANCE,
        'Insufficient funds',
      );
    }

    // lock in deterministic order
    await this.balanceRepo.lockBalance(senderBalance.id);
    await this.balanceRepo.lockBalance(receiverBalance.id);

    senderBalance.balance = BalanceCalculator.debit(
      senderBalance.balance,
      amount,
    );
    receiverBalance.balance = BalanceCalculator.credit(
      receiverBalance.balance,
      amount,
    );

    await this.balanceRepo.save(senderBalance);
    await this.balanceRepo.save(receiverBalance);

    const senderTx = new TransactionEntity();
    senderTx.walletId = senderWallet.id;
    senderTx.userId = senderUserId;
    senderTx.type = TransactionType.TRANSFER;
    senderTx.status = TransactionStatus.COMPLETED;
    senderTx.fromCurrency = currency;
    senderTx.toCurrency = currency;
    senderTx.fromAmount = amount;
    senderTx.toAmount = amount;
    senderTx.rate = '1';
    senderTx.fee = '0';
    senderTx.idempotencyKey = `${idempotencyKey}_OUT`;
    senderTx.metadata = { toUserId: receiverUserId };
    senderTx.completedAt = new Date();

    const receiverTx = new TransactionEntity();
    receiverTx.walletId = receiverWallet.id;
    receiverTx.userId = receiverUserId;
    receiverTx.type = TransactionType.TRANSFER;
    receiverTx.status = TransactionStatus.COMPLETED;
    receiverTx.fromCurrency = currency;
    receiverTx.toCurrency = currency;
    receiverTx.fromAmount = amount;
    receiverTx.toAmount = amount;
    receiverTx.rate = '1';
    receiverTx.fee = '0';
    receiverTx.idempotencyKey = `${idempotencyKey}_IN`;
    receiverTx.metadata = { fromUserId: senderUserId };
    receiverTx.completedAt = new Date();

    await this.transactionRepo.save(senderTx);
    await this.transactionRepo.save(receiverTx);

    return senderTx;
  }
}
