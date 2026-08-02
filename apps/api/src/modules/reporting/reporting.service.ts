import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import {
  and,
  asc,
  desc,
  eq,
  gte,
  lte,
} from 'drizzle-orm';

import { DatabaseService } from '../../database/database.service';
import {
  assignments,
  candidateOffers,
  jobs,
  matchingRuns,
  payments,
  reviews,
  settlements,
  supportCases,
  users,
  workerCertificates,
  workerProfiles,
  workSessions,
} from '../../database/schema/index';
import {
  ExportQueryDto,
  ReportingQueryDto,
} from './dto/reporting.dto';

type DateRange = {
  from: Date;
  to: Date;
};

@Injectable()
export class ReportingService {
  constructor(
    private readonly database: DatabaseService,
  ) {}

  async dashboard(query: ReportingQueryDto) {
    const range = this.resolveRange(query);

    const [
      jobRows,
      assignmentRows,
      sessionRows,
      paymentRows,
      reviewRows,
      caseRows,
      certificateRows,
      workerRows,
      settlementRows,
      matchingRows,
      offerRows,
    ] = await Promise.all([
      this.database.db
        .select()
        .from(jobs)
        .where(
          and(
            gte(jobs.createdAt, range.from),
            lte(jobs.createdAt, range.to),
          ),
        ),
      this.database.db
        .select()
        .from(assignments)
        .where(
          and(
            gte(assignments.createdAt, range.from),
            lte(assignments.createdAt, range.to),
          ),
        ),
      this.database.db
        .select()
        .from(workSessions)
        .where(
          and(
            gte(workSessions.createdAt, range.from),
            lte(workSessions.createdAt, range.to),
          ),
        ),
      this.database.db
        .select()
        .from(payments)
        .where(
          and(
            gte(payments.createdAt, range.from),
            lte(payments.createdAt, range.to),
          ),
        ),
      this.database.db
        .select()
        .from(reviews)
        .where(
          and(
            gte(reviews.createdAt, range.from),
            lte(reviews.createdAt, range.to),
          ),
        ),
      this.database.db
        .select()
        .from(supportCases)
        .where(
          and(
            gte(supportCases.createdAt, range.from),
            lte(supportCases.createdAt, range.to),
          ),
        ),
      this.database.db
        .select()
        .from(workerCertificates)
        .orderBy(asc(workerCertificates.expiresAt)),
      this.database.db
        .select({
          profile: workerProfiles,
          fullName: users.fullName,
        })
        .from(workerProfiles)
        .innerJoin(users, eq(workerProfiles.userId, users.id)),
      this.database.db
        .select()
        .from(settlements)
        .where(
          and(
            gte(settlements.createdAt, range.from),
            lte(settlements.createdAt, range.to),
          ),
        ),
      this.database.db
        .select()
        .from(matchingRuns)
        .where(
          and(
            gte(matchingRuns.createdAt, range.from),
            lte(matchingRuns.createdAt, range.to),
          ),
        ),
      this.database.db
        .select()
        .from(candidateOffers)
        .where(
          and(
            gte(candidateOffers.offeredAt, range.from),
            lte(candidateOffers.offeredAt, range.to),
          ),
        ),
    ]);

    const completedJobs = jobRows.filter(
      (item) => item.status === 'COMPLETED',
    );
    const assignedJobs = jobRows.filter((item) =>
      [
        'ASSIGNED',
        'IN_PROGRESS',
        'COMPLETED',
      ].includes(item.status),
    );

    const requiredHeadcount = jobRows.reduce(
      (sum, item) => sum + item.headcount,
      0,
    );
    const confirmedAssignments = assignmentRows.filter(
      (item) =>
        ![
          'CANCELLED',
          'NO_SHOW',
          'REPLACEMENT_REQUIRED',
        ].includes(item.status),
    ).length;

    const noShowCount = assignmentRows.filter(
      (item) => item.status === 'NO_SHOW',
    ).length;
    const cancelledCount = assignmentRows.filter(
      (item) => item.status === 'CANCELLED',
    ).length;

    const reviewedJobIds = new Set(
      reviewRows.map((item) => item.jobId),
    );

    const paymentFailures = paymentRows.filter(
      (item) => item.status === 'FAILED',
    );
    const paidWorkerPayments = paymentRows.filter(
      (item) =>
        item.paymentType === 'WORKER_PAYOUT' &&
        item.status === 'PAID',
    );
    const pendingWorkerPayments = paymentRows.filter(
      (item) =>
        item.paymentType === 'WORKER_PAYOUT' &&
        item.status !== 'PAID',
    );

    const customerCharges = paymentRows
      .filter(
        (item) =>
          item.paymentType === 'CUSTOMER_CHARGE' &&
          item.status === 'PAID',
      )
      .reduce((sum, item) => sum + item.amount, 0);

    const workerPayouts = paidWorkerPayments.reduce(
      (sum, item) => sum + item.amount,
      0,
    );

    const checkInDeltas = sessionRows
      .map((session) => {
        const assignment = assignmentRows.find(
          (item) => item.id === session.assignmentId,
        );
        const job = assignment
          ? jobRows.find(
              (item) => item.id === assignment.jobId,
            )
          : undefined;

        if (!job || !session.checkInAt) {
          return null;
        }

        return (
          (session.checkInAt.getTime() -
            job.startAt.getTime()) /
          60_000
        );
      })
      .filter(
        (value): value is number => value !== null,
      );

    const timeToFillValues = jobRows
      .map((job) => {
        const run = matchingRows
          .filter((item) => item.jobId === job.id)
          .sort(
            (a, b) =>
              a.createdAt.getTime() -
              b.createdAt.getTime(),
          )[0];

        const confirmed = assignmentRows
          .filter((item) => item.jobId === job.id)
          .sort(
            (a, b) =>
              a.confirmedAt.getTime() -
              b.confirmedAt.getTime(),
          )[0];

        if (!run || !confirmed) {
          return null;
        }

        return (
          (confirmed.confirmedAt.getTime() -
            run.createdAt.getTime()) /
          60_000
        );
      })
      .filter(
        (value): value is number =>
          value !== null && value >= 0,
      );

    const settlementVariance = settlementRows.reduce(
      (sum, item) =>
        sum +
        Math.abs(
          item.customerTotalAmount -
            item.workerPayableAmount -
            item.platformFeeAmount,
        ),
      0,
    );

    const certificateCutoff = new Date(
      Date.now() + 30 * 86_400_000,
    );
    const expiringCertificates = certificateRows.filter(
      (item) =>
        item.status === 'ACTIVE' &&
        item.expiresAt &&
        this.asDate(item.expiresAt) <= certificateCutoff &&
        this.asDate(item.expiresAt) >= new Date(),
    );

    const riskAlerts = this.buildRiskAlerts({
      jobs: jobRows,
      assignments: assignmentRows,
      payments: paymentRows,
      cases: caseRows,
      certificates: certificateRows,
      workers: workerRows,
    });

    const acceptedOffers = offerRows.filter((item) =>
      ['ACCEPTED', 'CONFIRMED'].includes(item.status),
    ).length;

    return {
      generatedAt: new Date().toISOString(),
      range: {
        from: range.from.toISOString(),
        to: range.to.toISOString(),
      },
      operations: {
        totalJobs: jobRows.length,
        completedJobs: completedJobs.length,
        assignedJobs: assignedJobs.length,
        fillRate: this.percent(
          confirmedAssignments,
          requiredHeadcount,
        ),
        offerAcceptanceRate: this.percent(
          acceptedOffers,
          offerRows.length,
        ),
        averageTimeToFillMinutes:
          this.average(timeToFillValues),
        noShowRate: this.percent(
          noShowCount,
          assignmentRows.length,
        ),
        cancellationRate: this.percent(
          cancelledCount,
          assignmentRows.length,
        ),
        averageCheckInDeltaMinutes:
          this.average(checkInDeltas),
        reviewCoverageRate: this.percent(
          reviewedJobIds.size,
          completedJobs.length,
        ),
      },
      finance: {
        customerCharges: this.money(customerCharges),
        workerPayouts: this.money(workerPayouts),
        pendingWorkerPayouts:
          pendingWorkerPayments.length,
        paymentFailureRate: this.percent(
          paymentFailures.length,
          paymentRows.length,
        ),
        payoutSlaRate: this.percent(
          paidWorkerPayments.length,
          paidWorkerPayments.length +
            pendingWorkerPayments.length,
        ),
        settlementVariance:
          this.money(settlementVariance),
      },
      quality: {
        totalReviews: reviewRows.length,
        averageReview:
          this.average(
            reviewRows.map(
              (item) => item.overallRating,
            ),
          ),
        openCases: caseRows.filter(
          (item) =>
            !['RESOLVED', 'REJECTED'].includes(
              item.status,
            ),
        ).length,
        disputeRate: this.percent(
          caseRows.filter(
            (item) =>
              item.caseType === 'DISPUTE' ||
              item.caseType === 'COMPLAINT',
          ).length,
          jobRows.length,
        ),
        expiringCertificates:
          expiringCertificates.length,
      },
      trends: this.buildMonthlyTrend(jobRows),
      riskAlerts,
    };
  }

  async report(
    report: string,
    query: ReportingQueryDto,
  ) {
    const dashboard = await this.dashboard(query);

    switch (report.toUpperCase()) {
      case 'OPERATIONS':
        return {
          name: 'OPERATIONS',
          metrics: dashboard.operations,
          trends: dashboard.trends,
        };
      case 'FINANCE':
        return {
          name: 'FINANCE',
          metrics: dashboard.finance,
        };
      case 'QUALITY':
        return {
          name: 'QUALITY',
          metrics: dashboard.quality,
        };
      case 'RISK':
        return {
          name: 'RISK',
          alerts: dashboard.riskAlerts,
        };
      default:
        throw new BadRequestException(
          'Report không được hỗ trợ',
        );
    }
  }

  async exportCsv(query: ExportQueryDto) {
    const range = this.resolveRange(query);
    const report = query.report ?? 'JOBS';

    if (report === 'JOBS') {
      const rows = await this.database.db
        .select()
        .from(jobs)
        .where(
          and(
            gte(jobs.createdAt, range.from),
            lte(jobs.createdAt, range.to),
          ),
        )
        .orderBy(desc(jobs.createdAt));

      return this.csv(
        [
          'jobCode',
          'title',
          'status',
          'headcount',
          'startAt',
          'endAt',
          'agreedPrice',
        ],
        rows.map((item) => ({
          jobCode: item.jobCode,
          title: item.title,
          status: item.status,
          headcount: item.headcount,
          startAt: item.startAt.toISOString(),
          endAt: item.endAt.toISOString(),
          agreedPrice: item.agreedPrice ?? 0,
        })),
      );
    }

    if (report === 'PAYMENTS') {
      const rows = await this.database.db
        .select()
        .from(payments)
        .where(
          and(
            gte(payments.createdAt, range.from),
            lte(payments.createdAt, range.to),
          ),
        )
        .orderBy(desc(payments.createdAt));

      return this.csv(
        [
          'id',
          'jobId',
          'paymentType',
          'status',
          'amount',
          'currency',
          'providerReference',
          'createdAt',
          'paidAt',
        ],
        rows.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
          paidAt: item.paidAt?.toISOString() ?? '',
        })),
      );
    }

    if (report === 'WORKERS') {
      const rows = await this.database.db
        .select({
          id: workerProfiles.id,
          fullName: users.fullName,
          rating: workerProfiles.rating,
          completedJobs: workerProfiles.completedJobs,
          cancellationRate:
            workerProfiles.cancellationRate,
          onTimeRate: workerProfiles.onTimeRate,
          available: workerProfiles.available,
          isSuspended: workerProfiles.isSuspended,
        })
        .from(workerProfiles)
        .innerJoin(
          users,
          eq(workerProfiles.userId, users.id),
        );

      return this.csv(
        [
          'id',
          'fullName',
          'rating',
          'completedJobs',
          'cancellationRate',
          'onTimeRate',
          'available',
          'isSuspended',
        ],
        rows,
      );
    }

    if (report === 'CASES') {
      const rows = await this.database.db
        .select()
        .from(supportCases)
        .where(
          and(
            gte(supportCases.createdAt, range.from),
            lte(supportCases.createdAt, range.to),
          ),
        )
        .orderBy(desc(supportCases.createdAt));

      return this.csv(
        [
          'caseCode',
          'jobId',
          'caseType',
          'priority',
          'status',
          'subject',
          'createdAt',
          'resolvedAt',
        ],
        rows.map((item) => ({
          caseCode: item.caseCode,
          jobId: item.jobId ?? '',
          caseType: item.caseType,
          priority: item.priority,
          status: item.status,
          subject: item.subject,
          createdAt: item.createdAt.toISOString(),
          resolvedAt:
            item.resolvedAt?.toISOString() ?? '',
        })),
      );
    }

    const certificateRows = await this.database.db
      .select()
      .from(workerCertificates)
      .orderBy(desc(workerCertificates.issuedAt));

    return this.csv(
      [
        'certificateNumber',
        'certificateCode',
        'workerId',
        'status',
        'issuedAt',
        'expiresAt',
      ],
      certificateRows.map((item) => ({
        certificateNumber: item.certificateNumber,
        certificateCode: item.certificateCode,
        workerId: item.workerId,
        status: item.status,
        issuedAt: item.issuedAt.toISOString(),
        expiresAt: item.expiresAt
          ? this.asDate(item.expiresAt)
              .toISOString()
              .slice(0, 10)
          : '',
      })),
    );
  }

  private buildRiskAlerts(input: {
    jobs: Array<typeof jobs.$inferSelect>;
    assignments: Array<
      typeof assignments.$inferSelect
    >;
    payments: Array<typeof payments.$inferSelect>;
    cases: Array<typeof supportCases.$inferSelect>;
    certificates: Array<
      typeof workerCertificates.$inferSelect
    >;
    workers: Array<{
      profile: typeof workerProfiles.$inferSelect;
      fullName: string;
    }>;
  }) {
    const alerts: Array<{
      code: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      entityType: string;
      entityId: string;
      title: string;
      detail: string;
    }> = [];

    for (const item of input.workers) {
      if (item.profile.cancellationRate >= 20) {
        alerts.push({
          code: 'WORKER_HIGH_CANCELLATION',
          severity:
            item.profile.cancellationRate >= 40
              ? 'CRITICAL'
              : 'HIGH',
          entityType: 'WORKER',
          entityId: item.profile.id,
          title: `${item.fullName} có tỷ lệ hủy cao`,
          detail: `${item.profile.cancellationRate}%`,
        });
      }

      if (item.profile.onTimeRate < 80) {
        alerts.push({
          code: 'WORKER_LOW_ON_TIME',
          severity:
            item.profile.onTimeRate < 60
              ? 'HIGH'
              : 'MEDIUM',
          entityType: 'WORKER',
          entityId: item.profile.id,
          title: `${item.fullName} có tỷ lệ đúng giờ thấp`,
          detail: `${item.profile.onTimeRate}%`,
        });
      }
    }

    for (const payment of input.payments.filter(
      (item) => item.status === 'FAILED',
    )) {
      alerts.push({
        code: 'PAYMENT_FAILED',
        severity: 'HIGH',
        entityType: 'PAYMENT',
        entityId: payment.id,
        title: 'Giao dịch thanh toán thất bại',
        detail: `${payment.paymentType} • ${payment.amount} ${payment.currency}`,
      });
    }

    const now = new Date();
    const nearStart = new Date(
      now.getTime() + 24 * 60 * 60_000,
    );

    for (const job of input.jobs.filter(
      (item) =>
        item.startAt >= now &&
        item.startAt <= nearStart &&
        ['MATCHING', 'ASSIGNED'].includes(item.status),
    )) {
      const activeCount = input.assignments.filter(
        (assignment) =>
          assignment.jobId === job.id &&
          ![
            'CANCELLED',
            'NO_SHOW',
            'REPLACEMENT_REQUIRED',
          ].includes(assignment.status),
      ).length;

      if (activeCount < job.headcount) {
        alerts.push({
          code: 'JOB_UNDERFILLED_NEAR_START',
          severity: 'CRITICAL',
          entityType: 'JOB',
          entityId: job.id,
          title: `${job.jobCode} sắp bắt đầu nhưng thiếu người`,
          detail: `${activeCount}/${job.headcount} nhân sự`,
        });
      }
    }

    const expiryCutoff = new Date(
      now.getTime() + 30 * 86_400_000,
    );

    for (const certificate of input.certificates) {
      if (
        certificate.status === 'ACTIVE' &&
        certificate.expiresAt
      ) {
        const expiresAt = this.asDate(
          certificate.expiresAt,
        );

        if (
          expiresAt >= now &&
          expiresAt <= expiryCutoff
        ) {
          alerts.push({
            code: 'CERTIFICATE_EXPIRING',
            severity: 'MEDIUM',
            entityType: 'WORKER_CERTIFICATE',
            entityId: certificate.id,
            title: `Chứng nhận ${certificate.certificateCode} sắp hết hạn`,
            detail: expiresAt
              .toISOString()
              .slice(0, 10),
          });
        }
      }
    }

    for (const caseItem of input.cases.filter(
      (item) =>
        item.priority === 'CRITICAL' &&
        !['RESOLVED', 'REJECTED'].includes(
          item.status,
        ),
    )) {
      alerts.push({
        code: 'CRITICAL_CASE_OPEN',
        severity: 'CRITICAL',
        entityType: 'SUPPORT_CASE',
        entityId: caseItem.id,
        title: `${caseItem.caseCode} chưa được xử lý`,
        detail: caseItem.subject,
      });
    }

    const severityRank = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    return alerts.sort(
      (a, b) =>
        severityRank[b.severity] -
        severityRank[a.severity],
    );
  }

  private buildMonthlyTrend(
    rows: Array<typeof jobs.$inferSelect>,
  ) {
    const buckets = new Map<
      string,
      {
        month: string;
        total: number;
        completed: number;
        cancelled: number;
      }
    >();

    for (const job of rows) {
      const month = job.createdAt
        .toISOString()
        .slice(0, 7);
      const bucket = buckets.get(month) ?? {
        month,
        total: 0,
        completed: 0,
        cancelled: 0,
      };

      bucket.total += 1;
      bucket.completed +=
        job.status === 'COMPLETED' ? 1 : 0;
      bucket.cancelled +=
        job.status === 'CANCELLED' ? 1 : 0;
      buckets.set(month, bucket);
    }

    return [...buckets.values()].sort((a, b) =>
      a.month.localeCompare(b.month),
    );
  }

  private resolveRange(
    query: ReportingQueryDto,
  ): DateRange {
    const to = query.to
      ? new Date(query.to)
      : new Date();
    const from = query.from
      ? new Date(query.from)
      : new Date(
          to.getTime() - 90 * 86_400_000,
        );

    if (
      Number.isNaN(from.getTime()) ||
      Number.isNaN(to.getTime()) ||
      from > to
    ) {
      throw new BadRequestException(
        'Khoảng thời gian báo cáo không hợp lệ',
      );
    }

    to.setHours(23, 59, 59, 999);

    return { from, to };
  }

  private percent(
    numerator: number,
    denominator: number,
  ) {
    return denominator > 0
      ? Math.round(
          (numerator / denominator) * 10_000,
        ) / 100
      : 0;
  }

  private average(values: number[]) {
    return values.length
      ? Math.round(
          (values.reduce(
            (sum, value) => sum + value,
            0,
          ) /
            values.length) *
            100,
        ) / 100
      : 0;
  }

  private money(value: number) {
    return Math.round(value * 100) / 100;
  }

  private asDate(value: Date | string) {
    return value instanceof Date
      ? value
      : new Date(value);
  }

  private csv(
    headers: string[],
    rows: Array<Record<string, unknown>>,
  ) {
    const escape = (value: unknown) => {
      const text =
        value === null || value === undefined
          ? ''
          : String(value);

      return `"${text.replaceAll('"', '""')}"`;
    };

    return [
      headers.map(escape).join(','),
      ...rows.map((row) =>
        headers
          .map((header) => escape(row[header]))
          .join(','),
      ),
    ].join('\r\n');
  }
}
