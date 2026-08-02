export interface RiskAlert {
  code: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  entityType: string;
  entityId: string;
  title: string;
  detail: string;
}

export interface ReportingDashboard {
  generatedAt: string;
  range: {
    from: string;
    to: string;
  };
  operations: {
    totalJobs: number;
    completedJobs: number;
    assignedJobs: number;
    fillRate: number;
    offerAcceptanceRate: number;
    averageTimeToFillMinutes: number;
    noShowRate: number;
    cancellationRate: number;
    averageCheckInDeltaMinutes: number;
    reviewCoverageRate: number;
  };
  finance: {
    customerCharges: number;
    workerPayouts: number;
    pendingWorkerPayouts: number;
    paymentFailureRate: number;
    payoutSlaRate: number;
    settlementVariance: number;
  };
  quality: {
    totalReviews: number;
    averageReview: number;
    openCases: number;
    disputeRate: number;
    expiringCertificates: number;
  };
  trends: Array<{
    month: string;
    total: number;
    completed: number;
    cancelled: number;
  }>;
  riskAlerts: RiskAlert[];
}
