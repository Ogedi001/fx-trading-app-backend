import { ErrorCodes } from 'src/common/constants/error-codes';
import { BadRequestException } from 'src/common/exceptions';

export class RateValidator {
  static validate(rate: string) {
    if (Number(rate) <= 0) {
      throw new BadRequestException(
        ErrorCodes.FX_RATE_INVALID,
        'Invalid FX rate',
      );
    }
  }
}
