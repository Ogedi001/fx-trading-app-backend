import { BaseEntity, Column, Entity, Unique } from 'typeorm';

@Entity('fx_rates')
@Unique(['baseCurrency', 'quoteCurrency'])
export class FxRate extends BaseEntity {
  @Column()
  baseCurrency: string;

  @Column()
  quoteCurrency: string;

  @Column('decimal', { precision: 18, scale: 6 })
  rate: string;

  @Column()
  source: string;

  @Column()
  fetchedAt: Date;
}
