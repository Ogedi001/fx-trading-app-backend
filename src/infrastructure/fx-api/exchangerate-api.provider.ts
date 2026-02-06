import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { IFxApiProvider } from './fx-api.interface';
import { Currency } from 'src/common/enums/currency.enum';
import { ErrorCodes } from 'src/common/constants/error-codes';
import { AppException, BadRequestException } from 'src/common/exceptions';

@Injectable()
export class ExchangeRateApiProvider implements IFxApiProvider {
  private readonly baseUrl = 'https://v6.exchangerate-api.com/v6';
  private readonly logger = new Logger(ExchangeRateApiProvider.name);

  async getRates(base: Currency): Promise<Record<string, number>> {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    const url = `${this.baseUrl}/${apiKey}/latest/${base}`;

    const maxRetries = 3;
    let attempt = 0;
    let lastError: any;

    while (attempt < maxRetries) {
      try {
        const { data } = await axios.get(url);

        if (data.result !== 'success') {
          throw new BadRequestException(
            data['error-type'],
            'Invalid FX provider response',
          );
        }

        return data.conversion_rates;
      } catch (err) {
        lastError = err;
        attempt++;
        this.logger.warn(
          `FX API request failed (attempt ${attempt}/${maxRetries}): ${err.message}`,
        );

        // exponential backoff: wait 500ms, 1000ms, 2000ms...
        await new Promise((resolve) =>
          setTimeout(resolve, 500 * Math.pow(2, attempt - 1)),
        );
      }
    }

    // If all retries fail, throw AppException
    throw new AppException(
      ErrorCodes.FX_PROVIDER_UNAVAILABLE,
      'FX provider is unavailable after retries',
      HttpStatus.SERVICE_UNAVAILABLE,
      lastError,
    );
  }
}
