export class FxRateDomain {
  constructor(
    readonly rate: string,
    readonly validUntil: Date,
  ) {}

  isExpired(): boolean {
    return new Date() > this.validUntil;
  }
}
