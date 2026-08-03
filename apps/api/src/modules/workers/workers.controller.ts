import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { WorkersService } from './workers.service';
@ApiTags('Workers')
@Roles('CALL_CENTER', 'OPERATOR', 'VERIFIER', 'TRAINER', 'FINANCE', 'RISK_MANAGER', 'ADMIN')
@Controller('workers')
export class WorkersController { constructor(private readonly service: WorkersService) {} @Get() findAll() { return this.service.findAll(); } }
