import { Injectable } from '@nestjs/common';

interface ScoreInput {
  verificationLevel: string;
  rating: number;
  completedJobs: number;
  cancellationRate: number;
  onTimeRate: number;
  minimumHourlyRate: number | null;
  currentDistrict: string | null;
  currentCity: string | null;
  locationDistrict: string;
  locationCity: string;
  available: boolean;
  mandatorySkillRatio: number;
  payoutPerWorker: number;
  durationHours: number;
}

const VERIFICATION: Record<string, number> = {
  V0: 0,
  V1: 1,
  V2: 2,
  V3: 3,
  V4: 4,
  V5: 5,
  V6: 6,
};

@Injectable()
export class MatchingScoreService {
  score(input: ScoreInput) {
    const reasons: string[] = [];
    const warnings: string[] = [];

    const skill = 25 * input.mandatorySkillRatio;
    const verification = Math.min(
      15,
      (VERIFICATION[input.verificationLevel] ?? 0) * 2.5,
    );
    const availability = input.available ? 15 : 0;

    const location =
      input.currentCity === input.locationCity &&
      input.currentDistrict === input.locationDistrict
        ? 15
        : input.currentCity === input.locationCity
          ? 9
          : 3;

    const experience = Math.min(
      10,
      Math.log10(input.completedJobs + 1) * 4,
    );
    const quality = Math.min(8, (input.rating / 5) * 8);
    const reliability = Math.min(
      7,
      (input.onTimeRate / 100) * 4 +
        ((100 - input.cancellationRate) / 100) * 3,
    );

    const hourlyPayout =
      input.payoutPerWorker / Math.max(0.5, input.durationHours);
    const pricePassed =
      input.minimumHourlyRate === null ||
      hourlyPayout >= input.minimumHourlyRate;
    const price = pricePassed ? 5 : 0;

    if (input.mandatorySkillRatio === 1) {
      reasons.push('Đạt kỹ năng bắt buộc');
    } else {
      warnings.push('Thiếu kỹ năng bắt buộc');
    }

    if (input.available) {
      reasons.push('Lịch rảnh phù hợp');
    } else {
      warnings.push('Lịch không phù hợp hoặc bị trùng ca');
    }

    if (pricePassed) {
      reasons.push('Mức phí phù hợp');
    } else {
      warnings.push('Mức phí thấp hơn mong muốn');
    }

    const totalScore = Math.round(
      (
        skill +
        verification +
        availability +
        location +
        experience +
        quality +
        reliability +
        price
      ) * 100,
    ) / 100;

    return {
      eligible:
        input.mandatorySkillRatio === 1 &&
        input.available &&
        (VERIFICATION[input.verificationLevel] ?? 0) >= 1 &&
        pricePassed,
      totalScore,
      scoreBreakdown: {
        skill,
        verification,
        availability,
        location,
        experience,
        quality,
        reliability,
        price,
      },
      reasons,
      warnings,
    };
  }
}
