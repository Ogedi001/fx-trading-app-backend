import { Currency } from 'src/common/enums/currency.enum';
import { FxRateEntity } from '../entities/fx-rate.entity';

export interface IFxRateRepository {
  findRate(base: Currency, target: Currency): Promise<FxRateEntity | null>;
  save(rate: FxRateEntity): Promise<FxRateEntity>;
}
