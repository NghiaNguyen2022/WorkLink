import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '@worklink/auth';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CustomerPortalService } from './customer-portal.service';
import {
  ApproveQuoteDto,
  CreateCustomerJobDto,
  CustomerActionDto,
  CustomerComplaintDto,
  CustomerRehireDto,
  CustomerRelationshipDto,
  CustomerReviewDto,
} from './dto/customer-portal.dto';

@ApiTags('Customer Portal')
@Roles('CUSTOMER')
@Controller('customer-portal/customers/:customerId')
export class CustomerPortalController {
  constructor(
    private readonly service: CustomerPortalService,
  ) {}

  @Get('dashboard')
  dashboard(
    @Param('customerId') customerId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.dashboard(customerId, user.id);
  }

  @Get('jobs')
  listJobs(
    @Param('customerId') customerId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.listJobs(customerId, user.id);
  }

  @Post('jobs')
  createJob(
    @Param('customerId') customerId: string,
    @Body() dto: CreateCustomerJobDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.createJob(customerId, user.id, dto);
  }

  @Get('jobs/:jobId')
  jobDetail(
    @Param('customerId') customerId: string,
    @Param('jobId') jobId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.jobDetail(
      customerId,
      jobId,
      user.id,
    );
  }

  @Post('jobs/:jobId/submit')
  submitJob(
    @Param('customerId') customerId: string,
    @Param('jobId') jobId: string,
    @Body() dto: CustomerActionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.submitJob(
      customerId,
      jobId,
      user.id,
      dto,
    );
  }

  @Post('jobs/:jobId/approve-quote')
  approveQuote(
    @Param('customerId') customerId: string,
    @Param('jobId') jobId: string,
    @Body() dto: ApproveQuoteDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.approveQuote(
      customerId,
      jobId,
      user.id,
      dto,
    );
  }

  @Post('jobs/:jobId/assignments/:assignmentId/confirm')
  confirmAssignment(
    @Param('customerId') customerId: string,
    @Param('jobId') jobId: string,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: CustomerActionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.confirmAssignment(
      customerId,
      jobId,
      assignmentId,
      user.id,
      dto,
    );
  }

  @Post('jobs/:jobId/reviews')
  reviewWorker(
    @Param('customerId') customerId: string,
    @Param('jobId') jobId: string,
    @Body() dto: CustomerReviewDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.reviewWorker(
      customerId,
      jobId,
      user.id,
      dto,
    );
  }

  @Post('jobs/:jobId/relationships')
  setRelationship(
    @Param('customerId') customerId: string,
    @Param('jobId') jobId: string,
    @Body() dto: CustomerRelationshipDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.setRelationship(
      customerId,
      jobId,
      user.id,
      dto,
    );
  }

  @Post('jobs/:jobId/re-hire')
  rehire(
    @Param('customerId') customerId: string,
    @Param('jobId') jobId: string,
    @Body() dto: CustomerRehireDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.rehire(
      customerId,
      jobId,
      user.id,
      dto,
    );
  }

  @Post('jobs/:jobId/complaints')
  openComplaint(
    @Param('customerId') customerId: string,
    @Param('jobId') jobId: string,
    @Body() dto: CustomerComplaintDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.openComplaint(
      customerId,
      jobId,
      user.id,
      dto,
    );
  }
}
