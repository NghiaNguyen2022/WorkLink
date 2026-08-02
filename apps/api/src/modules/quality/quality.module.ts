import { Module } from '@nestjs/common';

import { QualityController } from './quality.controller';
import { QualityInsightsController } from './quality-insights.controller';
import { QualityInsightsService } from './quality-insights.service';
import { QualityService } from './quality.service';

@Module({
  controllers: [
    QualityController,
    QualityInsightsController,
  ],
  providers: [
    QualityService,
    QualityInsightsService,
  ],
  exports: [
    QualityService,
    QualityInsightsService,
  ],
})
export class QualityModule {}
