import { Currency } from 'src/common/enums/currency.enum';

export interface IFxApiProvider {
  getRates(base: Currency): Promise<Record<string, number>>;
}
