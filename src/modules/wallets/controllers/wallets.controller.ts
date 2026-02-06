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
import { UserEntity } from 'src/modules/users/entities/user.entity';

@ApiTags('Wallets')
@ApiBearerAuth('access-token')
@UseGuards(EmailVerifiedGuard)
@Controller('wallets')
export class WalletsController {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly fxCalculationService: FxCalculationService,
  ) {}

  /* ================= GET WALLET ================= */

  @Get('me')
  @ApiOperation({ summary: 'Get user wallet information' })
  @ApiResponse({
    status: 200,
    description: 'Wallet retrieved successfully',
    example: {
      message: 'Wallet retrieved successfully',
      data: {
        id: 'wallet-uuid',
        userId: 'user-uuid',
        balances: [
          { currency: 'NGN', balance: '50000.00' },
          { currency: 'USD', balance: '100.00' },
        ],
      },
    },
  })
  async getMyWallet(@CurrentUser('id') user: UserEntity) {
    const wallet = await this.walletsService.getMyWallet(user.id);
    return {
      message: 'Wallet retrieved successfully',
      data: wallet,
    };
  }

  /* ================= GET BALANCE ================= */

  @Get('balance/:currency')
  @ApiOperation({ summary: 'Get wallet balance for currency' })
  @ApiParam({ name: 'currency', enum: Currency })
  @ApiResponse({
    status: 200,
    example: {
      message: 'Balance retrieved successfully',
      data: {
        currency: 'NGN',
        balance: '50000.00',
      },
    },
  })
  async getBalance(
    @CurrentUser('id') user: UserEntity,
    @Param('currency') currency: Currency,
  ) {
    const balance = await this.walletsService.getBalanceReadOnly(
      user.id,
      currency,
    );
    return {
      message: 'Balance retrieved successfully',
      data: balance,
    };
  }

  /* ================= FUND ================= */

  @Post('fund')
  @ApiOperation({
    summary: 'Fund wallet',
    description: `
Adds funds to the wallet.

<span style="color:red"><b>NOTE:</b> idempotencyKey must be unique for every request. Duplicate keys will return the previous transaction.</span>
`,
  })
  @ApiResponse({
    status: 201,
    example: {
      message: 'Wallet funded successfully',
      data: {
        id: 'tx-uuid',
        status: 'COMPLETED',
        amount: '1000.00',
        currency: 'NGN',
      },
    },
  })
  async fund(@CurrentUser('id') user: UserEntity, @Body() dto: FundWalletDto) {
    const tx = await this.walletsService.fundWallet(
      user.id,
      dto.currency,
      dto.amount,
      dto.idempotencyKey,
    );

    return {
      message: 'Wallet funded successfully',
      data: tx,
    };
  }

  /* ================= WITHDRAW ================= */

  @Post('withdraw')
  @ApiOperation({
    summary: 'Withdraw funds',
    description: `
Withdraws funds from wallet.

<span style="color:red"><b>NOTE:</b> idempotencyKey must be unique for every request.</span>
`,
  })
  @ApiResponse({
    status: 201,
    example: {
      message: 'Withdrawal successful',
      data: {
        id: 'tx-uuid',
        status: 'COMPLETED',
        amount: '500.00',
        currency: 'NGN',
      },
    },
  })
  async withdraw(
    @CurrentUser('id') user: UserEntity,
    @Body() dto: WithdrawWalletDto,
  ) {
    const tx = await this.walletsService.withdrawWallet(
      user.id,
      dto.currency,
      dto.amount,
      dto.idempotencyKey,
    );

    return {
      message: 'Withdrawal successful',
      data: tx,
    };
  }

  /* ================= CONVERT (QUOTE ONLY) ================= */

  @Get('convert')
  @ApiOperation({ summary: 'Preview FX conversion' })
  @ApiQuery({
    name: 'from',
    enum: Currency,
    description: 'Source currency',
    example: Currency.NGN,
  })
  @ApiQuery({
    name: 'to',
    enum: Currency,
    description: 'Target currency',
    example: Currency.USD,
  })
  @ApiQuery({
    name: 'amount',
    type: String,
    description: 'Amount to convert',
    example: '1000.00',
  })
  @ApiResponse({
    status: 200,
    example: {
      message: 'Conversion calculated successfully',
      data: {
        from: 'NGN',
        to: 'USD',
        amount: '1000.00',
        convertedAmount: '2.50',
        rate: '0.0025',
      },
    },
  })
  async convert(
    @Query('from') from: Currency,
    @Query('to') to: Currency,
    @Query('amount') amount: string,
  ) {
    const result = await this.fxCalculationService.convert(from, to, amount);

    return {
      message: 'Conversion calculated successfully',
      data: result,
    };
  }

  /* ================= TRADE ================= */

  @Post('trade')
  @ApiOperation({
    summary: 'Execute FX trade',
    description: `
Converts funds between currencies.

<span style="color:red"><b>NOTE:</b> idempotencyKey must be unique for every trade request.</span>
`,
  })
  @ApiResponse({
    status: 201,
    example: {
      message: 'Trade successful',
      data: {
        id: 'tx-uuid',
        fromCurrency: 'NGN',
        toCurrency: 'USD',
        fromAmount: '1000.00',
        toAmount: '2.50',
        status: 'COMPLETED',
      },
    },
  })
  async trade(@CurrentUser('id') user: UserEntity, @Body() dto: ConvertDto) {
    const tx = await this.walletsService.trade(
      user.id,
      dto.fromCurrency,
      dto.toCurrency,
      dto.amount,
      dto.idempotencyKey,
    );

    return {
      message: 'Trade successful',
      data: tx,
    };
  }

  /* ================= TRANSFER ================= */

  @Post('transfer')
  @ApiOperation({
    summary: 'Transfer funds',
    description: `
Transfers funds to another user.

<span style="color:red"><b>NOTE:</b> idempotencyKey must be unique for every transfer request.</span>
`,
  })
  @ApiResponse({
    status: 201,
    example: {
      message: 'Transfer successful',
      data: {
        id: 'tx-uuid',
        currency: 'NGN',
        amount: '500.00',
        fromUserId: 'user-uuid',
        toUserId: 'recipient-uuid',
        status: 'COMPLETED',
      },
    },
  })
  async transfer(
    @CurrentUser('id') user: UserEntity,
    @Body() dto: TransferDto,
  ) {
    const tx = await this.walletsService.transfer(
      user.id,
      dto.toUserId,
      dto.currency,
      dto.amount,
      dto.idempotencyKey,
    );

    return {
      message: 'Transfer successful',
      data: tx,
    };
  }
}
