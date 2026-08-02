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
  customerProfiles,
  customerQualityMetrics,
  jobRequirements,
  jobs,
  relationshipPreferences,
  rehireLinks,
  reviewMetricUpdates,
  reviews,
  users,
  workerProfiles,
  workSessions,
} from '../../database/schema/index';
import {
  CreateReviewDto,
  ModerateReviewDto,
  RehireJobDto,
  SetRelationshipDto,
} from './dto/quality.dto';

@Injectable()
export class QualityService {
  constructor(private readonly database: DatabaseService) {}

  async createReview(jobId: string, input: CreateReviewDto) {
    const context = await this.getReviewContext(
      jobId,
      input.assignmentId,
    );

    if (context.job.status !== 'COMPLETED') {
      throw new BadRequestException(
        'Chỉ được đánh giá Job đã COMPLETED',
      );
    }

    const isCustomerReview =
      input.reviewerType === 'CUSTOMER_TO_WORKER';

    const expectedReviewer = isCustomerReview
      ? context.customerUserId
      : context.workerUserId;

    if (input.reviewerUserId !== expectedReviewer) {
      throw new BadRequestException(
        'Reviewer không thuộc vai trò đánh giá của Job',
      );
    }

    const revieweeUserId = isCustomerReview
      ? context.workerUserId
      : context.customerUserId;

    const [existing] = await this.database.db
      .select({ id: reviews.id })
      .from(reviews)
      .where(
        and(
          eq(reviews.jobId, jobId),
          eq(reviews.reviewerUserId, input.reviewerUserId),
        ),
      )
      .limit(1);

    if (existing) {
      throw new BadRequestException(
        'Reviewer đã đánh giá Job này',
      );
    }

    const reviewId = randomUUID();

    await this.database.db.transaction(async (tx) => {
      await tx.insert(reviews).values({
        id: reviewId,
        jobId,
        assignmentId: input.assignmentId,
        reviewerUserId: input.reviewerUserId,
        revieweeUserId,
        reviewerType: input.reviewerType,
        overallRating: input.overallRating,
        criteria: input.criteria,
        comment: input.comment,
        wouldHireAgain:
          input.wouldHireAgain === undefined
            ? null
            : input.wouldHireAgain
              ? 1
              : 0,
        status: 'PUBLISHED',
      });

      await tx.insert(auditLogs).values({
        id: randomUUID(),
        actorUserId: input.reviewerUserId,
        action: 'REVIEW_CREATED',
        entityType: 'REVIEW',
        entityId: reviewId,
        afterData: {
          jobId,
          reviewerType: input.reviewerType,
          overallRating: input.overallRating,
        },
      });
    });

    await this.applyMetrics(reviewId);

    return this.getReviews(jobId);
  }

  async getReviews(jobId: string) {
    return this.database.db
      .select()
      .from(reviews)
      .where(eq(reviews.jobId, jobId))
      .orderBy(asc(reviews.createdAt));
  }

  async moderateReview(
    reviewId: string,
    input: ModerateReviewDto,
  ) {
    const [review] = await this.database.db
      .select()
      .from(reviews)
      .where(eq(reviews.id, reviewId))
      .limit(1);

    if (!review) {
      throw new NotFoundException('Không tìm thấy review');
    }

    await this.database.db.transaction(async (tx) => {
      await tx
        .update(reviews)
        .set({ status: input.status })
        .where(eq(reviews.id, reviewId));

      await tx.insert(auditLogs).values({
        id: randomUUID(),
        actorUserId: input.actorUserId,
        action: 'REVIEW_STATUS_CHANGED',
        entityType: 'REVIEW',
        entityId: reviewId,
        beforeData: { status: review.status },
        afterData: {
          status: input.status,
          reason: input.reason,
        },
      });
    });

    return {
      reviewId,
      previousStatus: review.status,
      status: input.status,
    };
  }

  async setRelationship(input: SetRelationshipDto) {
    await this.assertRelationshipActor(input);

    await this.database.db
      .insert(relationshipPreferences)
      .values({
        id: randomUUID(),
        customerId: input.customerId,
        workerId: input.workerId,
        setByParty: input.setByParty,
        preferenceType: input.preferenceType,
        reason: input.reason,
        sourceJobId: input.sourceJobId,
        active: 1,
        createdByUserId: input.actorUserId,
      })
      .onDuplicateKeyUpdate({
        set: {
          preferenceType: input.preferenceType,
          reason: input.reason,
          sourceJobId: input.sourceJobId,
          active: 1,
          createdByUserId: input.actorUserId,
        },
      });

    return {
      customerId: input.customerId,
      workerId: input.workerId,
      setByParty: input.setByParty,
      preferenceType: input.preferenceType,
    };
  }

  async customerRelationships(customerId: string) {
    return this.database.db
      .select()
      .from(relationshipPreferences)
      .where(eq(relationshipPreferences.customerId, customerId));
  }

  async workerRelationships(workerId: string) {
    return this.database.db
      .select()
      .from(relationshipPreferences)
      .where(eq(relationshipPreferences.workerId, workerId));
  }

  async rehire(jobId: string, input: RehireJobDto) {
    const [source] = await this.database.db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (!source) {
      throw new NotFoundException('Không tìm thấy Job gốc');
    }

    if (source.status !== 'COMPLETED') {
      throw new BadRequestException(
        'Chỉ Re-hire từ Job đã COMPLETED',
      );
    }

    const [customer] = await this.database.db
      .select()
      .from(customerProfiles)
      .where(eq(customerProfiles.id, source.customerId))
      .limit(1);

    if (customer?.userId !== input.requestedByUserId) {
      throw new BadRequestException(
        'Người yêu cầu không phải chủ Job',
      );
    }

    if (input.preferredWorkerId) {
      const [blocked] = await this.database.db
        .select({ id: relationshipPreferences.id })
        .from(relationshipPreferences)
        .where(
          and(
            eq(relationshipPreferences.customerId, source.customerId),
            eq(relationshipPreferences.workerId, input.preferredWorkerId),
            eq(relationshipPreferences.preferenceType, 'BLOCKED'),
            eq(relationshipPreferences.active, 1),
          ),
        )
        .limit(1);

      if (blocked) {
        throw new BadRequestException(
          'Không thể Re-hire quan hệ đang BLOCKED',
        );
      }
    }

    const startAt = new Date(input.startAt);
    const endAt = new Date(input.endAt);

    if (
      Number.isNaN(startAt.getTime()) ||
      Number.isNaN(endAt.getTime()) ||
      endAt <= startAt
    ) {
      throw new BadRequestException(
        'Thời gian Job mới không hợp lệ',
      );
    }

    const requirements = await this.database.db
      .select()
      .from(jobRequirements)
      .where(eq(jobRequirements.jobId, jobId));

    const newJobId = randomUUID();
    const newJobCode = `WL-${Date.now()}`;

    await this.database.db.transaction(async (tx) => {
      await tx.insert(jobs).values({
        id: newJobId,
        jobCode: newJobCode,
        customerId: source.customerId,
        categoryId: source.categoryId,
        locationId: source.locationId,
        title: input.title ?? source.title,
        description: source.description,
        status: 'DRAFT',
        matchingMode: source.matchingMode,
        riskLevel: source.riskLevel,
        headcount: source.headcount,
        startAt,
        endAt,
        breakMinutes: source.breakMinutes,
        customerBudget: source.customerBudget,
        dressCode: source.dressCode,
        toolsProvidedBy: source.toolsProvidedBy,
        specialNotes: input.specialNotes ?? source.specialNotes,
      });

      for (const requirement of requirements) {
        await tx.insert(jobRequirements).values({
          id: randomUUID(),
          jobId: newJobId,
          requirementType: requirement.requirementType,
          requirementCode: requirement.requirementCode,
          description: requirement.description,
          mandatory: requirement.mandatory,
          minimumLevel: requirement.minimumLevel,
          metadata: requirement.metadata,
        });
      }

      await tx.insert(rehireLinks).values({
        id: randomUUID(),
        sourceJobId: jobId,
        newJobId,
        preferredWorkerId: input.preferredWorkerId,
        requestedByUserId: input.requestedByUserId,
        inheritedFields: [
          'customerId',
          'categoryId',
          'locationId',
          'description',
          'matchingMode',
          'riskLevel',
          'headcount',
          'breakMinutes',
          'dressCode',
          'toolsProvidedBy',
          'requirements',
        ],
      });
    });

    return {
      sourceJobId: jobId,
      newJobId,
      newJobCode,
      status: 'DRAFT',
      preferredWorkerId: input.preferredWorkerId ?? null,
    };
  }

  async rehireHistory(jobId: string) {
    return this.database.db
      .select()
      .from(rehireLinks)
      .where(eq(rehireLinks.sourceJobId, jobId))
      .orderBy(asc(rehireLinks.createdAt));
  }

  private async applyMetrics(reviewId: string) {
    const [alreadyProcessed] = await this.database.db
      .select({ id: reviewMetricUpdates.id })
      .from(reviewMetricUpdates)
      .where(eq(reviewMetricUpdates.reviewId, reviewId))
      .limit(1);

    if (alreadyProcessed) {
      return;
    }

    const [review] = await this.database.db
      .select()
      .from(reviews)
      .where(eq(reviews.id, reviewId))
      .limit(1);

    if (!review || review.status !== 'PUBLISHED') {
      return;
    }

    if (review.reviewerType === 'CUSTOMER_TO_WORKER') {
      const [worker] = await this.database.db
        .select()
        .from(workerProfiles)
        .where(eq(workerProfiles.userId, review.revieweeUserId))
        .limit(1);

      if (!worker) {
        return;
      }

      const nextCompleted = worker.completedJobs + 1;
      const nextRating =
        Math.round(
          (
            (worker.rating * worker.completedJobs +
              review.overallRating) /
            nextCompleted
          ) * 100,
        ) / 100;

      const before = {
        rating: worker.rating,
        completedJobs: worker.completedJobs,
        onTimeRate: worker.onTimeRate,
      };

      const punctuality = review.criteria?.punctuality;
      const nextOnTimeRate =
        typeof punctuality === 'number'
          ? Math.round(
              (
                (worker.onTimeRate * worker.completedJobs +
                  (punctuality / 5) * 100) /
                nextCompleted
              ) * 100,
            ) / 100
          : worker.onTimeRate;

      const after = {
        rating: nextRating,
        completedJobs: nextCompleted,
        onTimeRate: nextOnTimeRate,
      };

      await this.database.db.transaction(async (tx) => {
        await tx
          .update(workerProfiles)
          .set(after)
          .where(eq(workerProfiles.id, worker.id));

        await tx.insert(reviewMetricUpdates).values({
          id: randomUUID(),
          reviewId,
          targetType: 'WORKER',
          targetId: worker.id,
          scoringVersion: 'QUALITY_V1',
          beforeSnapshot: before,
          afterSnapshot: after,
        });
      });

      return;
    }

    const [customer] = await this.database.db
      .select()
      .from(customerProfiles)
      .where(eq(customerProfiles.userId, review.revieweeUserId))
      .limit(1);

    if (!customer) {
      return;
    }

    const [metric] = await this.database.db
      .select()
      .from(customerQualityMetrics)
      .where(eq(customerQualityMetrics.customerId, customer.id))
      .limit(1);

    const currentRating = metric?.rating ?? 5;
    const currentCount = metric?.reviewCount ?? 0;
    const nextCount = currentCount + 1;
    const nextRating =
      Math.round(
        (
          (currentRating * currentCount +
            review.overallRating) /
          nextCount
        ) * 100,
      ) / 100;

    const safety = review.criteria?.safety;
    const conditions = review.criteria?.workConditions;

    const nextSafety =
      typeof safety === 'number'
        ? Math.round(
            (
              ((metric?.safetyScore ?? 100) * currentCount +
                (safety / 5) * 100) /
              nextCount
            ) * 100,
          ) / 100
        : metric?.safetyScore ?? 100;

    const nextConditions =
      typeof conditions === 'number'
        ? Math.round(
            (
              ((metric?.workConditionScore ?? 100) *
                currentCount +
                (conditions / 5) * 100) /
              nextCount
            ) * 100,
          ) / 100
        : metric?.workConditionScore ?? 100;

    const riskLevel =
      nextRating < 2.5 || nextSafety < 50
        ? 'HIGH'
        : nextRating < 3.5 || nextSafety < 70
          ? 'MEDIUM'
          : 'LOW';

    const before = metric ?? {
      rating: 5,
      reviewCount: 0,
      safetyScore: 100,
      workConditionScore: 100,
      riskLevel: 'LOW',
    };

    const after = {
      rating: nextRating,
      completedJobs: (metric?.completedJobs ?? 0) + 1,
      reviewCount: nextCount,
      safetyScore: nextSafety,
      workConditionScore: nextConditions,
      riskLevel,
    };

    await this.database.db.transaction(async (tx) => {
      await tx
        .insert(customerQualityMetrics)
        .values({
          id: metric?.id ?? randomUUID(),
          customerId: customer.id,
          ...after,
        })
        .onDuplicateKeyUpdate({ set: after });

      await tx.insert(reviewMetricUpdates).values({
        id: randomUUID(),
        reviewId,
        targetType: 'CUSTOMER',
        targetId: customer.id,
        scoringVersion: 'QUALITY_V1',
        beforeSnapshot: before,
        afterSnapshot: after,
      });
    });
  }

  private async getReviewContext(
    jobId: string,
    assignmentId: string,
  ) {
    const [row] = await this.database.db
      .select({
        job: jobs,
        assignment: assignments,
        customerUserId: customerProfiles.userId,
        workerUserId: workerProfiles.userId,
        customerConfirmedAt: workSessions.customerConfirmedAt,
      })
      .from(assignments)
      .innerJoin(jobs, eq(assignments.jobId, jobs.id))
      .innerJoin(
        customerProfiles,
        eq(jobs.customerId, customerProfiles.id),
      )
      .innerJoin(
        workerProfiles,
        eq(assignments.workerId, workerProfiles.id),
      )
      .innerJoin(
        workSessions,
        eq(workSessions.assignmentId, assignments.id),
      )
      .where(
        and(
          eq(assignments.id, assignmentId),
          eq(assignments.jobId, jobId),
          eq(assignments.status, 'COMPLETED'),
        ),
      )
      .limit(1);

    if (!row || !row.customerConfirmedAt) {
      throw new NotFoundException(
        'Assignment chưa hoàn tất hoặc chưa được xác nhận',
      );
    }

    return row;
  }

  private async assertRelationshipActor(
    input: SetRelationshipDto,
  ) {
    if (input.setByParty === 'CUSTOMER') {
      const [customer] = await this.database.db
        .select({ userId: customerProfiles.userId })
        .from(customerProfiles)
        .where(eq(customerProfiles.id, input.customerId))
        .limit(1);

      if (customer?.userId !== input.actorUserId) {
        throw new BadRequestException(
          'Actor không thuộc customer',
        );
      }

      return;
    }

    const [worker] = await this.database.db
      .select({ userId: workerProfiles.userId })
      .from(workerProfiles)
      .where(eq(workerProfiles.id, input.workerId))
      .limit(1);

    if (worker?.userId !== input.actorUserId) {
      throw new BadRequestException(
        'Actor không thuộc worker',
      );
    }
  }
}
