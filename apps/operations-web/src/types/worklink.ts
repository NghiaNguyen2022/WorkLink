export interface Job {
  id: string;
  jobCode: string;
  title: string;
  description: string;
  status: string;
  headcount: number;
  startAt: string;
  endAt: string;
  agreedPrice?: number | null;
  customerId: string;
  categoryId: string;
  locationId: string;
  specialNotes?: string | null;
}

export interface Review {
  id: string;
  assignmentId: string;
  reviewerUserId: string;
  reviewerType: 'CUSTOMER_TO_WORKER' | 'WORKER_TO_CUSTOMER';
  overallRating: number;
  criteria?: Record<string, number>;
  comment?: string | null;
  wouldHireAgain?: number | null;
  status: string;
  createdAt: string;
}

export interface JobExecutionAssignment {
  assignment: {
    id: string;
    workerId: string;
    status: string;
    agreedPayout: number;
  };
  workerUser: {
    id: string;
    fullName: string;
    phone?: string | null;
  };
}

export interface JobExecutionResponse {
  job: Job;
  assignments: JobExecutionAssignment[];
}

export interface Relationship {
  id: string;
  customerId: string;
  workerId: string;
  setByParty: 'CUSTOMER' | 'WORKER';
  preferenceType: 'PREFERRED' | 'BLOCKED' | 'NEUTRAL';
  reason?: string | null;
}


export interface ReviewMetricUpdate {
  id: string;
  reviewId: string;
  targetType: string;
  targetId: string;
  scoringVersion: string;
  beforeSnapshot?: Record<string, unknown> | null;
  afterSnapshot?: Record<string, unknown> | null;
  processedAt: string;
}

export interface RehireLink {
  id: string;
  sourceJobId: string;
  newJobId: string;
  preferredWorkerId?: string | null;
  requestedByUserId: string;
  inheritedFields?: string[] | null;
  createdAt: string;
}

export interface JobQualityOverview {
  jobId: string;
  matchingRule: {
    version: string;
    blocked: string;
    preferredBonus: number;
    maximumScore: number;
  };
  reviews: Review[];
  metricUpdates: ReviewMetricUpdate[];
  relationships: Relationship[];
  customerMetric?: Record<string, unknown> | null;
  rehires: RehireLink[];
}

export interface CancellationAssessment {
  id: string;
  jobId: string;
  assignmentId?: string | null;
  eventType: string;
  cancelledByParty: string;
  status: string;
  customerFeeAmount: number;
  workerCompensationAmount: number;
  reason: string;
}

export interface ReplacementRequest {
  id: string;
  jobId: string;
  originalAssignmentId: string;
  replacementWorkerId?: string | null;
  status: string;
  priority: string;
  reason: string;
}

export interface SupportCase {
  id: string;
  caseCode: string;
  jobId?: string | null;
  caseType: string;
  priority: string;
  status: string;
  subject: string;
  description: string;
}

export interface FinancialAdjustment {
  id: string;
  supportCaseId: string;
  jobId: string;
  adjustmentType: string;
  amount: number;
  currency: string;
  status: string;
  reason: string;
}

export interface JobExceptionOverview {
  jobId: string;
  policyVersion: string;
  assessments: CancellationAssessment[];
  replacements: ReplacementRequest[];
  cases: SupportCase[];
  adjustments: FinancialAdjustment[];
}
