import { Controller, Get } from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { DatabaseService } from '../../database/database.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly database: DatabaseService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Kiểm tra trạng thái API và cơ sở dữ liệu',
  })
  async check() {
    const databaseAvailable =
      await this.database.ping();

    return {
      status: databaseAvailable ? 'ok' : 'degraded',
      service: 'worklink-api',
      database: databaseAvailable,
      timestamp: new Date().toISOString(),
    };
  }
}
