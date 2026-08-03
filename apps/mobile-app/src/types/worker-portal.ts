export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  mustChangePassword: boolean;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  user: AuthenticatedUser;
  profileId: string | null;
}

export interface WorkerDashboard {
  activeAssignments: number;
  waitingConfirmation: number;
  completedAssignments: number;
  pendingOffers: number;
  totalEarned: number;
  pendingEarnings: number;
  earningsThisMonth: number;
  recentAssignments: Array<{
    assignment: WorkerAssignment;
    job: WorkerJob;
  }>;
}

export interface WorkerJob {
  id: string;
  jobCode: string;
  title: string;
  status: string;
  startAt: string;
  endAt: string;
}

export interface WorkerAssignment {
  id: string;
  jobId: string;
  workerId: string;
  status: string;
  agreedPayout: number;
  retentionAmount: number;
  confirmedAt: string;
}

export interface WorkerProfile {
  id: string;
  userId: string;
  biography: string | null;
  currentAddress: string | null;
  currentDistrict: string | null;
  currentCity: string | null;
  transportType: string | null;
  maxTravelKm: number;
  minimumHourlyRate: number | null;
  rating: number;
  completedJobs: number;
  available: boolean;
  isSuspended: boolean;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
}

export interface WorkerAvailability {
  id: string;
  workerId: string;
  availabilityType: string;
  dayOfWeek: number | null;
  specificDate: string | null;
  startTime: string;
  endTime: string;
  serviceAreas: string[] | null;
  isAvailable: boolean;
}

export interface WorkerSkill {
  id: string;
  skillCode: string;
  skillName: string;
  proficiencyLevel: string;
  verificationStatus: string;
}

export interface WorkerCertificate {
  id: string;
  certificateCode: string;
  certificateNumber: string;
  status: string;
  issuedAt: string;
  expiresAt: string | null;
}

export interface WorkerOffer {
  offerId: string;
  candidateId: string;
  jobId: string;
  jobCode: string;
  jobTitle: string;
  startAt: string;
  endAt: string;
  proposedPayout: number;
  status: string;
  offeredAt: string;
  expiresAt: string;
  totalScore: number | null;
  reasons: string[] | null;
}

export interface AssignmentExecution {
  assignment: WorkerAssignment;
  session: {
    id: string;
    checkInAt: string | null;
    checkOutAt: string | null;
    actualMinutes: number | null;
    overtimeMinutes: number | null;
    evidence: Array<{ type: string; url: string }> | null;
  } | null;
  events: Array<{
    id: string;
    eventType: string;
    createdAt: string;
    note: string | null;
  }>;
  incidents: Array<{
    id: string;
    incidentType: string;
    severity: string;
    status: string;
    description: string;
  }>;
}

export interface WorkerRelationship {
  customerId: string;
  workerId: string;
  setByParty: string;
  preferenceType: string;
}

export interface WorkerEarnings {
  worker: { id: string; userId: string; fullName: string };
  summary: {
    total: number;
    paid: number;
    pending: number;
  };
  items: Array<{
    payment: {
      id: string;
      amount: number;
      status: string;
      createdAt: string;
    };
    job: WorkerJob;
  }>;
}
