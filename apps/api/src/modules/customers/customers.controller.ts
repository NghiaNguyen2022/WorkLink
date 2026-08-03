import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { CustomersService } from './customers.service';
@ApiTags('Customers')
@Roles('CALL_CENTER', 'OPERATOR', 'VERIFIER', 'TRAINER', 'FINANCE', 'RISK_MANAGER', 'ADMIN')
@Controller('customers')
export class CustomersController { constructor(private readonly service: CustomersService) {} @Get() findAll() { return this.service.findAll(); } }
