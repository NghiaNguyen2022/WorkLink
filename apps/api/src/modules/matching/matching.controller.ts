import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '../auth/decorators/roles.decorator';
import {
  ConfirmOfferDto,
  OfferCandidateDto,
  RespondOfferDto,
  RunMatchingDto,
} from './dto/matching.dto';
import { MatchingService } from './matching.service';

@ApiTags('Matching')
@Roles('CALL_CENTER', 'OPERATOR', 'VERIFIER', 'TRAINER', 'FINANCE', 'RISK_MANAGER', 'ADMIN')
@Controller('jobs/:jobId/matching')
export class MatchingController {
  constructor(private readonly service: MatchingService) {}

  @Post('run')
  @ApiOperation({ summary: 'Chạy và xếp hạng Matching' })
  run(@Param('jobId') jobId: string, @Body() dto: RunMatchingDto) {
    return this.service.run(jobId, dto);
  }

  @Get('candidates')
  list(@Param('jobId') jobId: string) {
    return this.service.list(jobId);
  }

  @Post('candidates/:candidateId/offer')
  offer(
    @Param('jobId') jobId: string,
    @Param('candidateId') candidateId: string,
    @Body() dto: OfferCandidateDto,
  ) {
    return this.service.offer(jobId, candidateId, dto);
  }

  @Post('offers/:offerId/respond')
  respond(
    @Param('jobId') jobId: string,
    @Param('offerId') offerId: string,
    @Body() dto: RespondOfferDto,
  ) {
    return this.service.respond(jobId, offerId, dto);
  }

  @Post('offers/:offerId/confirm')
  confirm(
    @Param('jobId') jobId: string,
    @Param('offerId') offerId: string,
    @Body() dto: ConfirmOfferDto,
  ) {
    return this.service.confirm(jobId, offerId, dto);
  }

  @Post('expire')
  expire(@Param('jobId') jobId: string) {
    return this.service.expire(jobId);
  }
}
