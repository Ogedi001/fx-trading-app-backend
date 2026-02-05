export class RateValidator {
  static validate(rate: string) {
    if (Number(rate) <= 0) {
      throw new Error('Invalid FX rate');
    }
  }
}
