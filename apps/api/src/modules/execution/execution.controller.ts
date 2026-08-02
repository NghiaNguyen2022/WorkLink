import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import {
  AddEvidenceDto,
  AssignmentActionDto,
  CheckInDto,
  CheckOutDto,
  CreateIncidentDto,
  CustomerConfirmDto,
} from './dto/execution.dto';
import { ExecutionService } from './execution.service';

@ApiTags('Job Execution')
@Controller()
export class ExecutionController {
  constructor(
    private readonly executionService: ExecutionService,
  ) {}

  @Get('jobs/:jobId/execution')
  @ApiOperation({
    summary: 'Tổng quan vận hành của một công việc',
  })
  getJobExecution(
    @Param('jobId') jobId: string,
  ) {
    return this.executionService.getJobExecution(jobId);
  }

  @Get('assignments/:assignmentId/execution')
  @ApiOperation({
    summary: 'Chi tiết vận hành assignment',
  })
  getAssignmentExecution(
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.executionService.getAssignmentExecution(
      assignmentId,
    );
  }

  @Post('assignments/:assignmentId/check-in')
  checkIn(
    @Param('assignmentId') assignmentId: string,
    @Body() input: CheckInDto,
  ) {
    return this.executionService.checkIn(
      assignmentId,
      input,
    );
  }

  @Post('assignments/:assignmentId/evidence')
  addEvidence(
    @Param('assignmentId') assignmentId: string,
    @Body() input: AddEvidenceDto,
  ) {
    return this.executionService.addEvidence(
      assignmentId,
      input,
    );
  }

  @Post('assignments/:assignmentId/incidents')
  createIncident(
    @Param('assignmentId') assignmentId: string,
    @Body() input: CreateIncidentDto,
  ) {
    return this.executionService.createIncident(
      assignmentId,
      input,
    );
  }

  @Post('assignments/:assignmentId/check-out')
  checkOut(
    @Param('assignmentId') assignmentId: string,
    @Body() input: CheckOutDto,
  ) {
    return this.executionService.checkOut(
      assignmentId,
      input,
    );
  }

  @Post('assignments/:assignmentId/customer-confirm')
  customerConfirm(
    @Param('assignmentId') assignmentId: string,
    @Body() input: CustomerConfirmDto,
  ) {
    return this.executionService.customerConfirm(
      assignmentId,
      input,
    );
  }

  @Post('assignments/:assignmentId/no-show')
  markNoShow(
    @Param('assignmentId') assignmentId: string,
    @Body() input: AssignmentActionDto,
  ) {
    return this.executionService.markNoShow(
      assignmentId,
      input,
    );
  }

  @Post('assignments/:assignmentId/cancel')
  cancel(
    @Param('assignmentId') assignmentId: string,
    @Body() input: AssignmentActionDto,
  ) {
    return this.executionService.cancel(
      assignmentId,
      input,
    );
  }

  @Post('assignments/:assignmentId/request-replacement')
  requestReplacement(
    @Param('assignmentId') assignmentId: string,
    @Body() input: AssignmentActionDto,
  ) {
    return this.executionService.requestReplacement(
      assignmentId,
      input,
    );
  }
}
