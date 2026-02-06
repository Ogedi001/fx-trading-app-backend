import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Currency } from 'src/common/enums/currency.enum';
import { FxService } from '../services/fx.service';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Foreign Exchange')
@Controller('fx')
export class FxController {
  constructor(private readonly fxService: FxService) {}

  @Public()
  @Get('rates')
  @ApiOperation({
    summary: 'Get exchange rates',
    description:
      'Retrieves current exchange rates for a given base currency against all supported currencies',
  })
  @ApiQuery({
    name: 'base',
    enum: Currency,
    required: false,
    description: 'Base currency code (defaults to NGN if not provided)',
    example: 'NGN',
  })
  @ApiResponse({
    status: 200,
    description: 'Exchange rates retrieved successfully',
    example: {
      NGN: 1,
      USD: 0.0025,
      EUR: 0.0023,
      GBP: 0.002,
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid base currency or FX rate not found',
  })
  @ApiResponse({
    status: 503,
    description: 'FX provider is unavailable',
  })
  @Get('rates')
  async getRates(@Query('base') base: Currency) {
    const rates = await this.fxService.getAllRates(base || Currency.NGN);

    return {
      message: `Exchange rates retrieved successfully for base currency ${base || Currency.NGN}`,
      base: base || Currency.NGN,
      rates,
    };
  }
}
