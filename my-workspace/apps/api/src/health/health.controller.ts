import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import type { DbHealthResponse, HealthResponse } from '@nestjs-template/utils';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  check(): HealthResponse {
    return this.healthService.check();
  }

  /** 200 when Postgres answers, 503 otherwise (so load balancers/orchestrators can react). */
  @Get('db')
  async checkDb(): Promise<DbHealthResponse> {
    const result = await this.healthService.checkDb();
    if (result.status !== 'ok') {
      throw new ServiceUnavailableException(result);
    }
    return result;
  }
}
