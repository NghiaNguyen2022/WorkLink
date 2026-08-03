import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Roles } from '../auth/decorators/roles.decorator';
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

const EXCEPTION_READ_ROLES = [
  'CALL_CENTER',
  'OPERATOR',
  'VERIFIER',
  'FINANCE',
  'RISK_MANAGER',
  'ADMIN',
] as const;

const EXCEPTION_ACTION_ROLES = [
  'CALL_CENTER',
  'OPERATOR',
  'RISK_MANAGER',
  'ADMIN',
] as const;

const EXCEPTION_APPROVAL_ROLES = [
  'FINANCE',
  'RISK_MANAGER',
  'ADMIN',
] as const;

@ApiTags('Exceptions & Disputes')
@Controller()
export class ExceptionsController {
  constructor(
    private readonly service: ExceptionsService,
  ) {}

  @Roles(...EXCEPTION_READ_ROLES)
  @Get('jobs/:jobId/exceptions')
  overview(@Param('jobId') jobId: string) {
    return this.service.overview(jobId);
  }

  @Roles(...EXCEPTION_ACTION_ROLES)
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

  @Roles(...EXCEPTION_APPROVAL_ROLES)
  @Post('cancellation-assessments/:id/approve')
  approveAssessment(
    @Param('id') id: string,
    @Body() dto: ApproveCancellationDto,
  ) {
    return this.service.approveCancellation(id, dto);
  }

  @Roles(...EXCEPTION_ACTION_ROLES)
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

  @Roles(...EXCEPTION_ACTION_ROLES)
  @Post('replacement-requests/:id/fulfill')
  fulfillReplacement(
    @Param('id') id: string,
    @Body() dto: FulfillReplacementDto,
  ) {
    return this.service.fulfillReplacement(id, dto);
  }

  @Roles(...EXCEPTION_ACTION_ROLES)
  @Post('jobs/:jobId/disputes')
  openDispute(
    @Param('jobId') jobId: string,
    @Body() dto: OpenDisputeDto,
  ) {
    return this.service.openDispute(jobId, dto);
  }

  @Roles(...EXCEPTION_READ_ROLES)
  @Get('disputes/:caseId')
  caseDetail(@Param('caseId') caseId: string) {
    return this.service.caseDetail(caseId);
  }

  @Roles(...EXCEPTION_ACTION_ROLES)
  @Post('disputes/:caseId/status')
  updateDispute(
    @Param('caseId') caseId: string,
    @Body() dto: UpdateDisputeDto,
  ) {
    return this.service.updateDispute(caseId, dto);
  }

  @Roles(...EXCEPTION_ACTION_ROLES)
  @Post('disputes/:caseId/adjustments')
  proposeAdjustment(
    @Param('caseId') caseId: string,
    @Body() dto: ProposeAdjustmentDto,
  ) {
    return this.service.proposeAdjustment(caseId, dto);
  }

  @Roles(...EXCEPTION_APPROVAL_ROLES)
  @Post('financial-adjustments/:id/approve')
  approveAdjustment(
    @Param('id') id: string,
    @Body() dto: ApproveAdjustmentDto,
  ) {
    return this.service.approveAdjustment(id, dto);
  }
}
