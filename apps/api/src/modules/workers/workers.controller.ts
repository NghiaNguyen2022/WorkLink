import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WorkersService } from './workers.service';
@ApiTags('Workers')
@Controller('workers')
export class WorkersController { constructor(private readonly service: WorkersService) {} @Get() findAll() { return this.service.findAll(); } }
