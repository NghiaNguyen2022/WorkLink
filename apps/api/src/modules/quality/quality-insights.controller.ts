import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../auth/decorators/roles.decorator';
import { QualityInsightsService } from './quality-insights.service';

@ApiTags('Quality Insights')
@Roles('CALL_CENTER', 'OPERATOR', 'VERIFIER', 'TRAINER', 'FINANCE', 'RISK_MANAGER', 'ADMIN')
@Controller()
export class QualityInsightsController {
  constructor(
    private readonly service: QualityInsightsService,
  ) {}

  @Get('reviews/:reviewId/metric-update')
  @ApiOperation({
    summary: 'Xem snapshot metric trước và sau Review',
  })
  reviewMetric(
    @Param('reviewId') reviewId: string,
  ) {
    return this.service.reviewMetric(reviewId);
  }

  @Get('jobs/:jobId/quality-overview')
  @ApiOperation({
    summary: 'Tổng quan chất lượng của Job',
  })
  jobOverview(@Param('jobId') jobId: string) {
    return this.service.jobOverview(jobId);
  }

  @Get('workers/:workerId/quality-metric')
  @ApiOperation({
    summary: 'Metric chất lượng hiện tại của Worker',
  })
  workerMetric(
    @Param('workerId') workerId: string,
  ) {
    return this.service.workerMetric(workerId);
  }
}
