import { ApiProperty } from '@nestjs/swagger';
import { Currency } from 'src/common/enums/currency.enum';

export class FundWalletDto {
  @ApiProperty({
    enum: Currency,
    description: 'Currency code (NGN, USD, EUR, GBP, etc.)',
    example: Currency.NGN,
  })
  currency: Currency;

  @ApiProperty({
    example: '1000.00',
    description: 'Amount to fund wallet with (must be greater than 0)',
  })
  amount: string;

  @ApiProperty({
    example: 'idem-key-12345',
    description: 'Idempotency key to prevent duplicate transactions',
  })
  idempotencyKey: string;
}

export class WithdrawWalletDto {
  @ApiProperty({
    enum: Currency,
    description: 'Currency code (NGN, USD, EUR, GBP, etc.)',
    example: Currency.NGN,
  })
  currency: Currency;

  @ApiProperty({
    example: '500.00',
    description: 'Amount to withdraw (must not exceed wallet balance)',
  })
  amount: string;

  @ApiProperty({
    example: 'idem-key-12345',
    description: 'Idempotency key to prevent duplicate transactions',
  })
  idempotencyKey: string;
}

export class ConvertDto {
  @ApiProperty({
    enum: Currency,
    description: 'Source currency code',
    example: Currency.NGN,
  })
  fromCurrency: Currency;

  @ApiProperty({
    enum: Currency,
    description: 'Target currency code',
    example: Currency.USD,
  })
  toCurrency: Currency;

  @ApiProperty({
    example: '1000.00',
    description: 'Amount to convert',
  })
  amount: string;

  @ApiProperty({
    example: '0.0025',
    description: 'Exchange rate for conversion',
  })
  rate: string;

  @ApiProperty({
    example: 'idem-key-12345',
    description: 'Idempotency key to prevent duplicate transactions',
  })
  idempotencyKey: string;
}

export class TransferDto {
  @ApiProperty({
    example: 'recipient-user-id',
    description: 'ID of the user to transfer funds to',
  })
  toUserId: string;

  @ApiProperty({
    enum: Currency,
    description: 'Currency code for transfer',
    example: Currency.NGN,
  })
  currency: Currency;

  @ApiProperty({
    example: '500.00',
    description: 'Amount to transfer (must not exceed wallet balance)',
  })
  amount: string;

  @ApiProperty({
    example: 'idem-key-12345',
    description: 'Idempotency key to prevent duplicate transactions',
  })
  idempotencyKey: string;
}
