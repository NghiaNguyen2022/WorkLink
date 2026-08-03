import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Roles } from '../auth/decorators/roles.decorator';
import {
  CreateReviewDto,
  ModerateReviewDto,
  RehireJobDto,
  SetRelationshipDto,
} from './dto/quality.dto';
import { QualityService } from './quality.service';

@ApiTags('Quality & Relationships')
@Roles('CALL_CENTER', 'OPERATOR', 'VERIFIER', 'TRAINER', 'FINANCE', 'RISK_MANAGER', 'ADMIN')
@Controller()
export class QualityController {
  constructor(private readonly service: QualityService) {}

  @Post('jobs/:jobId/reviews')
  createReview(
    @Param('jobId') jobId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.service.createReview(jobId, dto);
  }

  @Get('jobs/:jobId/reviews')
  getReviews(@Param('jobId') jobId: string) {
    return this.service.getReviews(jobId);
  }

  @Post('reviews/:reviewId/moderate')
  moderate(
    @Param('reviewId') reviewId: string,
    @Body() dto: ModerateReviewDto,
  ) {
    return this.service.moderateReview(reviewId, dto);
  }

  @Put('relationships')
  setRelationship(@Body() dto: SetRelationshipDto) {
    return this.service.setRelationship(dto);
  }

  @Get('customers/:customerId/relationships')
  customerRelationships(
    @Param('customerId') customerId: string,
  ) {
    return this.service.customerRelationships(customerId);
  }

  @Get('workers/:workerId/relationships')
  workerRelationships(
    @Param('workerId') workerId: string,
  ) {
    return this.service.workerRelationships(workerId);
  }

  @Post('jobs/:jobId/re-hire')
  rehire(
    @Param('jobId') jobId: string,
    @Body() dto: RehireJobDto,
  ) {
    return this.service.rehire(jobId, dto);
  }

  @Get('jobs/:jobId/re-hire-history')
  history(@Param('jobId') jobId: string) {
    return this.service.rehireHistory(jobId);
  }
}
