import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FxRateEntity } from '../entities/fx-rate.entity';
import { IFxRateRepository } from './fx-rate.repository.interface';
import { Currency } from 'src/common/enums/currency.enum';

@Injectable()
export class FxRateRepository implements IFxRateRepository {
  constructor(
    @InjectRepository(FxRateEntity)
    private readonly repo: Repository<FxRateEntity>,
  ) {}

  findRate(base: Currency, target: Currency) {
    return this.repo.findOne({
      where: { baseCurrency: base, targetCurrency: target },
    });
  }

  save(rate: FxRateEntity) {
    return this.repo.save(rate);
  }
}
