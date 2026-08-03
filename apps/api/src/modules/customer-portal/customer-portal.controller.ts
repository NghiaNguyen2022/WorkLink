import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

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
@Controller('customer-portal/customers/:customerId')
export class CustomerPortalController {
  constructor(
    private readonly service: CustomerPortalService,
  ) {}

  @Get('dashboard')
  dashboard(
    @Param('customerId') customerId: string,
    @Query('customerUserId') customerUserId: string,
  ) {
    return this.service.dashboard(
      customerId,
      customerUserId,
    );
  }

  @Get('jobs')
  listJobs(
    @Param('customerId') customerId: string,
    @Query('customerUserId') customerUserId: string,
  ) {
    return this.service.listJobs(
      customerId,
      customerUserId,
    );
  }

  @Post('jobs')
  createJob(
    @Param('customerId') customerId: string,
    @Body() dto: CreateCustomerJobDto,
  ) {
    return this.service.createJob(customerId, dto);
  }

  @Get('jobs/:jobId')
  jobDetail(
    @Param('customerId') customerId: string,
    @Param('jobId') jobId: string,
    @Query('customerUserId') customerUserId: string,
  ) {
    return this.service.jobDetail(
      customerId,
      jobId,
      customerUserId,
    );
  }

  @Post('jobs/:jobId/submit')
  submitJob(
    @Param('customerId') customerId: string,
    @Param('jobId') jobId: string,
    @Body() dto: CustomerActionDto,
  ) {
    return this.service.submitJob(
      customerId,
      jobId,
      dto,
    );
  }

  @Post('jobs/:jobId/approve-quote')
  approveQuote(
    @Param('customerId') customerId: string,
    @Param('jobId') jobId: string,
    @Body() dto: ApproveQuoteDto,
  ) {
    return this.service.approveQuote(
      customerId,
      jobId,
      dto,
    );
  }

  @Post('jobs/:jobId/assignments/:assignmentId/confirm')
  confirmAssignment(
    @Param('customerId') customerId: string,
    @Param('jobId') jobId: string,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: CustomerActionDto,
  ) {
    return this.service.confirmAssignment(
      customerId,
      jobId,
      assignmentId,
      dto,
    );
  }

  @Post('jobs/:jobId/reviews')
  reviewWorker(
    @Param('customerId') customerId: string,
    @Param('jobId') jobId: string,
    @Body() dto: CustomerReviewDto,
  ) {
    return this.service.reviewWorker(
      customerId,
      jobId,
      dto,
    );
  }

  @Post('jobs/:jobId/relationships')
  setRelationship(
    @Param('customerId') customerId: string,
    @Param('jobId') jobId: string,
    @Body() dto: CustomerRelationshipDto,
  ) {
    return this.service.setRelationship(
      customerId,
      jobId,
      dto,
    );
  }

  @Post('jobs/:jobId/re-hire')
  rehire(
    @Param('customerId') customerId: string,
    @Param('jobId') jobId: string,
    @Body() dto: CustomerRehireDto,
  ) {
    return this.service.rehire(customerId, jobId, dto);
  }

  @Post('jobs/:jobId/complaints')
  openComplaint(
    @Param('customerId') customerId: string,
    @Param('jobId') jobId: string,
    @Body() dto: CustomerComplaintDto,
  ) {
    return this.service.openComplaint(
      customerId,
      jobId,
      dto,
    );
  }
}
