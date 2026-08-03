import { randomUUID } from 'node:crypto';

import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  and,
  desc,
  eq,
  inArray,
} from 'drizzle-orm';

import { DatabaseService } from '../../database/database.service';
import {
  assignments,
  jobs,
  paymentEvents,
  payments,
  settlementLines,
  settlements,
  users,
  workerProfiles,
  workSessions,
} from '../../database/schema/index';
import { PAYMENT_GATEWAY_PROVIDER } from '../payment-gateway/payment-gateway.token';
import type { PaymentGatewayProvider } from '../payment-gateway/payment-gateway.types';
import {
  AddAdjustmentDto,
  ApproveSettlementDto,
  PaymentActionDto,
  PrepareSettlementDto,
} from './dto/finance.dto';

@Injectable()
export class FinanceService {
  constructor(
    private readonly database: DatabaseService,
    @Inject(PAYMENT_GATEWAY_PROVIDER)
    private readonly paymentGateway: PaymentGatewayProvider,
  ) {}

  async prepare(
    jobId: string,
    input: PrepareSettlementDto,
  ) {
    const job = await this.getJob(jobId);

    if (job.status !== 'COMPLETED') {
      throw new BadRequestException(
        'Chỉ đối soát công việc đã COMPLETED',
      );
    }

    const [existing] = await this.database.db
      .select()
      .from(settlements)
      .where(eq(settlements.jobId, jobId))
      .limit(1);

    if (existing) {
      return this.getByJob(jobId);
    }

    const rows = await this.database.db
      .select({
        assignment: assignments,
        session: workSessions,
      })
      .from(assignments)
      .innerJoin(
        workSessions,
        eq(workSessions.assignmentId, assignments.id),
      )
      .where(
        and(
          eq(assignments.jobId, jobId),
          eq(assignments.status, 'COMPLETED'),
        ),
      );

    if (rows.length === 0) {
      throw new BadRequestException(
        'Không có assignment hoàn tất để đối soát',
      );
    }

    for (const row of rows) {
      if (!row.session.customerConfirmedAt) {
        throw new BadRequestException(
          'Tất cả work session phải được khách hàng xác nhận',
        );
      }
    }

    const customerBaseAmount = job.agreedPrice ?? 0;
    const workerBaseAmount = this.roundMoney(
      rows.reduce(
        (sum, row) => sum + row.assignment.agreedPayout,
        0,
      ),
    );

    const retentionAmount = this.roundMoney(
      rows.reduce(
        (sum, row) => sum + row.assignment.retentionAmount,
        0,
      ),
    );

    let workerOvertimeAmount = 0;
    const overtimeLines: Array<{
      assignmentId: string;
      workerId: string;
      overtimeMinutes: number;
      unitAmount: number;
      amount: number;
    }> = [];

    const plannedMinutes = Math.max(
      1,
      Math.floor(
        (job.endAt.getTime() - job.startAt.getTime()) /
          60_000,
      ) - job.breakMinutes,
    );

    for (const row of rows) {
      const overtimeMinutes = row.session.overtimeMinutes;
      const minuteRate =
        row.assignment.agreedPayout / plannedMinutes;
      const overtimeAmount = this.roundMoney(
        overtimeMinutes * minuteRate,
      );

      workerOvertimeAmount += overtimeAmount;

      if (overtimeAmount > 0) {
        overtimeLines.push({
          assignmentId: row.assignment.id,
          workerId: row.assignment.workerId,
          overtimeMinutes,
          unitAmount: minuteRate,
          amount: overtimeAmount,
        });
      }
    }

    workerOvertimeAmount = this.roundMoney(
      workerOvertimeAmount,
    );

    const workerPayableAmount = this.roundMoney(
      workerBaseAmount +
        workerOvertimeAmount -
        retentionAmount,
    );

    const customerTotalAmount = this.roundMoney(
      customerBaseAmount + workerOvertimeAmount,
    );

    const platformFeeAmount = this.roundMoney(
      customerTotalAmount - workerPayableAmount,
    );

    const settlementId = randomUUID();
    const settlementCode = `STL-${Date.now()}`;

    await this.database.db.transaction(async (tx) => {
      await tx.insert(settlements).values({
        id: settlementId,
        settlementCode,
        jobId,
        status: 'DRAFT',
        customerBaseAmount,
        customerTotalAmount,
        workerBaseAmount,
        workerOvertimeAmount,
        retentionAmount,
        workerPayableAmount,
        platformFeeAmount,
        calculationDetails: {
          plannedMinutes,
          completedAssignments: rows.length,
        },
        preparedByUserId: input.actorUserId,
      });

      await tx.insert(settlementLines).values({
        id: randomUUID(),
        settlementId,
        lineType: 'CUSTOMER_BASE',
        description: 'Giá trị dịch vụ đã thỏa thuận',
        quantity: 1,
        unitAmount: customerBaseAmount,
        amount: customerBaseAmount,
        direction: 'CUSTOMER_RECEIVABLE',
        createdByUserId: input.actorUserId,
      });

      for (const row of rows) {
        await tx.insert(settlementLines).values({
          id: randomUUID(),
          settlementId,
          assignmentId: row.assignment.id,
          workerId: row.assignment.workerId,
          lineType: 'WORKER_BASE',
          description: 'Tiền công cơ bản',
          quantity: 1,
          unitAmount: row.assignment.agreedPayout,
          amount: row.assignment.agreedPayout,
          direction: 'WORKER_PAYABLE',
          createdByUserId: input.actorUserId,
        });

        if (row.assignment.retentionAmount > 0) {
          await tx.insert(settlementLines).values({
            id: randomUUID(),
            settlementId,
            assignmentId: row.assignment.id,
            workerId: row.assignment.workerId,
            lineType: 'RETENTION',
            description: 'Khoản giữ lại',
            quantity: 1,
            unitAmount: row.assignment.retentionAmount,
            amount: -row.assignment.retentionAmount,
            direction: 'WORKER_PAYABLE',
            createdByUserId: input.actorUserId,
          });
        }
      }

      for (const line of overtimeLines) {
        await tx.insert(settlementLines).values({
          id: randomUUID(),
          settlementId,
          assignmentId: line.assignmentId,
          workerId: line.workerId,
          lineType: 'OVERTIME',
          description: `Tăng ca ${line.overtimeMinutes} phút`,
          quantity: line.overtimeMinutes,
          unitAmount: line.unitAmount,
          amount: line.amount,
          direction: 'WORKER_PAYABLE',
          metadata: {
            overtimeMinutes: line.overtimeMinutes,
          },
          createdByUserId: input.actorUserId,
        });
      }
    });

    return this.getByJob(jobId);
  }

  async addAdjustment(
    jobId: string,
    input: AddAdjustmentDto,
  ) {
    const settlement = await this.getSettlement(jobId);

    if (settlement.status !== 'DRAFT') {
      throw new BadRequestException(
        'Chỉ điều chỉnh Settlement DRAFT',
      );
    }

    let workerId: string | null = null;

    if (input.target === 'WORKER') {
      if (!input.assignmentId) {
        throw new BadRequestException(
          'Điều chỉnh worker phải có assignmentId',
        );
      }

      const [assignment] = await this.database.db
        .select()
        .from(assignments)
        .where(
          and(
            eq(assignments.id, input.assignmentId),
            eq(assignments.jobId, jobId),
          ),
        )
        .limit(1);

      if (!assignment) {
        throw new NotFoundException(
          'Không tìm thấy assignment thuộc Job',
        );
      }

      workerId = assignment.workerId;
    }

    await this.database.db.transaction(async (tx) => {
      await tx.insert(settlementLines).values({
        id: randomUUID(),
        settlementId: settlement.id,
        assignmentId: input.assignmentId,
        workerId,
        lineType:
          input.target === 'CUSTOMER'
            ? 'CUSTOMER_ADJUSTMENT'
            : 'WORKER_ADJUSTMENT',
        description: input.description,
        quantity: 1,
        unitAmount: input.amount,
        amount: input.amount,
        direction:
          input.target === 'CUSTOMER'
            ? 'CUSTOMER_RECEIVABLE'
            : 'WORKER_PAYABLE',
        createdByUserId: input.actorUserId,
      });

      const customerAdjustment =
        settlement.customerAdjustmentAmount +
        (input.target === 'CUSTOMER'
          ? input.amount
          : 0);

      const workerAdjustment =
        settlement.workerAdjustmentAmount +
        (input.target === 'WORKER'
          ? input.amount
          : 0);

      const customerTotal = this.roundMoney(
        settlement.customerBaseAmount +
          settlement.workerOvertimeAmount +
          customerAdjustment,
      );

      const workerPayable = this.roundMoney(
        settlement.workerBaseAmount +
          settlement.workerOvertimeAmount +
          workerAdjustment -
          settlement.retentionAmount,
      );

      await tx
        .update(settlements)
        .set({
          customerAdjustmentAmount: customerAdjustment,
          workerAdjustmentAmount: workerAdjustment,
          customerTotalAmount: customerTotal,
          workerPayableAmount: workerPayable,
          platformFeeAmount: this.roundMoney(
            customerTotal - workerPayable,
          ),
        })
        .where(eq(settlements.id, settlement.id));
    });

    return this.getByJob(jobId);
  }

  async approve(
    jobId: string,
    input: ApproveSettlementDto,
  ) {
    const settlement = await this.getSettlement(jobId);

    if (settlement.status !== 'DRAFT') {
      throw new BadRequestException(
        'Settlement không ở trạng thái DRAFT',
      );
    }

    const lines = await this.database.db
      .select()
      .from(settlementLines)
      .where(eq(settlementLines.settlementId, settlement.id));

    const workerGroups = new Map<
      string,
      {
        assignmentId: string;
        amount: number;
      }
    >();

    for (const line of lines) {
      if (
        line.direction !== 'WORKER_PAYABLE' ||
        !line.workerId ||
        !line.assignmentId
      ) {
        continue;
      }

      const current = workerGroups.get(line.workerId) ?? {
        assignmentId: line.assignmentId,
        amount: 0,
      };

      current.amount += line.amount;
      workerGroups.set(line.workerId, current);
    }

    const customerPaymentId = randomUUID();
    const customerIntent =
      await this.paymentGateway.createPaymentIntent({
        paymentId: customerPaymentId,
        jobId,
        amount: settlement.customerTotalAmount,
        currency: settlement.currency,
        purpose: 'CUSTOMER_CHARGE',
      });

    const workerPayouts = await Promise.all(
      Array.from(workerGroups.entries())
        .filter(([, worker]) => worker.amount > 0)
        .map(async ([workerId, worker]) => {
          const paymentId = randomUUID();
          const amount = this.roundMoney(worker.amount);

          const intent =
            await this.paymentGateway.createPayout({
              paymentId,
              workerId,
              amount,
              currency: settlement.currency,
              bankAccountNumber: null,
              bankAccountName: null,
            });

          return {
            paymentId,
            assignmentId: worker.assignmentId,
            amount,
            intent,
          };
        }),
    );

    await this.database.db.transaction(async (tx) => {
      await tx
        .update(settlements)
        .set({
          status: 'APPROVED',
          approvedByUserId: input.actorUserId,
          approvedAt: new Date(),
        })
        .where(eq(settlements.id, settlement.id));

      await tx.insert(payments).values({
        id: customerPaymentId,
        jobId,
        paymentType: 'CUSTOMER_CHARGE',
        status: 'PENDING',
        amount: settlement.customerTotalAmount,
        currency: settlement.currency,
        provider: customerIntent.provider,
        providerReference: customerIntent.providerReference,
      });

      for (const payout of workerPayouts) {
        await tx.insert(payments).values({
          id: payout.paymentId,
          jobId,
          assignmentId: payout.assignmentId,
          paymentType: 'WORKER_PAYOUT',
          status: 'PENDING',
          amount: payout.amount,
          currency: settlement.currency,
          provider: payout.intent.provider,
          providerReference: payout.intent.providerReference,
        });
      }
    });

    return this.getByJob(jobId);
  }

  async markPaid(
    paymentId: string,
    input: PaymentActionDto,
  ) {
    const payment = await this.getPayment(paymentId);

    if (payment.status === 'PAID') {
      return payment;
    }

    if (!['PENDING', 'FAILED'].includes(payment.status)) {
      throw new BadRequestException(
        'Payment không thể chuyển sang PAID',
      );
    }

    await this.database.db.transaction(async (tx) => {
      await tx
        .update(payments)
        .set({
          status: 'PAID',
          provider: input.provider,
          providerReference: input.providerReference,
          paidAt: new Date(),
        })
        .where(eq(payments.id, paymentId));

      await tx.insert(paymentEvents).values({
        id: randomUUID(),
        paymentId,
        eventType: 'PAYMENT_PAID',
        fromStatus: payment.status,
        toStatus: 'PAID',
        providerReference: input.providerReference,
        note: input.note,
        actorUserId: input.actorUserId,
      });
    });

    await this.closeSettlementWhenPaid(payment.jobId);

    return this.getPayment(paymentId);
  }

  async fail(
    paymentId: string,
    input: PaymentActionDto,
  ) {
    const payment = await this.getPayment(paymentId);

    if (payment.status === 'PAID') {
      throw new BadRequestException(
        'Không thể đánh dấu FAILED cho payment đã PAID',
      );
    }

    await this.database.db.transaction(async (tx) => {
      await tx
        .update(payments)
        .set({
          status: 'FAILED',
          provider: input.provider,
          providerReference: input.providerReference,
        })
        .where(eq(payments.id, paymentId));

      await tx.insert(paymentEvents).values({
        id: randomUUID(),
        paymentId,
        eventType: 'PAYMENT_FAILED',
        fromStatus: payment.status,
        toStatus: 'FAILED',
        providerReference: input.providerReference,
        note: input.note,
        actorUserId: input.actorUserId,
      });
    });

    return this.getPayment(paymentId);
  }

  /**
   * Entry point for a real gateway's webhook callback. Signature
   * verification, idempotency and status mapping are all handled
   * through the PaymentGatewayProvider port so this method never
   * changes when a real provider replaces the mock one.
   */
  async handleGatewayWebhook(
    rawBody: string,
    signature: string | undefined,
    payload: Record<string, unknown>,
  ) {
    if (
      !this.paymentGateway.verifyWebhookSignature(
        rawBody,
        signature,
      )
    ) {
      throw new BadRequestException(
        'Chữ ký webhook không hợp lệ',
      );
    }

    const event =
      this.paymentGateway.parseWebhookEvent(payload);
    const webhookEventType = `GATEWAY_${event.eventType}`;

    const [alreadyProcessed] = await this.database.db
      .select({ id: paymentEvents.id })
      .from(paymentEvents)
      .where(
        and(
          eq(
            paymentEvents.providerReference,
            event.providerReference,
          ),
          eq(paymentEvents.eventType, webhookEventType),
        ),
      )
      .limit(1);

    if (alreadyProcessed) {
      return { received: true, duplicate: true };
    }

    const [payment] = await this.database.db
      .select()
      .from(payments)
      .where(
        eq(
          payments.providerReference,
          event.providerReference,
        ),
      )
      .limit(1);

    if (!payment) {
      throw new NotFoundException(
        'Không tìm thấy payment ứng với providerReference',
      );
    }

    const succeeded =
      event.eventType === 'PAYMENT_SUCCEEDED' ||
      event.eventType === 'PAYOUT_SUCCEEDED';
    const nextStatus = succeeded ? 'PAID' : 'FAILED';

    if (payment.status !== 'PAID') {
      await this.database.db.transaction(async (tx) => {
        await tx
          .update(payments)
          .set({
            status: nextStatus,
            paidAt: succeeded ? new Date() : undefined,
          })
          .where(eq(payments.id, payment.id));

        await tx.insert(paymentEvents).values({
          id: randomUUID(),
          paymentId: payment.id,
          eventType: webhookEventType,
          fromStatus: payment.status,
          toStatus: nextStatus,
          providerReference: event.providerReference,
          note: `Webhook từ ${this.paymentGateway.name}`,
          metadata: event.raw,
        });
      });

      if (succeeded) {
        await this.closeSettlementWhenPaid(payment.jobId);
      }
    }

    return { received: true, duplicate: false };
  }

  async getByJob(jobId: string) {
    const settlement = await this.getSettlement(jobId);

    const [lines, jobPayments] = await Promise.all([
      this.database.db
        .select()
        .from(settlementLines)
        .where(eq(settlementLines.settlementId, settlement.id))
        .orderBy(settlementLines.createdAt),

      this.database.db
        .select()
        .from(payments)
        .where(eq(payments.jobId, jobId))
        .orderBy(desc(payments.createdAt)),
    ]);

    return {
      settlement,
      lines,
      payments: jobPayments,
    };
  }

  async listSettlements() {
    return this.database.db
      .select()
      .from(settlements)
      .orderBy(desc(settlements.createdAt));
  }

  async workerEarnings(
    workerId: string,
    status = 'ALL',
  ) {
    const [worker] = await this.database.db
      .select({
        id: workerProfiles.id,
        userId: workerProfiles.userId,
        fullName: users.fullName,
      })
      .from(workerProfiles)
      .innerJoin(users, eq(workerProfiles.userId, users.id))
      .where(eq(workerProfiles.id, workerId))
      .limit(1);

    if (!worker) {
      throw new NotFoundException(
        'Không tìm thấy worker',
      );
    }

    const rows = await this.database.db
      .select({
        payment: payments,
        assignment: assignments,
        job: jobs,
      })
      .from(payments)
      .innerJoin(
        assignments,
        eq(payments.assignmentId, assignments.id),
      )
      .innerJoin(jobs, eq(payments.jobId, jobs.id))
      .where(
        and(
          eq(assignments.workerId, workerId),
          eq(payments.paymentType, 'WORKER_PAYOUT'),
          status === 'ALL'
            ? inArray(payments.status, [
                'PENDING',
                'FAILED',
                'PAID',
              ])
            : eq(payments.status, status),
        ),
      )
      .orderBy(desc(payments.createdAt));

    return {
      worker,
      summary: {
        total: this.roundMoney(
          rows.reduce(
            (sum, row) => sum + row.payment.amount,
            0,
          ),
        ),
        paid: this.roundMoney(
          rows
            .filter((row) => row.payment.status === 'PAID')
            .reduce(
              (sum, row) => sum + row.payment.amount,
              0,
            ),
        ),
        pending: this.roundMoney(
          rows
            .filter((row) => row.payment.status !== 'PAID')
            .reduce(
              (sum, row) => sum + row.payment.amount,
              0,
            ),
        ),
      },
      items: rows,
    };
  }

  private async closeSettlementWhenPaid(jobId: string) {
    const jobPayments = await this.database.db
      .select({ status: payments.status })
      .from(payments)
      .where(eq(payments.jobId, jobId));

    if (
      jobPayments.length > 0 &&
      jobPayments.every((item) => item.status === 'PAID')
    ) {
      await this.database.db
        .update(settlements)
        .set({
          status: 'SETTLED',
          settledAt: new Date(),
        })
        .where(eq(settlements.jobId, jobId));
    }
  }

  private async getJob(jobId: string) {
    const [job] = await this.database.db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (!job) {
      throw new NotFoundException(
        'Không tìm thấy Job',
      );
    }

    return job;
  }

  private async getSettlement(jobId: string) {
    const [settlement] = await this.database.db
      .select()
      .from(settlements)
      .where(eq(settlements.jobId, jobId))
      .limit(1);

    if (!settlement) {
      throw new NotFoundException(
        'Chưa lập đối soát cho Job',
      );
    }

    return settlement;
  }

  private async getPayment(paymentId: string) {
    const [payment] = await this.database.db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (!payment) {
      throw new NotFoundException(
        'Không tìm thấy payment',
      );
    }

    return payment;
  }

  private roundMoney(value: number) {
    return Math.round(value * 100) / 100;
  }
}
