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
