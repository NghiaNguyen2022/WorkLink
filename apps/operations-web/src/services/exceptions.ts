import { apiRequest } from '../lib/api';
import type { JobExceptionOverview } from '../types/worklink';

export const exceptionsApi = {
  overview: (jobId: string) =>
    apiRequest<JobExceptionOverview>(
      `/jobs/${jobId}/exceptions`,
    ),

  assessCancellation: (
    assignmentId: string,
    body: {
      actorUserId: string;
      eventType: 'CANCELLATION' | 'NO_SHOW';
      cancelledByParty: 'CUSTOMER' | 'WORKER' | 'OPERATIONS';
      reason: string;
    },
  ) =>
    apiRequest<JobExceptionOverview>(
      `/assignments/${assignmentId}/cancellation-assessment`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
    ),

  requestReplacement: (
    assignmentId: string,
    body: {
      actorUserId: string;
      reason: string;
      priority?: 'NORMAL' | 'HIGH' | 'CRITICAL';
    },
  ) =>
    apiRequest<JobExceptionOverview>(
      `/assignments/${assignmentId}/replacement-requests`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
    ),

  fulfillReplacement: (
    requestId: string,
    body: {
      actorUserId: string;
      workerId: string;
      agreedPayout: number;
      retentionAmount?: number;
    },
  ) =>
    apiRequest<JobExceptionOverview>(
      `/replacement-requests/${requestId}/fulfill`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
    ),

  openDispute: (
    jobId: string,
    body: {
      actorUserId: string;
      caseType: 'COMPLAINT' | 'DISPUTE';
      priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
      subject: string;
      description: string;
    },
  ) =>
    apiRequest<{ case: { id: string; caseCode: string } }>(
      `/jobs/${jobId}/disputes`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
    ),

  approveAdjustment: (
    adjustmentId: string,
    body: { actorUserId: string },
  ) =>
    apiRequest<{ case: { id: string } }>(
      `/financial-adjustments/${adjustmentId}/approve`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
    ),
};
