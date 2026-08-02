import { Injectable } from '@nestjs/common';

interface PricingCategory {
  pricingUnit: string;
  minimumHours: number;
  baseRate: number;
  riskLevel: string;
}

interface PricingJob {
  headcount: number;
  startAt: Date;
  endAt: Date;
  breakMinutes: number;
}

interface PricingAdjustments {
  timeSurcharge?: number;
  locationSurcharge?: number;
  skillSurcharge?: number;
  urgencySurcharge?: number;
  riskSurcharge?: number;
  retentionFee?: number;
}

@Injectable()
export class JobPricingService {
  calculate(
    category: PricingCategory,
    job: PricingJob,
    adjustments: PricingAdjustments,
  ) {
    const durationHours = Math.max(
      0,
      (job.endAt.getTime() - job.startAt.getTime()) /
        3_600_000 -
        job.breakMinutes / 60,
    );

    const billableHours = Math.max(
      durationHours,
      category.minimumHours,
    );

    const basePerWorker =
      category.pricingUnit === 'SHIFT'
        ? category.baseRate
        : category.baseRate * billableHours;

    const baseAmount = Math.round(
      basePerWorker * job.headcount,
    );

    const timeSurcharge = adjustments.timeSurcharge ?? 0;
    const locationSurcharge =
      adjustments.locationSurcharge ?? 0;
    const skillSurcharge = adjustments.skillSurcharge ?? 0;
    const urgencySurcharge =
      adjustments.urgencySurcharge ?? 0;
    const riskSurcharge = adjustments.riskSurcharge ?? 0;
    const retentionFee = adjustments.retentionFee ?? 0;

    const customerTotal =
      baseAmount +
      timeSurcharge +
      locationSurcharge +
      skillSurcharge +
      urgencySurcharge +
      riskSurcharge +
      retentionFee;

    const workerPayoutRate = 75;
    const workerPayoutAmount = Math.round(
      customerTotal * (workerPayoutRate / 100),
    );
    const platformFeeAmount =
      customerTotal - workerPayoutAmount;

    return {
      baseAmount,
      timeSurcharge,
      locationSurcharge,
      skillSurcharge,
      urgencySurcharge,
      riskSurcharge,
      retentionFee,
      customerTotal,
      workerPayoutRate,
      workerPayoutAmount,
      platformFeeAmount,
      calculationDetails: {
        pricingUnit: category.pricingUnit,
        categoryBaseRate: category.baseRate,
        durationHours,
        billableHours,
        headcount: job.headcount,
        categoryRiskLevel: category.riskLevel,
      },
    };
  }
}
