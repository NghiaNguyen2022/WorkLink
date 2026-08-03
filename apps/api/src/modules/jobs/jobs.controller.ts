import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../auth/decorators/roles.decorator';
import { CreateJobDto } from './dto/create-job.dto';
import {
  AcceptJobQuoteDto,
  ActorDto,
  AddVerificationNoteDto,
  CancelJobDto,
  CreateJobQuoteDto,
  RequestJobInformationDto,
  VerifyJobDto,
} from './dto/job-actions.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobsService } from './jobs.service';

@ApiTags('Jobs')
@Controller()
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
  ) {}

  @Get('job-categories')
  @ApiOperation({
    summary: 'Danh sách danh mục công việc đang hoạt động',
  })
  findCategories() {
    return this.jobsService.findCategories();
  }

  @Roles('CALL_CENTER', 'OPERATOR', 'VERIFIER', 'FINANCE', 'RISK_MANAGER', 'ADMIN')
  @Get('jobs')
  @ApiOperation({
    summary: 'Danh sách bài đăng công việc',
  })
  findAll() {
    return this.jobsService.findAll();
  }

  @Roles('CALL_CENTER', 'OPERATOR', 'VERIFIER', 'FINANCE', 'RISK_MANAGER', 'ADMIN')
  @Get('jobs/:id')
  @ApiOperation({
    summary:
      'Chi tiết công việc, yêu cầu, báo giá và lịch sử xử lý',
  })
  findById(@Param('id') id: string) {
    return this.jobsService.findById(id);
  }

  @Roles('CALL_CENTER', 'OPERATOR', 'ADMIN')
  @Post('jobs')
  @ApiOperation({
    summary: 'Tạo bài đăng công việc dạng nháp',
  })
  create(@Body() input: CreateJobDto) {
    return this.jobsService.create(input);
  }

  @Roles('CALL_CENTER', 'OPERATOR', 'ADMIN')
  @Patch('jobs/:id')
  @ApiOperation({
    summary: 'Cập nhật công việc đang ở trạng thái nháp',
  })
  update(
    @Param('id') id: string,
    @Body() input: UpdateJobDto,
  ) {
    return this.jobsService.update(id, input);
  }

  @Roles('CALL_CENTER', 'OPERATOR', 'ADMIN')
  @Post('jobs/:id/submit')
  @ApiOperation({
    summary: 'Gửi công việc cho tổng đài xác minh',
  })
  submit(
    @Param('id') id: string,
    @Body() input: ActorDto,
  ) {
    return this.jobsService.submit(id, input);
  }

  @Roles('CALL_CENTER', 'OPERATOR', 'VERIFIER', 'ADMIN')
  @Post('jobs/:id/verification-notes')
  @ApiOperation({
    summary: 'Thêm ghi chú xác minh của tổng đài',
  })
  addVerificationNote(
    @Param('id') id: string,
    @Body() input: AddVerificationNoteDto,
  ) {
    return this.jobsService.addVerificationNote(
      id,
      input,
    );
  }

  @Roles('CALL_CENTER', 'OPERATOR', 'ADMIN')
  @Post('jobs/:id/request-information')
  @ApiOperation({
    summary: 'Yêu cầu khách hàng bổ sung thông tin',
  })
  requestInformation(
    @Param('id') id: string,
    @Body() input: RequestJobInformationDto,
  ) {
    return this.jobsService.requestInformation(
      id,
      input,
    );
  }

  @Roles('CALL_CENTER', 'OPERATOR', 'VERIFIER', 'ADMIN')
  @Post('jobs/:id/verify')
  @ApiOperation({
    summary: 'Điều phối xác nhận công việc đủ thông tin',
  })
  verify(
    @Param('id') id: string,
    @Body() input: VerifyJobDto,
  ) {
    return this.jobsService.verify(id, input);
  }

  @Roles('CALL_CENTER', 'OPERATOR', 'FINANCE', 'ADMIN')
  @Post('jobs/:id/quote')
  @ApiOperation({
    summary: 'Tính và tạo báo giá mới cho công việc',
  })
  createQuote(
    @Param('id') id: string,
    @Body() input: CreateJobQuoteDto,
  ) {
    return this.jobsService.createQuote(id, input);
  }

  @Roles('CALL_CENTER', 'OPERATOR', 'ADMIN')
  @Post('jobs/:id/quotes/:quoteId/accept')
  @ApiOperation({
    summary: 'Khách hàng chấp nhận báo giá',
  })
  acceptQuote(
    @Param('id') id: string,
    @Param('quoteId') quoteId: string,
    @Body() input: AcceptJobQuoteDto,
  ) {
    return this.jobsService.acceptQuote(
      id,
      quoteId,
      input,
    );
  }

  @Roles('CALL_CENTER', 'OPERATOR', 'RISK_MANAGER', 'ADMIN')
  @Post('jobs/:id/cancel')
  @ApiOperation({
    summary: 'Hủy công việc trước khi Matching',
  })
  cancel(
    @Param('id') id: string,
    @Body() input: CancelJobDto,
  ) {
    return this.jobsService.cancel(id, input);
  }
}
