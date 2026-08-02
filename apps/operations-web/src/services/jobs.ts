import { apiRequest } from '../lib/api';
import type {
  Job,
  JobExecutionResponse,
  JobQualityOverview,
  Relationship,
  Review,
} from '../types/worklink';

export const jobsApi = {
  list: () => apiRequest<Job[]>('/jobs'),

  get: (jobId: string) =>
    apiRequest<Job>(`/jobs/${jobId}`),

  execution: (jobId: string) =>
    apiRequest<JobExecutionResponse>(
      `/jobs/${jobId}/execution`,
    ),

  reviews: (jobId: string) =>
    apiRequest<Review[]>(`/jobs/${jobId}/reviews`),

  createReview: (
    jobId: string,
    body: {
      reviewerUserId: string;
      assignmentId: string;
      reviewerType:
        | 'CUSTOMER_TO_WORKER'
        | 'WORKER_TO_CUSTOMER';
      overallRating: number;
      criteria: Record<string, number>;
      comment?: string;
      wouldHireAgain?: boolean;
    },
  ) =>
    apiRequest<Review[]>(`/jobs/${jobId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  setRelationship: (body: {
    customerId: string;
    workerId: string;
    actorUserId: string;
    setByParty: 'CUSTOMER' | 'WORKER';
    preferenceType:
      | 'PREFERRED'
      | 'BLOCKED'
      | 'NEUTRAL';
    sourceJobId?: string;
    reason?: string;
  }) =>
    apiRequest<Relationship>('/relationships', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  moderateReview: (
    reviewId: string,
    body: {
      actorUserId: string;
      status: 'PUBLISHED' | 'FLAGGED' | 'HIDDEN';
      reason: string;
    },
  ) =>
    apiRequest<{
      reviewId: string;
      previousStatus: string;
      status: string;
    }>(`/reviews/${reviewId}/moderate`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  qualityOverview: (jobId: string) =>
    apiRequest<JobQualityOverview>(
      `/jobs/${jobId}/quality-overview`,
    ),

  rehire: (
    jobId: string,
    body: {
      requestedByUserId: string;
      preferredWorkerId?: string;
      startAt: string;
      endAt: string;
      title?: string;
      specialNotes?: string;
    },
  ) =>
    apiRequest<{
      sourceJobId: string;
      newJobId: string;
      newJobCode: string;
      status: string;
    }>(`/jobs/${jobId}/re-hire`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
