import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { HealthService } from './health.service';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get('/')
  root() {
    return {
      status: 'ok',
      service: 'API Live',
    };
  }

  @Public()
  @Get('/health')
  async healthCheck() {
    return this.healthService.healthCheck();
  }
}
