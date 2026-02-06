import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Currency } from 'src/common/enums/currency.enum';
import { WalletsService } from '../services/wallets.service';
import {
  ConvertDto,
  FundWalletDto,
  TransferDto,
  WithdrawWalletDto,
} from '../dto/wallet.dto';
import { FxCalculationService } from 'src/modules/fx/services/fx-calculation.service';
import { EmailVerifiedGuard } from 'src/common/guards/email-verified.guard';

@ApiTags('Wallets')
@ApiBearerAuth('access-token')
@UseGuards(EmailVerifiedGuard)
@Controller('wallets')
export class WalletsController {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly fxCalculationService: FxCalculationService,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get user wallet information',
    description:
      'Retrieves the complete wallet information for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Wallet information retrieved successfully',
    example: {
      id: 'wallet-uuid',
      userId: 'user-uuid',
      balances: [
        { currency: 'NGN', amount: '50000.00' },
        { currency: 'USD', amount: '100.00' },
      ],
      createdAt: '2026-02-06T00:00:00Z',
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMyWallet(@CurrentUser('id') userId: string) {
    return this.walletsService.getMyWallet(userId);
  }

  @Get('balance/:currency')
  @ApiOperation({
    summary: 'Get wallet balance for specific currency',
    description: 'Retrieves the balance of the wallet for a specified currency',
  })
  @ApiParam({
    name: 'currency',
    enum: Currency,
    description: 'Currency code (NGN, USD, EUR, GBP, etc.)',
    example: 'NGN',
  })
  @ApiResponse({
    status: 200,
    description: 'Balance retrieved successfully',
    example: {
      currency: 'NGN',
      amount: '50000.00',
      userId: 'user-uuid',
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Currency not found in wallet' })
  getBalance(
    @CurrentUser('id') userId: string,
    @Param('currency') currency: Currency,
  ) {
    return this.walletsService.getBalance(userId, currency);
  }

  @Post('fund')
  @ApiOperation({
    summary: 'Fund wallet with money',
    description: 'Adds funds to the user wallet in the specified currency',
  })
  @ApiResponse({
    status: 201,
    description: 'Wallet funded successfully',
    example: {
      id: 'transaction-uuid',
      status: 'COMPLETED',
      amount: '1000.00',
      currency: 'NGN',
      message: 'Wallet funded successfully',
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid amount or currency' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 409,
    description: 'Duplicate transaction (idempotency key)',
  })
  fund(@CurrentUser('id') userId: string, @Body() dto: FundWalletDto) {
    return this.walletsService.fundWallet(
      userId,
      dto.currency,
      dto.amount,
      dto.idempotencyKey,
    );
  }

  @Post('withdraw')
  @ApiOperation({
    summary: 'Withdraw funds from wallet',
    description:
      'Withdraws funds from the user wallet in the specified currency',
  })
  @ApiResponse({
    status: 201,
    description: 'Withdrawal successful',
    example: {
      id: 'transaction-uuid',
      status: 'COMPLETED',
      amount: '500.00',
      currency: 'NGN',
      message: 'Withdrawal successful',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid amount or insufficient balance',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 409,
    description: 'Duplicate transaction (idempotency key)',
  })
  withdraw(@CurrentUser('id') userId: string, @Body() dto: WithdrawWalletDto) {
    return this.walletsService.withdrawWallet(
      userId,
      dto.currency,
      dto.amount,
      dto.idempotencyKey,
    );
  }

  @Get('convert')
  @ApiOperation({
    summary: 'Calculate currency conversion rate',
    description:
      'Calculates the converted amount for currency exchange without executing the transaction',
  })
  @ApiQuery({
    name: 'from',
    enum: Currency,
    description: 'Source currency code',
    example: 'NGN',
  })
  @ApiQuery({
    name: 'to',
    enum: Currency,
    description: 'Target currency code',
    example: 'USD',
  })
  @ApiQuery({
    name: 'amount',
    type: 'string',
    description: 'Amount to convert',
    example: '1000.00',
  })
  @ApiResponse({
    status: 200,
    description: 'Conversion calculated successfully',
    example: {
      from: 'NGN',
      to: 'USD',
      amount: '1000.00',
      convertedAmount: '2.50',
      rate: '0.0025',
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid currencies or amount' })
  async convert(
    @Query('from') from: Currency,
    @Query('to') to: Currency,
    @Query('amount') amount: string,
  ) {
    return this.fxCalculationService.convert(from, to, amount);
  }

  @Post('trade')
  @ApiOperation({
    summary: 'Execute currency trade',
    description:
      'Converts funds from one currency to another and updates wallet balance. Deducts from source and adds to target currency.',
  })
  @ApiResponse({
    status: 201,
    description: 'Trade executed successfully',
    example: {
      id: 'transaction-uuid',
      status: 'COMPLETED',
      fromCurrency: 'NGN',
      toCurrency: 'USD',
      amountSent: '1000.00',
      amountReceived: '2.50',
      rate: '0.0025',
      message: 'Trade successful',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid currencies or insufficient balance',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 409,
    description: 'Duplicate transaction (idempotency key)',
  })
  trade(@CurrentUser('id') userId: string, @Body() dto: ConvertDto) {
    return this.walletsService.trade(
      userId,
      dto.fromCurrency,
      dto.toCurrency,
      dto.amount,
      dto.rate,
      dto.idempotencyKey,
    );
  }

  @Post('transfer')
  @ApiOperation({
    summary: 'Transfer funds to another user',
    description:
      'Transfers funds from user wallet to another user wallet in the specified currency',
  })
  @ApiResponse({
    status: 201,
    description: 'Transfer successful',
    example: {
      id: 'transaction-uuid',
      status: 'COMPLETED',
      amount: '500.00',
      currency: 'NGN',
      fromUserId: 'user-uuid',
      toUserId: 'recipient-user-uuid',
      message: 'Transfer successful',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid recipient or insufficient balance',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Recipient user not found' })
  @ApiResponse({
    status: 409,
    description: 'Duplicate transaction (idempotency key)',
  })
  transfer(@CurrentUser('id') userId: string, @Body() dto: TransferDto) {
    return this.walletsService.transfer(
      userId,
      dto.toUserId,
      dto.currency,
      dto.amount,
      dto.idempotencyKey,
    );
  }
}
