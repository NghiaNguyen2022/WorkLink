import { randomUUID } from 'node:crypto';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  and,
  asc,
  eq,
} from 'drizzle-orm';

import { DatabaseService } from '../../database/database.service';
import {
  assignments,
  auditLogs,
  cancellationAssessments,
  disputeEvents,
  financialAdjustments,
  jobs,
  payments,
  replacementRequests,
  supportCases,
  workerProfiles,
} from '../../database/schema/index';
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

const POLICY_VERSION = 'CANCELLATION_V1';

@Injectable()
export class ExceptionsService {
  constructor(
    private readonly database: DatabaseService,
  ) {}

  async overview(jobId: string) {
    const [job] = await this.database.db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (!job) {
      throw new NotFoundException('Không tìm thấy Job');
    }

    const [
      assessments,
      replacements,
      cases,
      adjustments,
    ] = await Promise.all([
      this.database.db
        .select()
        .from(cancellationAssessments)
        .where(eq(cancellationAssessments.jobId, jobId))
        .orderBy(asc(cancellationAssessments.assessedAt)),
      this.database.db
        .select()
        .from(replacementRequests)
        .where(eq(replacementRequests.jobId, jobId))
        .orderBy(asc(replacementRequests.requestedAt)),
      this.database.db
        .select()
        .from(supportCases)
        .where(eq(supportCases.jobId, jobId))
        .orderBy(asc(supportCases.createdAt)),
      this.database.db
        .select()
        .from(financialAdjustments)
        .where(eq(financialAdjustments.jobId, jobId))
        .orderBy(asc(financialAdjustments.proposedAt)),
    ]);

    return {
      jobId,
      policyVersion: POLICY_VERSION,
      assessments,
      replacements,
      cases,
      adjustments,
    };
  }

  async assessCancellation(
    assignmentId: string,
    input: AssessCancellationDto,
  ) {
    const context = await this.getAssignmentContext(
      assignmentId,
    );

    if (
      ![
        'CONFIRMED',
        'ACTIVE',
        'NO_SHOW',
        'CANCELLED',
        'REPLACEMENT_REQUIRED',
      ].includes(context.assignment.status)
    ) {
      throw new BadRequestException(
        'Assignment không ở trạng thái có thể đánh giá hủy',
      );
    }

    const minutesBeforeStart =
      (context.job.startAt.getTime() - Date.now()) / 60_000;

    const base = context.assignment.agreedPayout;
    const result = this.calculateCancellation(
      input.eventType,
      input.cancelledByParty,
      minutesBeforeStart,
      base,
    );

    const id = randomUUID();

    await this.database.db.transaction(async (tx) => {
      await tx.insert(cancellationAssessments).values({
        id,
        jobId: context.job.id,
        assignmentId,
        eventType: input.eventType,
        cancelledByParty: input.cancelledByParty,
        minutesBeforeStart,
        policyVersion: POLICY_VERSION,
        customerFeeAmount: result.customerFeeAmount,
        workerCompensationAmount:
          result.workerCompensationAmount,
        platformFeeAmount: result.platformFeeAmount,
        reason: input.reason,
        calculationDetails: result.details,
        assessedByUserId: input.actorUserId,
      });

      await tx.insert(auditLogs).values({
        id: randomUUID(),
        actorUserId: input.actorUserId,
        action: 'CANCELLATION_ASSESSED',
        entityType: 'ASSIGNMENT',
        entityId: assignmentId,
        afterData: {
          assessmentId: id,
          policyVersion: POLICY_VERSION,
          ...result,
        },
      });
    });

    return this.overview(context.job.id);
  }

  async approveCancellation(
    assessmentId: string,
    input: ApproveCancellationDto,
  ) {
    const [assessment] = await this.database.db
      .select()
      .from(cancellationAssessments)
      .where(eq(cancellationAssessments.id, assessmentId))
      .limit(1);

    if (!assessment) {
      throw new NotFoundException(
        'Không tìm thấy cancellation assessment',
      );
    }

    if (assessment.status !== 'ASSESSED') {
      throw new BadRequestException(
        'Assessment đã được xử lý',
      );
    }

    await this.database.db.transaction(async (tx) => {
      await tx
        .update(cancellationAssessments)
        .set({
          status: 'APPROVED',
          approvedByUserId: input.actorUserId,
          approvedAt: new Date(),
        })
        .where(eq(cancellationAssessments.id, assessmentId));

      if (assessment.customerFeeAmount > 0) {
        await tx.insert(payments).values({
          id: randomUUID(),
          jobId: assessment.jobId,
          assignmentId: assessment.assignmentId,
          paymentType: 'CANCELLATION_FEE',
          status: 'PENDING',
          amount: assessment.customerFeeAmount,
          currency: 'VND',
        });
      }

      if (assessment.workerCompensationAmount > 0) {
        await tx.insert(payments).values({
          id: randomUUID(),
          jobId: assessment.jobId,
          assignmentId: assessment.assignmentId,
          paymentType: 'WORKER_COMPENSATION',
          status: 'PENDING',
          amount: assessment.workerCompensationAmount,
          currency: 'VND',
        });
      }
    });

    return this.overview(assessment.jobId);
  }

  async requestReplacement(
    assignmentId: string,
    input: RequestReplacementDto,
  ) {
    const context = await this.getAssignmentContext(
      assignmentId,
    );

    if (
      ![
        'NO_SHOW',
        'CANCELLED',
        'REPLACEMENT_REQUIRED',
      ].includes(context.assignment.status)
    ) {
      throw new BadRequestException(
        'Assignment chưa đủ điều kiện thay người',
      );
    }

    const id = randomUUID();

    await this.database.db.insert(replacementRequests).values({
      id,
      jobId: context.job.id,
      originalAssignmentId: assignmentId,
      status: 'OPEN',
      priority: input.priority ?? 'HIGH',
      reason: input.reason,
      requestedByUserId: input.actorUserId,
    });

    return this.overview(context.job.id);
  }

  async fulfillReplacement(
    requestId: string,
    input: FulfillReplacementDto,
  ) {
    const [request] = await this.database.db
      .select()
      .from(replacementRequests)
      .where(eq(replacementRequests.id, requestId))
      .limit(1);

    if (!request) {
      throw new NotFoundException(
        'Không tìm thấy replacement request',
      );
    }

    if (request.status !== 'OPEN') {
      throw new BadRequestException(
        'Replacement request không còn mở',
      );
    }

    const [worker] = await this.database.db
      .select()
      .from(workerProfiles)
      .where(eq(workerProfiles.id, input.workerId))
      .limit(1);

    if (
      !worker ||
      !worker.available ||
      worker.isSuspended
    ) {
      throw new BadRequestException(
        'Worker thay thế không hợp lệ',
      );
    }

    const [duplicate] = await this.database.db
      .select({ id: assignments.id })
      .from(assignments)
      .where(
        and(
          eq(assignments.jobId, request.jobId),
          eq(assignments.workerId, input.workerId),
        ),
      )
      .limit(1);

    if (duplicate) {
      throw new BadRequestException(
        'Worker đã có assignment trên Job này',
      );
    }

    const assignmentId = randomUUID();

    await this.database.db.transaction(async (tx) => {
      await tx.insert(assignments).values({
        id: assignmentId,
        jobId: request.jobId,
        workerId: input.workerId,
        status: 'CONFIRMED',
        agreedPayout: input.agreedPayout,
        retentionAmount: input.retentionAmount ?? 0,
        replacementForAssignmentId:
          request.originalAssignmentId,
      });

      await tx
        .update(replacementRequests)
        .set({
          replacementWorkerId: input.workerId,
          replacementAssignmentId: assignmentId,
          status: 'FULFILLED',
          assignedByUserId: input.actorUserId,
          fulfilledAt: new Date(),
        })
        .where(eq(replacementRequests.id, requestId));
    });

    return this.overview(request.jobId);
  }

  async openDispute(
    jobId: string,
    input: OpenDisputeDto,
  ) {
    const [job] = await this.database.db
      .select({ id: jobs.id })
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (!job) {
      throw new NotFoundException('Không tìm thấy Job');
    }

    const caseId = randomUUID();
    const caseCode = `CASE-${Date.now()}`;

    await this.database.db.transaction(async (tx) => {
      await tx.insert(supportCases).values({
        id: caseId,
        caseCode,
        jobId,
        openedByUserId: input.actorUserId,
        caseType: input.caseType,
        priority: input.priority,
        status: 'OPEN',
        subject: input.subject,
        description: input.description,
      });

      await tx.insert(disputeEvents).values({
        id: randomUUID(),
        supportCaseId: caseId,
        eventType: 'CASE_OPENED',
        fromStatus: null,
        toStatus: 'OPEN',
        note: input.description,
        evidence: input.evidence,
        actorUserId: input.actorUserId,
      });
    });

    return this.caseDetail(caseId);
  }

  async updateDispute(
    caseId: string,
    input: UpdateDisputeDto,
  ) {
    const caseItem = await this.getCase(caseId);

    await this.database.db.transaction(async (tx) => {
      await tx
        .update(supportCases)
        .set({
          status: input.status,
          resolution:
            input.status === 'RESOLVED'
              ? input.note
              : undefined,
          resolvedAt:
            input.status === 'RESOLVED'
              ? new Date()
              : undefined,
        })
        .where(eq(supportCases.id, caseId));

      await tx.insert(disputeEvents).values({
        id: randomUUID(),
        supportCaseId: caseId,
        eventType: 'STATUS_CHANGED',
        fromStatus: caseItem.status,
        toStatus: input.status,
        note: input.note,
        evidence: input.evidence,
        actorUserId: input.actorUserId,
      });
    });

    return this.caseDetail(caseId);
  }

  async proposeAdjustment(
    caseId: string,
    input: ProposeAdjustmentDto,
  ) {
    const caseItem = await this.getCase(caseId);

    if (!caseItem.jobId) {
      throw new BadRequestException(
        'Support case không gắn với Job',
      );
    }

    const id = randomUUID();

    await this.database.db.insert(financialAdjustments).values({
      id,
      supportCaseId: caseId,
      jobId: caseItem.jobId,
      originalPaymentId: input.originalPaymentId,
      adjustmentType: input.adjustmentType,
      amount: input.amount,
      reason: input.reason,
      proposedByUserId: input.actorUserId,
    });

    return this.caseDetail(caseId);
  }

  async approveAdjustment(
    adjustmentId: string,
    input: ApproveAdjustmentDto,
  ) {
    const [adjustment] = await this.database.db
      .select()
      .from(financialAdjustments)
      .where(eq(financialAdjustments.id, adjustmentId))
      .limit(1);

    if (!adjustment) {
      throw new NotFoundException(
        'Không tìm thấy financial adjustment',
      );
    }

    if (adjustment.status !== 'PROPOSED') {
      throw new BadRequestException(
        'Adjustment đã được xử lý',
      );
    }

    const paymentId = randomUUID();

    await this.database.db.transaction(async (tx) => {
      await tx.insert(payments).values({
        id: paymentId,
        jobId: adjustment.jobId,
        paymentType: adjustment.adjustmentType,
        status: 'PENDING',
        amount: adjustment.amount,
        currency: adjustment.currency,
      });

      await tx
        .update(financialAdjustments)
        .set({
          status: 'APPROVED',
          generatedPaymentId: paymentId,
          approvedByUserId: input.actorUserId,
          approvedAt: new Date(),
        })
        .where(eq(financialAdjustments.id, adjustmentId));

      await tx.insert(disputeEvents).values({
        id: randomUUID(),
        supportCaseId: adjustment.supportCaseId,
        eventType: 'ADJUSTMENT_APPROVED',
        note: adjustment.reason,
        actorUserId: input.actorUserId,
        toStatus: 'APPROVED',
      });
    });

    return this.caseDetail(adjustment.supportCaseId);
  }

  async caseDetail(caseId: string) {
    const caseItem = await this.getCase(caseId);

    const [events, adjustments] = await Promise.all([
      this.database.db
        .select()
        .from(disputeEvents)
        .where(eq(disputeEvents.supportCaseId, caseId))
        .orderBy(asc(disputeEvents.createdAt)),
      this.database.db
        .select()
        .from(financialAdjustments)
        .where(eq(financialAdjustments.supportCaseId, caseId))
        .orderBy(asc(financialAdjustments.proposedAt)),
    ]);

    return {
      case: caseItem,
      events,
      adjustments,
    };
  }

  private calculateCancellation(
    eventType: string,
    party: string,
    minutesBeforeStart: number,
    baseAmount: number,
  ) {
    let customerRate = 0;
    let workerRate = 0;

    if (eventType === 'NO_SHOW') {
      if (party === 'WORKER') {
        customerRate = 0;
        workerRate = 0;
      } else {
        customerRate = 1;
        workerRate = 0.8;
      }
    } else if (party === 'CUSTOMER') {
      if (minutesBeforeStart >= 1_440) {
        customerRate = 0;
        workerRate = 0;
      } else if (minutesBeforeStart >= 240) {
        customerRate = 0.25;
        workerRate = 0.2;
      } else if (minutesBeforeStart >= 60) {
        customerRate = 0.5;
        workerRate = 0.4;
      } else {
        customerRate = 1;
        workerRate = 0.8;
      }
    }

    const customerFeeAmount =
      Math.round(baseAmount * customerRate * 100) / 100;
    const workerCompensationAmount =
      Math.round(baseAmount * workerRate * 100) / 100;
    const platformFeeAmount =
      Math.max(
        0,
        Math.round(
          (customerFeeAmount -
            workerCompensationAmount) *
            100,
        ) / 100,
      );

    return {
      customerFeeAmount,
      workerCompensationAmount,
      platformFeeAmount,
      details: {
        eventType,
        party,
        minutesBeforeStart,
        baseAmount,
        customerRate,
        workerRate,
      },
    };
  }

  private async getAssignmentContext(
    assignmentId: string,
  ) {
    const [row] = await this.database.db
      .select({
        assignment: assignments,
        job: jobs,
      })
      .from(assignments)
      .innerJoin(jobs, eq(assignments.jobId, jobs.id))
      .where(eq(assignments.id, assignmentId))
      .limit(1);

    if (!row) {
      throw new NotFoundException(
        'Không tìm thấy assignment',
      );
    }

    return row;
  }

  private async getCase(caseId: string) {
    const [caseItem] = await this.database.db
      .select()
      .from(supportCases)
      .where(eq(supportCases.id, caseId))
      .limit(1);

    if (!caseItem) {
      throw new NotFoundException(
        'Không tìm thấy support case',
      );
    }

    return caseItem;
  }
}
