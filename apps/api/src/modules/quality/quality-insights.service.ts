import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  asc,
  eq,
  inArray,
} from 'drizzle-orm';

import { DatabaseService } from '../../database/database.service';
import {
  assignments,
  customerQualityMetrics,
  jobs,
  relationshipPreferences,
  rehireLinks,
  reviewMetricUpdates,
  reviews,
  workerProfiles,
} from '../../database/schema/index';

@Injectable()
export class QualityInsightsService {
  constructor(
    private readonly database: DatabaseService,
  ) {}

  async reviewMetric(reviewId: string) {
    const [review] = await this.database.db
      .select()
      .from(reviews)
      .where(eq(reviews.id, reviewId))
      .limit(1);

    if (!review) {
      throw new NotFoundException('Không tìm thấy review');
    }

    const [metricUpdate] = await this.database.db
      .select()
      .from(reviewMetricUpdates)
      .where(eq(reviewMetricUpdates.reviewId, reviewId))
      .limit(1);

    return {
      review,
      metricUpdate: metricUpdate ?? null,
    };
  }

  async jobOverview(jobId: string) {
    const [job] = await this.database.db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (!job) {
      throw new NotFoundException('Không tìm thấy Job');
    }

    const jobReviews = await this.database.db
      .select()
      .from(reviews)
      .where(eq(reviews.jobId, jobId))
      .orderBy(asc(reviews.createdAt));

    const reviewIds = jobReviews.map((item) => item.id);

    const metricUpdates = reviewIds.length
      ? await this.database.db
          .select()
          .from(reviewMetricUpdates)
          .where(inArray(reviewMetricUpdates.reviewId, reviewIds))
      : [];

    const jobAssignments = await this.database.db
      .select({
        assignmentId: assignments.id,
        workerId: assignments.workerId,
      })
      .from(assignments)
      .where(eq(assignments.jobId, jobId));

    const workerIds = jobAssignments.map((item) => item.workerId);

    const relationships = workerIds.length
      ? await this.database.db
          .select()
          .from(relationshipPreferences)
          .where(
            inArray(
              relationshipPreferences.workerId,
              workerIds,
            ),
          )
      : [];

    const [customerMetric] = await this.database.db
      .select()
      .from(customerQualityMetrics)
      .where(
        eq(
          customerQualityMetrics.customerId,
          job.customerId,
        ),
      )
      .limit(1);

    const rehires = await this.database.db
      .select()
      .from(rehireLinks)
      .where(eq(rehireLinks.sourceJobId, jobId))
      .orderBy(asc(rehireLinks.createdAt));

    return {
      jobId,
      matchingRule: {
        version: 'RELATIONSHIP_V1',
        blocked: 'HARD_FILTER',
        preferredBonus: 5,
        maximumScore: 100,
      },
      reviews: jobReviews,
      metricUpdates,
      relationships: relationships.filter(
        (item) => item.customerId === job.customerId,
      ),
      customerMetric: customerMetric ?? null,
      rehires,
    };
  }

  async workerMetric(workerId: string) {
    const [worker] = await this.database.db
      .select()
      .from(workerProfiles)
      .where(eq(workerProfiles.id, workerId))
      .limit(1);

    if (!worker) {
      throw new NotFoundException(
        'Không tìm thấy Worker',
      );
    }

    return worker;
  }
}
