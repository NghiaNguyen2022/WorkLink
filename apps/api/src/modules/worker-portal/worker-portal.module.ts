import { Module } from '@nestjs/common';

import { ExecutionModule } from '../execution/execution.module';
import { FinanceModule } from '../finance/finance.module';
import { MatchingModule } from '../matching/matching.module';
import { QualityModule } from '../quality/quality.module';
import { WorkerPortalController } from './worker-portal.controller';
import { WorkerPortalService } from './worker-portal.service';

@Module({
  imports: [
    ExecutionModule,
    FinanceModule,
    MatchingModule,
    QualityModule,
  ],
  controllers: [WorkerPortalController],
  providers: [WorkerPortalService],
})
export class WorkerPortalModule {}
