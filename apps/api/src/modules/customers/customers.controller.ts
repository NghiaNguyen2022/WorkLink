import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
@ApiTags('Customers')
@Controller('customers')
export class CustomersController { constructor(private readonly service: CustomersService) {} @Get() findAll() { return this.service.findAll(); } }
