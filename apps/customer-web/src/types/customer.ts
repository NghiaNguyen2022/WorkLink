export interface Job {
  id: string;
  jobCode: string;
  customerId: string;
  categoryId: string;
  locationId: string;
  title: string;
  description: string;
  status: string;
  headcount: number;
  startAt: string;
  endAt: string;
  agreedPrice?: number | null;
  customerBudget?: number | null;
}

export interface CustomerDashboard {
  totalJobs: number;
  draftJobs: number;
  activeJobs: number;
  completedJobs: number;
  pendingPayments: number;
  totalPaid: number;
  reviewPendingJobs: number;
  recentJobs: Job[];
}

export interface CustomerDispute {
  id: string;
  caseCode: string;
  caseType: string;
  priority: string;
  status: string;
  subject: string;
  description: string;
  resolution?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface JobRequirement {
  id: string;
  requirementType: string;
  requirementCode?: string | null;
  description: string;
  mandatory: boolean;
  minimumLevel?: string | null;
}

export interface JobRequirementInput {
  requirementType: string;
  requirementCode?: string;
  description: string;
  mandatory: boolean;
  minimumLevel?: string;
}

export interface CustomerJobDetail {
  job: Job;
  requirements: JobRequirement[];
  quotes: Array<{
    id: string;
    quoteStatus: string;
    customerTotal: number;
    workerPayoutAmount: number;
    platformFeeAmount: number;
    createdAt: string;
  }>;
  assignments: Array<{
    assignment: {
      id: string;
      workerId: string;
      status: string;
      agreedPayout: number;
    };
    worker: {
      rating: number;
      completedJobs: number;
      onTimeRate: number;
    };
    workerUser: {
      id: string;
      fullName: string;
      phone?: string | null;
    };
    session?: {
      checkInAt?: string | null;
      checkOutAt?: string | null;
      actualMinutes?: number | null;
      overtimeMinutes?: number | null;
      customerConfirmedAt?: string | null;
    } | null;
  }>;
  payments: Array<{
    id: string;
    paymentType: string;
    status: string;
    amount: number;
    currency: string;
  }>;
  reviews: Array<{
    id: string;
    assignmentId: string;
    overallRating: number;
    comment?: string | null;
  }>;
  settlement?: Record<string, unknown> | null;
  disputes: CustomerDispute[];
}

export interface CustomerProfile {
  id: string;
  customerType: string;
  displayName: string;
  companyName?: string | null;
  taxCode?: string | null;
  verificationStatus: string;
  rating: number;
  completedJobs: number;
  email: string;
  fullName: string;
  phone?: string | null;
}

export interface CustomerLocation {
  id: string;
  customerId: string;
  label: string;
  contactName: string;
  contactPhone: string;
  addressLine: string;
  ward?: string | null;
  district: string;
  city: string;
  isDefault: boolean;
}

export interface JobCategory {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  pricingUnit: string;
  baseRate: number;
  active: boolean;
}
