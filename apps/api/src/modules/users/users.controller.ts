import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from './users.service';
@ApiTags('Users')
@Roles('ADMIN')
@Controller('users')
export class UsersController { constructor(private readonly service: UsersService) {} @Get() findAll() { return this.service.findAll(); } }
