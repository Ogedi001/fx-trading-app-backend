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
}
