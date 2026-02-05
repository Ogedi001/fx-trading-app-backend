import { Currency } from 'src/common/enums/currency.enum';
import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from 'src/common/base/base.entity';
@Entity('fx_rates')
@Index(['baseCurrency', 'targetCurrency'])
export class FxRateEntity extends BaseEntity {
  @Column({ type: 'enum', enum: Currency })
  baseCurrency: Currency;

  @Column({ type: 'enum', enum: Currency })
  targetCurrency: Currency;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  rate: string;

  @Column()
  source: string;

  @Column({ type: 'timestamptz' })
  validUntil: Date;
}
