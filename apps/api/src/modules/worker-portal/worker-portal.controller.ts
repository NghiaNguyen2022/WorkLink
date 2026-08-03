import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '@worklink/auth';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CreateAvailabilityDto,
  UpdateAvailabilityDto,
  UpdateWorkerProfileDto,
  WorkerAddEvidenceDto,
  WorkerCheckInDto,
  WorkerCheckOutDto,
  WorkerCreateIncidentDto,
  WorkerOfferRespondDto,
  WorkerReviewDto,
} from './dto/worker-portal.dto';
import { WorkerPortalService } from './worker-portal.service';

@ApiTags('Worker Portal')
@Roles('WORKER')
@Controller('worker-portal/workers/:workerId')
export class WorkerPortalController {
  constructor(
    private readonly service: WorkerPortalService,
  ) {}

  @Get('dashboard')
  dashboard(
    @Param('workerId') workerId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.dashboard(workerId, user.id);
  }

  @Get('profile')
  getProfile(
    @Param('workerId') workerId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.getProfile(workerId, user.id);
  }

  @Patch('profile')
  updateProfile(
    @Param('workerId') workerId: string,
    @Body() dto: UpdateWorkerProfileDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.updateProfile(workerId, user.id, dto);
  }

  @Get('availability')
  listAvailability(
    @Param('workerId') workerId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.listAvailability(workerId, user.id);
  }

  @Post('availability')
  createAvailability(
    @Param('workerId') workerId: string,
    @Body() dto: CreateAvailabilityDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.createAvailability(workerId, user.id, dto);
  }

  @Patch('availability/:availabilityId')
  updateAvailability(
    @Param('workerId') workerId: string,
    @Param('availabilityId') availabilityId: string,
    @Body() dto: UpdateAvailabilityDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.updateAvailability(
      workerId,
      user.id,
      availabilityId,
      dto,
    );
  }

  @Delete('availability/:availabilityId')
  deleteAvailability(
    @Param('workerId') workerId: string,
    @Param('availabilityId') availabilityId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.deleteAvailability(
      workerId,
      user.id,
      availabilityId,
    );
  }

  @Get('skills')
  listSkills(
    @Param('workerId') workerId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.listSkills(workerId, user.id);
  }

  @Get('certificates')
  listCertificates(
    @Param('workerId') workerId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.listCertificates(workerId, user.id);
  }

  @Get('offers')
  listOffers(
    @Param('workerId') workerId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.listOffers(workerId, user.id);
  }

  @Post('offers/:offerId/respond')
  respondOffer(
    @Param('workerId') workerId: string,
    @Param('offerId') offerId: string,
    @Body() dto: WorkerOfferRespondDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.respondOffer(
      workerId,
      user.id,
      offerId,
      dto,
    );
  }

  @Get('assignments')
  listAssignments(
    @Param('workerId') workerId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.listAssignments(workerId, user.id);
  }

  @Get('assignments/:assignmentId')
  assignmentDetail(
    @Param('workerId') workerId: string,
    @Param('assignmentId') assignmentId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.assignmentDetail(
      workerId,
      user.id,
      assignmentId,
    );
  }

  @Post('assignments/:assignmentId/check-in')
  checkIn(
    @Param('workerId') workerId: string,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: WorkerCheckInDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.checkIn(
      workerId,
      user.id,
      assignmentId,
      dto,
    );
  }

  @Post('assignments/:assignmentId/check-out')
  checkOut(
    @Param('workerId') workerId: string,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: WorkerCheckOutDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.checkOut(
      workerId,
      user.id,
      assignmentId,
      dto,
    );
  }

  @Post('assignments/:assignmentId/evidence')
  addEvidence(
    @Param('workerId') workerId: string,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: WorkerAddEvidenceDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.addEvidence(
      workerId,
      user.id,
      assignmentId,
      dto,
    );
  }

  @Post('assignments/:assignmentId/incidents')
  createIncident(
    @Param('workerId') workerId: string,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: WorkerCreateIncidentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.createIncident(
      workerId,
      user.id,
      assignmentId,
      dto,
    );
  }

  @Get('earnings')
  earnings(
    @Param('workerId') workerId: string,
    @Query('status') status: 'PENDING' | 'PAID' | 'ALL' = 'ALL',
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.earnings(workerId, user.id, status);
  }

  @Post('reviews')
  reviewCustomer(
    @Param('workerId') workerId: string,
    @Body() dto: WorkerReviewDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.reviewCustomer(workerId, user.id, dto);
  }
}
