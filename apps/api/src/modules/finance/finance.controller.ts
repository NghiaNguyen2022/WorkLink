import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  AddAdjustmentDto,
  ApproveSettlementDto,
  EarningsQueryDto,
  PaymentActionDto,
  PrepareSettlementDto,
} from './dto/finance.dto';
import { FinanceService } from './finance.service';

const FINANCE_READ_ROLES = [
  'OPERATOR',
  'FINANCE',
  'RISK_MANAGER',
  'ADMIN',
] as const;

const FINANCE_ACTION_ROLES = ['FINANCE', 'ADMIN'] as const;

@ApiTags('Finance & Settlement')
@Controller()
export class FinanceController {
  constructor(
    private readonly financeService: FinanceService,
  ) {}

  @Roles(...FINANCE_ACTION_ROLES)
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

  @Roles(...FINANCE_READ_ROLES)
  @Get('jobs/:jobId/settlement')
  getSettlement(
    @Param('jobId') jobId: string,
  ) {
    return this.financeService.getByJob(jobId);
  }

  @Roles(...FINANCE_ACTION_ROLES)
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

  @Roles(...FINANCE_ACTION_ROLES)
  @Post('jobs/:jobId/settlement/approve')
  approve(
    @Param('jobId') jobId: string,
    @Body() input: ApproveSettlementDto,
  ) {
    return this.financeService.approve(jobId, input);
  }

  @Roles(...FINANCE_ACTION_ROLES)
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

  @Roles(...FINANCE_ACTION_ROLES)
  @Post('payments/:paymentId/fail')
  fail(
    @Param('paymentId') paymentId: string,
    @Body() input: PaymentActionDto,
  ) {
    return this.financeService.fail(paymentId, input);
  }

  @Roles(...FINANCE_READ_ROLES)
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

  @Roles(...FINANCE_READ_ROLES)
  @Get('finance/settlements')
  listSettlements() {
    return this.financeService.listSettlements();
  }

  /**
   * Real gateway callback target. Public because the caller is the
   * payment provider, not a logged-in user. NOTE: a real provider
   * integration needs the exact raw request body for signature
   * verification (Nest's default body parser already re-serializes
   * it here) — wire `rawBody: true` in main.ts's NestFactory.create
   * when a real provider is added.
   */
  @Public()
  @Post('payment-gateway/webhook')
  @ApiOperation({
    summary: 'Webhook nhận sự kiện từ payment gateway',
  })
  handleGatewayWebhook(
    @Body() body: Record<string, unknown>,
    @Headers('x-gateway-signature')
    signature: string | undefined,
  ) {
    return this.financeService.handleGatewayWebhook(
      JSON.stringify(body),
      signature,
      body,
    );
  }
}
