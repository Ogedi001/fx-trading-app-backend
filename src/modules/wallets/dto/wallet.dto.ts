import { ApiProperty } from '@nestjs/swagger';
import { Currency } from 'src/common/enums/currency.enum';
import { IsEnum, IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class FundWalletDto {
  @ApiProperty({
    enum: Currency,
    description: 'Currency code (NGN, USD, EUR, GBP, etc.)',
    example: Currency.NGN,
  })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({
    example: '1000.00',
    description: 'Amount to fund wallet with (must be greater than 0)',
  })
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({
    example: 'idem-key-12345',
    description: 'Idempotency key to prevent duplicate transactions',
  })
  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;
}

export class WithdrawWalletDto {
  @ApiProperty({
    enum: Currency,
    description: 'Currency code (NGN, USD, EUR, GBP, etc.)',
    example: Currency.NGN,
  })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({
    example: '500.00',
    description: 'Amount to withdraw (must not exceed wallet balance)',
  })
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({
    example: 'idem-key-12345',
    description: 'Idempotency key to prevent duplicate transactions',
  })
  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;
}

export class ConvertDto {
  @ApiProperty({
    enum: Currency,
    description: 'Source currency code',
    example: Currency.NGN,
  })
  @IsEnum(Currency)
  fromCurrency: Currency;

  @ApiProperty({
    enum: Currency,
    description: 'Target currency code',
    example: Currency.USD,
  })
  @IsEnum(Currency)
  toCurrency: Currency;

  @ApiProperty({
    example: '1000.00',
    description: 'Amount to convert',
  })
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({
    example: 'idem-key-12345',
    description: 'Idempotency key to prevent duplicate transactions',
  })
  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;
}

export class TransferDto {
  @ApiProperty({
    example: 'recipient-user-id',
    description: 'ID of the user to transfer funds to',
  })
  @IsUUID()
  toUserId: string;

  @ApiProperty({
    enum: Currency,
    description: 'Currency code for transfer',
    example: Currency.NGN,
  })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({
    example: '500.00',
    description: 'Amount to transfer (must not exceed wallet balance)',
  })
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({
    example: 'idem-key-12345',
    description: 'Idempotency key to prevent duplicate transactions',
  })
  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;
}
