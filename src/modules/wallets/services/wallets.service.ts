import { Inject, Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { ConflictException, NotFoundException } from 'src/common/exceptions';
import { ErrorCodes } from 'src/common/constants/error-codes';

import { Currency } from 'src/common/enums/currency.enum';
import { TransactionType } from 'src/common/enums/transaction-type.enum';
import { TransactionStatus } from 'src/common/enums/transaction-status.enum';
import { WalletStatus } from 'src/common/enums/wallet-status.enum';

import { WalletEntity } from '../entities/wallet.entity';
import { WalletBalanceEntity } from '../entities/wallet-balance.entity';
import { TransactionEntity } from 'src/modules/transactions/entities/transaction.entity';

import {
  type IWalletRepository,
  type IWalletBalanceRepository,
} from '../repositories/wallet.repository.interface';
import { type ITransactionRepository } from 'src/modules/transactions/repositories/transaction.repository.interface';

import { BalanceCalculator } from '../domain/balance-calculator';
import { WalletDomain } from '../domain/wallet.domain';
import { FxService } from 'src/modules/fx/services/fx.service';
@Injectable()
export class WalletsService {
  constructor(
    @Inject('IWalletRepository')
    private readonly walletRepo: IWalletRepository,

    @Inject('IWalletBalanceRepository')
    private readonly balanceRepo: IWalletBalanceRepository,

    @Inject('ITransactionRepository')
    private readonly transactionRepo: ITransactionRepository,

    private readonly fxService: FxService,
    private readonly dataSource: DataSource,
  ) {}

  /* ================= READ ================= */

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

  async getBalanceReadOnly(userId: string, currency: Currency) {
    const wallet = await this.getMyWallet(userId);

    let balance = await this.balanceRepo.findByWalletAndCurrency(
      wallet.id,
      currency,
    );

    if (!balance) {
      balance = await this.balanceRepo.save({
        walletId: wallet.id,
        currency,
        balance: '0',
      } as WalletBalanceEntity);
    }

    return balance;
  }

  async getBalance(
    userId: string,
    currency: Currency,
    queryRunner: QueryRunner,
  ) {
    const wallet = await this.walletRepo.findByUserId(userId, queryRunner);
    if (!wallet) {
      throw new NotFoundException(
        ErrorCodes.WALLET_NOT_FOUND,
        'Wallet not found',
      );
    }

    let balance = await this.balanceRepo.findByWalletAndCurrency(
      wallet.id,
      currency,
      queryRunner,
    );

    if (!balance) {
      balance = await this.balanceRepo.save(
        {
          walletId: wallet.id,
          currency,
          balance: '0',
        } as WalletBalanceEntity,
        queryRunner,
      );
    }

    return { wallet, balance };
  }

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

  /* ================= FUND ================= */

  async fundWallet(
    userId: string,
    currency: Currency,
    amount: string,
    idempotencyKey: string,
  ) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const existingTx = await this.transactionRepo.findByIdempotencyKey(
        userId,
        idempotencyKey,
        qr,
      );
      if (existingTx) return existingTx;

      const { wallet, balance } = await this.getBalance(userId, currency, qr);

      new WalletDomain(wallet.id, wallet.userId, wallet.status).ensureActive();

      await this.balanceRepo.lockBalance(balance.id, qr);

      balance.balance = BalanceCalculator.credit(balance.balance, amount);
      await this.balanceRepo.save(balance, qr);

      const tx = await this.transactionRepo.save(
        {
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
        } as TransactionEntity,
        qr,
      );

      await qr.commitTransaction();
      return tx;
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  /* ================= WITHDRAW ================= */

  async withdrawWallet(
    userId: string,
    currency: Currency,
    amount: string,
    idempotencyKey: string,
  ) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const existingTx = await this.transactionRepo.findByIdempotencyKey(
        userId,
        idempotencyKey,
        qr,
      );
      if (existingTx) return existingTx;

      const { wallet, balance } = await this.getBalance(userId, currency, qr);

      new WalletDomain(wallet.id, wallet.userId, wallet.status).ensureActive();

      if (!BalanceCalculator.canDebit(balance.balance, amount)) {
        throw new ConflictException(
          ErrorCodes.WALLET_INSUFFICIENT_BALANCE,
          'Insufficient funds',
        );
      }

      await this.balanceRepo.lockBalance(balance.id, qr);

      balance.balance = BalanceCalculator.debit(balance.balance, amount);
      await this.balanceRepo.save(balance, qr);

      const tx = await this.transactionRepo.save(
        {
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
        } as TransactionEntity,
        qr,
      );

      await qr.commitTransaction();
      return tx;
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  /* ================= TRADE ================= */

  async trade(
    userId: string,
    from: Currency,
    to: Currency,
    amount: string,
    idempotencyKey: string,
  ) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const existingTx = await this.transactionRepo.findByIdempotencyKey(
        userId,
        idempotencyKey,
        qr,
      );
      if (existingTx) return existingTx;

      const { wallet, balance: fromBalance } = await this.getBalance(
        userId,
        from,
        qr,
      );
      const { balance: toBalance } = await this.getBalance(userId, to, qr);

      new WalletDomain(wallet.id, wallet.userId, wallet.status).ensureActive();

      if (!BalanceCalculator.canDebit(fromBalance.balance, amount)) {
        throw new ConflictException(
          ErrorCodes.WALLET_INSUFFICIENT_BALANCE,
          'Insufficient funds',
        );
      }

      const [first, second] =
        fromBalance.id < toBalance.id
          ? [fromBalance, toBalance]
          : [toBalance, fromBalance];

      await this.balanceRepo.lockBalance(first.id, qr);
      await this.balanceRepo.lockBalance(second.id, qr);

      const { rate } = await this.fxService.getRate(from, to);
      const converted = BalanceCalculator.multiply(amount, rate);

      fromBalance.balance = BalanceCalculator.debit(
        fromBalance.balance,
        amount,
      );
      toBalance.balance = BalanceCalculator.credit(
        toBalance.balance,
        converted,
      );

      await this.balanceRepo.save(fromBalance, qr);
      await this.balanceRepo.save(toBalance, qr);

      const tx = await this.transactionRepo.save(
        {
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
        } as TransactionEntity,
        qr,
      );

      await qr.commitTransaction();
      return tx;
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  /* ================= TRANSFER ================= */

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

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const existingTx = await this.transactionRepo.findByIdempotencyKey(
        `${senderUserId}`,
        `${idempotencyKey}_OUT`,
        qr,
      );
      if (existingTx) return existingTx;

      const { wallet: senderWallet, balance: senderBalance } =
        await this.getBalance(senderUserId, currency, qr);
      const { wallet: receiverWallet, balance: receiverBalance } =
        await this.getBalance(receiverUserId, currency, qr);

      new WalletDomain(
        senderWallet.id,
        senderWallet.userId,
        senderWallet.status,
      ).ensureActive();

      new WalletDomain(
        receiverWallet.id,
        receiverWallet.userId,
        receiverWallet.status,
      ).ensureActive();

      if (!BalanceCalculator.canDebit(senderBalance.balance, amount)) {
        throw new ConflictException(
          ErrorCodes.WALLET_INSUFFICIENT_BALANCE,
          'Insufficient funds',
        );
      }

      const [first, second] =
        senderBalance.id < receiverBalance.id
          ? [senderBalance, receiverBalance]
          : [receiverBalance, senderBalance];

      await this.balanceRepo.lockBalance(first.id, qr);
      await this.balanceRepo.lockBalance(second.id, qr);

      senderBalance.balance = BalanceCalculator.debit(
        senderBalance.balance,
        amount,
      );
      receiverBalance.balance = BalanceCalculator.credit(
        receiverBalance.balance,
        amount,
      );

      await this.balanceRepo.save(senderBalance, qr);
      await this.balanceRepo.save(receiverBalance, qr);

      await this.transactionRepo.save(
        {
          walletId: senderWallet.id,
          userId: senderUserId,
          type: TransactionType.TRANSFER,
          status: TransactionStatus.COMPLETED,
          fromCurrency: currency,
          toCurrency: currency,
          fromAmount: amount,
          toAmount: amount,
          rate: '1',
          fee: '0',
          idempotencyKey: `${idempotencyKey}_OUT`,
          metadata: { toUserId: receiverUserId },
          completedAt: new Date(),
        },
        qr,
      );

      const receiverTx = await this.transactionRepo.save(
        {
          walletId: receiverWallet.id,
          userId: receiverUserId,
          type: TransactionType.TRANSFER,
          status: TransactionStatus.COMPLETED,
          fromCurrency: currency,
          toCurrency: currency,
          fromAmount: amount,
          toAmount: amount,
          rate: '1',
          fee: '0',
          idempotencyKey: `${idempotencyKey}_IN`,
          metadata: { fromUserId: senderUserId },
          completedAt: new Date(),
        },
        qr,
      );

      await qr.commitTransaction();
      return receiverTx;
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }
}
