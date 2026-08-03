import { randomUUID } from 'node:crypto';

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  and,
  asc,
  desc,
  eq,
  inArray,
} from 'drizzle-orm';

import { DatabaseService } from '../../database/database.service';
import {
  assignments,
  candidateOffers,
  customerLocations,
  customerProfiles,
  jobRequirements,
  jobs,
  payments,
  pricingQuotes,
  reviews,
  settlements,
  users,
  workerProfiles,
  workSessions,
} from '../../database/schema/index';
import { ExceptionsService } from '../exceptions/exceptions.service';
import { ExecutionService } from '../execution/execution.service';
import { QualityService } from '../quality/quality.service';
import {
  ApproveQuoteDto,
  CreateCustomerJobDto,
  CustomerActionDto,
  CustomerComplaintDto,
  CustomerRehireDto,
  CustomerRelationshipDto,
  CustomerReviewDto,
} from './dto/customer-portal.dto';

@Injectable()
export class CustomerPortalService {
  constructor(
    private readonly database: DatabaseService,
    private readonly executionService: ExecutionService,
    private readonly qualityService: QualityService,
    private readonly exceptionsService: ExceptionsService,
  ) {}

  async dashboard(
    customerId: string,
    customerUserId: string,
  ) {
    await this.assertCustomer(customerId, customerUserId);

    const customerJobs = await this.database.db
      .select()
      .from(jobs)
      .where(eq(jobs.customerId, customerId))
      .orderBy(desc(jobs.createdAt));

    const jobIds = customerJobs.map((item) => item.id);

    const jobPayments = jobIds.length
      ? await this.database.db
          .select()
          .from(payments)
          .where(inArray(payments.jobId, jobIds))
      : [];

    const jobReviews = jobIds.length
      ? await this.database.db
          .select()
          .from(reviews)
          .where(inArray(reviews.jobId, jobIds))
      : [];

    return {
      totalJobs: customerJobs.length,
      draftJobs: customerJobs.filter(
        (item) => item.status === 'DRAFT',
      ).length,
      activeJobs: customerJobs.filter((item) =>
        [
          'PENDING_VERIFICATION',
          'VERIFIED',
          'PRICED',
          'PENDING_CUSTOMER_APPROVAL',
          'MATCHING',
          'ASSIGNED',
          'IN_PROGRESS',
        ].includes(item.status),
      ).length,
      completedJobs: customerJobs.filter(
        (item) => item.status === 'COMPLETED',
      ).length,
      pendingPayments: jobPayments.filter(
        (item) => item.status === 'PENDING',
      ).length,
      totalPaid: jobPayments
        .filter(
          (item) =>
            item.status === 'PAID' &&
            item.paymentType === 'CUSTOMER_CHARGE',
        )
        .reduce((sum, item) => sum + item.amount, 0),
      reviewPendingJobs: customerJobs.filter(
        (job) =>
          job.status === 'COMPLETED' &&
          !jobReviews.some(
            (review) =>
              review.jobId === job.id &&
              review.reviewerUserId === customerUserId,
          ),
      ).length,
      recentJobs: customerJobs.slice(0, 5),
    };
  }

  async listJobs(
    customerId: string,
    customerUserId: string,
  ) {
    await this.assertCustomer(customerId, customerUserId);

    return this.database.db
      .select()
      .from(jobs)
      .where(eq(jobs.customerId, customerId))
      .orderBy(desc(jobs.createdAt));
  }

  async jobDetail(
    customerId: string,
    jobId: string,
    customerUserId: string,
  ) {
    await this.assertCustomer(customerId, customerUserId);

    const [job] = await this.database.db
      .select()
      .from(jobs)
      .where(
        and(
          eq(jobs.id, jobId),
          eq(jobs.customerId, customerId),
        ),
      )
      .limit(1);

    if (!job) {
      throw new NotFoundException(
        'Không tìm thấy Job của khách hàng',
      );
    }

    const [
      requirements,
      quotes,
      assignmentRows,
      jobPayments,
      jobReviews,
      [settlement],
    ] = await Promise.all([
      this.database.db
        .select()
        .from(jobRequirements)
        .where(eq(jobRequirements.jobId, jobId)),
      this.database.db
        .select()
        .from(pricingQuotes)
        .where(eq(pricingQuotes.jobId, jobId))
        .orderBy(desc(pricingQuotes.createdAt)),
      this.database.db
        .select({
          assignment: assignments,
          worker: workerProfiles,
          workerUser: {
            id: users.id,
            fullName: users.fullName,
            phone: users.phone,
          },
          session: workSessions,
        })
        .from(assignments)
        .innerJoin(
          workerProfiles,
          eq(assignments.workerId, workerProfiles.id),
        )
        .innerJoin(
          users,
          eq(workerProfiles.userId, users.id),
        )
        .leftJoin(
          workSessions,
          eq(workSessions.assignmentId, assignments.id),
        )
        .where(eq(assignments.jobId, jobId))
        .orderBy(asc(users.fullName)),
      this.database.db
        .select()
        .from(payments)
        .where(eq(payments.jobId, jobId))
        .orderBy(desc(payments.createdAt)),
      this.database.db
        .select()
        .from(reviews)
        .where(eq(reviews.jobId, jobId))
        .orderBy(desc(reviews.createdAt)),
      this.database.db
        .select()
        .from(settlements)
        .where(eq(settlements.jobId, jobId))
        .limit(1),
    ]);

    return {
      job,
      requirements,
      quotes,
      assignments: assignmentRows,
      payments: jobPayments,
      reviews: jobReviews,
      settlement: settlement ?? null,
    };
  }

  async createJob(
    customerId: string,
    customerUserId: string,
    input: CreateCustomerJobDto,
  ) {
    await this.assertCustomer(customerId, customerUserId);

    const [location] = await this.database.db
      .select({ id: customerLocations.id })
      .from(customerLocations)
      .where(
        and(
          eq(customerLocations.id, input.locationId),
          eq(customerLocations.customerId, customerId),
        ),
      )
      .limit(1);

    if (!location) {
      throw new BadRequestException(
        'Địa điểm không thuộc khách hàng',
      );
    }

    const startAt = new Date(input.startAt);
    const endAt = new Date(input.endAt);

    if (
      Number.isNaN(startAt.getTime()) ||
      Number.isNaN(endAt.getTime()) ||
      endAt <= startAt
    ) {
      throw new BadRequestException(
        'Thời gian công việc không hợp lệ',
      );
    }

    const jobId = randomUUID();

    await this.database.db.transaction(async (tx) => {
      await tx.insert(jobs).values({
        id: jobId,
        jobCode: `WL-${Date.now()}`,
        customerId,
        categoryId: input.categoryId,
        locationId: input.locationId,
        title: input.title,
        description: input.description,
        status: 'DRAFT',
        matchingMode: 'MANAGED',
        riskLevel: 'NORMAL',
        headcount: input.headcount,
        startAt,
        endAt,
        breakMinutes: input.breakMinutes ?? 0,
        customerBudget: input.customerBudget,
        dressCode: input.dressCode,
        toolsProvidedBy: input.toolsProvidedBy,
        specialNotes: input.specialNotes,
      });

      for (const requirement of input.requirements ?? []) {
        await tx.insert(jobRequirements).values({
          id: randomUUID(),
          jobId,
          requirementType: requirement.requirementType,
          requirementCode: requirement.requirementCode,
          description: requirement.description,
          mandatory: requirement.mandatory,
          minimumLevel: requirement.minimumLevel,
        });
      }
    });

    return this.jobDetail(customerId, jobId, customerUserId);
  }

  async submitJob(
    customerId: string,
    jobId: string,
    customerUserId: string,
    _input: CustomerActionDto,
  ) {
    const detail = await this.jobDetail(
      customerId,
      jobId,
      customerUserId,
    );

    if (detail.job.status !== 'DRAFT') {
      throw new BadRequestException(
        'Chỉ Job DRAFT mới được gửi xác minh',
      );
    }

    await this.database.db
      .update(jobs)
      .set({ status: 'PENDING_VERIFICATION' })
      .where(eq(jobs.id, jobId));

    return this.jobDetail(customerId, jobId, customerUserId);
  }

  async approveQuote(
    customerId: string,
    jobId: string,
    customerUserId: string,
    input: ApproveQuoteDto,
  ) {
    const detail = await this.jobDetail(
      customerId,
      jobId,
      customerUserId,
    );

    const quote = detail.quotes.find(
      (item) => item.id === input.quoteId,
    );

    if (!quote) {
      throw new NotFoundException(
        'Báo giá không thuộc Job',
      );
    }

    await this.database.db.transaction(async (tx) => {
      await tx
        .update(pricingQuotes)
        .set({
          quoteStatus: 'ACCEPTED',
          acceptedAt: new Date(),
          acceptedByUserId: customerUserId,
        })
        .where(eq(pricingQuotes.id, input.quoteId));

      await tx
        .update(jobs)
        .set({
          status: 'MATCHING',
          agreedPrice: quote.customerTotal,
          workerPayoutAmount: quote.workerPayoutAmount,
          platformFeeAmount: quote.platformFeeAmount,
        })
        .where(eq(jobs.id, jobId));
    });

    return this.jobDetail(customerId, jobId, customerUserId);
  }

  async confirmAssignment(
    customerId: string,
    jobId: string,
    assignmentId: string,
    customerUserId: string,
    input: CustomerActionDto,
  ) {
    await this.jobDetail(customerId, jobId, customerUserId);

    return this.executionService.customerConfirm(
      assignmentId,
      {
        customerUserId,
        note: input.note,
      },
    );
  }

  async reviewWorker(
    customerId: string,
    jobId: string,
    customerUserId: string,
    input: CustomerReviewDto,
  ) {
    await this.jobDetail(customerId, jobId, customerUserId);

    return this.qualityService.createReview(jobId, {
      reviewerUserId: customerUserId,
      assignmentId: input.assignmentId,
      reviewerType: 'CUSTOMER_TO_WORKER',
      overallRating: input.overallRating,
      criteria: input.criteria,
      comment: input.comment,
      wouldHireAgain: input.wouldHireAgain,
    });
  }

  async setRelationship(
    customerId: string,
    jobId: string,
    customerUserId: string,
    input: CustomerRelationshipDto,
  ) {
    await this.jobDetail(customerId, jobId, customerUserId);

    return this.qualityService.setRelationship({
      customerId,
      workerId: input.workerId,
      actorUserId: customerUserId,
      setByParty: 'CUSTOMER',
      preferenceType: input.preferenceType,
      sourceJobId: jobId,
      reason: input.reason,
    });
  }

  async rehire(
    customerId: string,
    jobId: string,
    customerUserId: string,
    input: CustomerRehireDto,
  ) {
    await this.jobDetail(customerId, jobId, customerUserId);

    return this.qualityService.rehire(jobId, {
      requestedByUserId: customerUserId,
      preferredWorkerId: input.preferredWorkerId,
      startAt: input.startAt,
      endAt: input.endAt,
      title: input.title,
      specialNotes: input.specialNotes,
    });
  }

  async openComplaint(
    customerId: string,
    jobId: string,
    customerUserId: string,
    input: CustomerComplaintDto,
  ) {
    await this.jobDetail(customerId, jobId, customerUserId);

    return this.exceptionsService.openDispute(jobId, {
      actorUserId: customerUserId,
      caseType: input.caseType,
      priority: input.priority,
      subject: input.subject,
      description: input.description,
    });
  }

  private async assertCustomer(
    customerId: string,
    customerUserId: string,
  ) {
    const [customer] = await this.database.db
      .select()
      .from(customerProfiles)
      .where(
        and(
          eq(customerProfiles.id, customerId),
          eq(customerProfiles.userId, customerUserId),
        ),
      )
      .limit(1);

    if (!customer) {
      throw new ForbiddenException(
        'Tài khoản hiện tại không thuộc quyền sở hữu customerId này',
      );
    }

    return customer;
  }
}
