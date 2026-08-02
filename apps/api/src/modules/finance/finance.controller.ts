import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import {
  AddAdjustmentDto,
  ApproveSettlementDto,
  EarningsQueryDto,
  PaymentActionDto,
  PrepareSettlementDto,
} from './dto/finance.dto';
import { FinanceService } from './finance.service';

@ApiTags('Finance & Settlement')
@Controller()
export class FinanceController {
  constructor(
    private readonly financeService: FinanceService,
  ) {}

  @Post('jobs/:jobId/settlement/prepare')
  @ApiOperation({
    summary: 'Lập bảng đối soát công việc',
  })
  prepare(
    @Param('jobId') jobId: string,
    @Body() input: PrepareSettlementDto,
  ) {
    return this.financeService.prepare(jobId, input);
  }

  @Get('jobs/:jobId/settlement')
  getSettlement(
    @Param('jobId') jobId: string,
  ) {
    return this.financeService.getByJob(jobId);
  }

  @Post('jobs/:jobId/settlement/adjustments')
  addAdjustment(
    @Param('jobId') jobId: string,
    @Body() input: AddAdjustmentDto,
  ) {
    return this.financeService.addAdjustment(
      jobId,
      input,
    );
  }

  @Post('jobs/:jobId/settlement/approve')
  approve(
    @Param('jobId') jobId: string,
    @Body() input: ApproveSettlementDto,
  ) {
    return this.financeService.approve(jobId, input);
  }

  @Post('payments/:paymentId/mark-paid')
  markPaid(
    @Param('paymentId') paymentId: string,
    @Body() input: PaymentActionDto,
  ) {
    return this.financeService.markPaid(
      paymentId,
      input,
    );
  }

  @Post('payments/:paymentId/fail')
  fail(
    @Param('paymentId') paymentId: string,
    @Body() input: PaymentActionDto,
  ) {
    return this.financeService.fail(paymentId, input);
  }

  @Get('workers/:workerId/earnings')
  workerEarnings(
    @Param('workerId') workerId: string,
    @Query() query: EarningsQueryDto,
  ) {
    return this.financeService.workerEarnings(
      workerId,
      query.status ?? 'ALL',
    );
  }

  @Get('finance/settlements')
  listSettlements() {
    return this.financeService.listSettlements();
  }
}
