export class BalanceCalculator {
  static canDebit(balance: string, amount: string): boolean {
    return Number(balance) >= Number(amount);
  }

  static debit(balance: string, amount: string): string {
    return (Number(balance) - Number(amount)).toFixed(8);
  }

  static credit(balance: string, amount: string): string {
    return (Number(balance) + Number(amount)).toFixed(8);
  }

  static multiply(amount: string, rate: string) {
    return (Number(amount) * Number(rate)).toFixed(8);
  }
}
