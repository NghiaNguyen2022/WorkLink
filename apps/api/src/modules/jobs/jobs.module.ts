import { Module } from '@nestjs/common';

import { JobPricingService } from './job-pricing.service';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

@Module({
  controllers: [JobsController],
  providers: [
    JobsService,
    JobPricingService,
  ],
  exports: [JobsService],
})
export class JobsModule {}
