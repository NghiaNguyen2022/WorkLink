import { Module } from '@nestjs/common';

import { ExceptionsModule } from '../exceptions/exceptions.module';
import { ExecutionModule } from '../execution/execution.module';
import { QualityModule } from '../quality/quality.module';
import { CustomerPortalController } from './customer-portal.controller';
import { CustomerPortalService } from './customer-portal.service';

@Module({
  imports: [
    ExecutionModule,
    QualityModule,
    ExceptionsModule,
  ],
  controllers: [CustomerPortalController],
  providers: [CustomerPortalService],
})
export class CustomerPortalModule {}
