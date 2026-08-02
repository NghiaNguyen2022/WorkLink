import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
  ApproveAdjustmentDto,
  ApproveCancellationDto,
  AssessCancellationDto,
  FulfillReplacementDto,
  OpenDisputeDto,
  ProposeAdjustmentDto,
  RequestReplacementDto,
  UpdateDisputeDto,
} from './dto/exceptions.dto';
import { ExceptionsService } from './exceptions.service';

@ApiTags('Exceptions & Disputes')
@Controller()
export class ExceptionsController {
  constructor(
    private readonly service: ExceptionsService,
  ) {}

  @Get('jobs/:jobId/exceptions')
  overview(@Param('jobId') jobId: string) {
    return this.service.overview(jobId);
  }

  @Post('assignments/:assignmentId/cancellation-assessment')
  assess(
    @Param('assignmentId') assignmentId: string,
    @Body() dto: AssessCancellationDto,
  ) {
    return this.service.assessCancellation(
      assignmentId,
      dto,
    );
  }

  @Post('cancellation-assessments/:id/approve')
  approveAssessment(
    @Param('id') id: string,
    @Body() dto: ApproveCancellationDto,
  ) {
    return this.service.approveCancellation(id, dto);
  }

  @Post('assignments/:assignmentId/replacement-requests')
  requestReplacement(
    @Param('assignmentId') assignmentId: string,
    @Body() dto: RequestReplacementDto,
  ) {
    return this.service.requestReplacement(
      assignmentId,
      dto,
    );
  }

  @Post('replacement-requests/:id/fulfill')
  fulfillReplacement(
    @Param('id') id: string,
    @Body() dto: FulfillReplacementDto,
  ) {
    return this.service.fulfillReplacement(id, dto);
  }

  @Post('jobs/:jobId/disputes')
  openDispute(
    @Param('jobId') jobId: string,
    @Body() dto: OpenDisputeDto,
  ) {
    return this.service.openDispute(jobId, dto);
  }

  @Get('disputes/:caseId')
  caseDetail(@Param('caseId') caseId: string) {
    return this.service.caseDetail(caseId);
  }

  @Post('disputes/:caseId/status')
  updateDispute(
    @Param('caseId') caseId: string,
    @Body() dto: UpdateDisputeDto,
  ) {
    return this.service.updateDispute(caseId, dto);
  }

  @Post('disputes/:caseId/adjustments')
  proposeAdjustment(
    @Param('caseId') caseId: string,
    @Body() dto: ProposeAdjustmentDto,
  ) {
    return this.service.proposeAdjustment(caseId, dto);
  }

  @Post('financial-adjustments/:id/approve')
  approveAdjustment(
    @Param('id') id: string,
    @Body() dto: ApproveAdjustmentDto,
  ) {
    return this.service.approveAdjustment(id, dto);
  }
}
