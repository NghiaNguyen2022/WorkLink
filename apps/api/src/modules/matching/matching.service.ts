import { randomUUID } from 'node:crypto';

import {
      BadRequestException,
      Injectable,
      NotFoundException,
} from '@nestjs/common';
import {
      and,
      asc,
      desc,
      eq,
      inArray,
      lt,
} from 'drizzle-orm';

import { DatabaseService } from '../../database/database.service';
import {
      assignments,
      candidateOffers,
      customerLocations,
      jobCandidates,
      jobRequirements,
      jobs,
      matchingRuns,
      users,
      workerAvailability,
      workerProfiles,
      workerSkills,
} from '../../database/schema/index';
import { JOB_STATUSES } from '../jobs/job-status';
import {
      ConfirmOfferDto,
      OfferCandidateDto,
      RespondOfferDto,
      RunMatchingDto,
} from './dto/matching.dto';
import { MatchingScoreService } from './matching-score.service';

@Injectable()
export class MatchingService {
      constructor(
            private readonly database: DatabaseService,
            private readonly scorer: MatchingScoreService,
      ) { }

      async run(jobId: string, input: RunMatchingDto) {
            const job = await this.getJob(jobId);

            if (job.status !== JOB_STATUSES.MATCHING) {
                  throw new BadRequestException(
                        'Công việc phải ở trạng thái MATCHING',
                  );
            }

            const [location] = await this.database.db
                  .select()
                  .from(customerLocations)
                  .where(eq(customerLocations.id, job.locationId))
                  .limit(1);

            if (!location) {
                  throw new NotFoundException('Không tìm thấy địa điểm');
            }

            const requirements = await this.database.db
                  .select()
                  .from(jobRequirements)
                  .where(eq(jobRequirements.jobId, jobId));

            const workers = await this.database.db
                  .select({
                        profile: workerProfiles,
                        user: users,
                  })
                  .from(workerProfiles)
                  .innerJoin(users, eq(workerProfiles.userId, users.id))
                  .where(
                        and(
                              eq(workerProfiles.available, true),
                              eq(workerProfiles.isSuspended, false),
                              eq(users.isActive, true),
                        ),
                  );

            const workerIds = workers.map((item) => item.profile.id);
            const skills = workerIds.length
                  ? await this.database.db
                        .select()
                        .from(workerSkills)
                        .where(inArray(workerSkills.workerId, workerIds))
                  : [];

            const schedules = workerIds.length
                  ? await this.database.db
                        .select()
                        .from(workerAvailability)
                        .where(inArray(workerAvailability.workerId, workerIds))
                  : [];

            const activeAssignments = workerIds.length
                  ? await this.database.db
                        .select({
                              workerId: assignments.workerId,
                              startAt: jobs.startAt,
                              endAt: jobs.endAt,
                        })
                        .from(assignments)
                        .innerJoin(jobs, eq(assignments.jobId, jobs.id))
                        .where(
                              and(
                                    inArray(assignments.workerId, workerIds),
                                    inArray(assignments.status, ['CONFIRMED', 'ACTIVE']),
                              ),
                        )
                  : [];

            const mandatorySkillCodes = requirements
                  .filter(
                        (item) =>
                              item.mandatory &&
                              item.requirementType === 'SKILL' &&
                              item.requirementCode,
                  )
                  .map((item) => item.requirementCode as string);

            const durationHours = Math.max(
                  0.5,
                  (job.endAt.getTime() - job.startAt.getTime()) / 3_600_000 -
                  job.breakMinutes / 60,
            );
            const payoutPerWorker =
                  (job.workerPayoutAmount ?? 0) / job.headcount;

            const candidates = workers
                  .map(({ profile, user }) => {
                        const workerSkillsForProfile = skills.filter(
                              (item) => item.workerId === profile.id,
                        );
                        const passedSkills = mandatorySkillCodes.filter((code) =>
                              workerSkillsForProfile.some(
                                    (item) =>
                                          item.skillCode === code &&
                                          item.verificationStatus === 'VERIFIED',
                              ),
                        ).length;
                        const skillRatio =
                              mandatorySkillCodes.length === 0
                                    ? 1
                                    : passedSkills / mandatorySkillCodes.length;

                        const hasConflict = activeAssignments.some(
                              (item) =>
                                    item.workerId === profile.id &&
                                    item.startAt < job.endAt &&
                                    item.endAt > job.startAt,
                        );

                        const available =
                              !hasConflict &&
                              this.hasSchedule(
                                    schedules.filter((item) => item.workerId === profile.id),
                                    job.startAt,
                                    job.endAt,
                              );

                        const score = this.scorer.score({
                              verificationLevel: profile.verificationLevel,
                              rating: profile.rating,
                              completedJobs: profile.completedJobs,
                              cancellationRate: profile.cancellationRate,
                              onTimeRate: profile.onTimeRate,
                              minimumHourlyRate: profile.minimumHourlyRate,
                              currentDistrict: profile.currentDistrict,
                              currentCity: profile.currentCity,
                              locationDistrict: location.district,
                              locationCity: location.city,
                              available,
                              mandatorySkillRatio: skillRatio,
                              payoutPerWorker,
                              durationHours,
                        });

                        return {
                              workerId: profile.id,
                              workerUserId: profile.userId,
                              workerName: user.fullName,
                              phone: user.phone,
                              proposedPayout: payoutPerWorker,
                              ...score,
                        };
                  })
                  .filter(
                        (item) =>
                              item.eligible &&
                              item.totalScore >= (input.minimumScore ?? 55),
                  )
                  .sort((a, b) => b.totalScore - a.totalScore)
                  .slice(0, input.limit ?? 20);

            const runId = randomUUID();

            await this.database.db.transaction(async (tx) => {
                  await tx.insert(matchingRuns).values({
                        id: runId,
                        jobId,
                        totalWorkers: workers.length,
                        eligibleWorkers: candidates.length,
                        proposedWorkers: candidates.length,
                        minimumScore: input.minimumScore ?? 55,
                        parameters: {
                              limit: input.limit ?? 20,
                              payoutPerWorker,
                              durationHours,
                        },
                        createdByUserId: input.actorUserId,
                        completedAt: new Date(),
                  });

                  for (const [index, candidate] of candidates.entries()) {
                        await tx
                              .insert(jobCandidates)
                              .values({
                                    id: randomUUID(),
                                    jobId,
                                    workerId: candidate.workerId,
                                    status: 'PROPOSED',
                                    rankOrder: index + 1,
                                    totalScore: candidate.totalScore,
                                    scoreBreakdown: candidate.scoreBreakdown,
                                    reasons: candidate.reasons,
                                    warnings: candidate.warnings,
                                    proposedPayout: candidate.proposedPayout,
                              })
                              .onDuplicateKeyUpdate({
                                    set: {
                                          status: 'PROPOSED',
                                          rankOrder: index + 1,
                                          totalScore: candidate.totalScore,
                                          scoreBreakdown: candidate.scoreBreakdown,
                                          reasons: candidate.reasons,
                                          warnings: candidate.warnings,
                                          proposedPayout: candidate.proposedPayout,
                                          respondedAt: null,
                                    },
                              });
                  }
            });

            return { matchingRunId: runId, candidates };
      }

      async list(jobId: string) {
            await this.getJob(jobId);

            return this.database.db
                  .select({
                        candidateId: jobCandidates.id,
                        workerId: jobCandidates.workerId,
                        workerUserId: workerProfiles.userId,
                        workerName: users.fullName,
                        phone: users.phone,
                        rankOrder: jobCandidates.rankOrder,
                        totalScore: jobCandidates.totalScore,
                        scoreBreakdown: jobCandidates.scoreBreakdown,
                        reasons: jobCandidates.reasons,
                        warnings: jobCandidates.warnings,
                        proposedPayout: jobCandidates.proposedPayout,
                        candidateStatus: jobCandidates.status,
                        offerId: candidateOffers.id,
                        offerStatus: candidateOffers.status,
                        expiresAt: candidateOffers.expiresAt,
                        responseNote: candidateOffers.responseNote,
                  })
                  .from(jobCandidates)
                  .innerJoin(
                        workerProfiles,
                        eq(jobCandidates.workerId, workerProfiles.id),
                  )
                  .innerJoin(users, eq(workerProfiles.userId, users.id))
                  .leftJoin(
                        candidateOffers,
                        eq(candidateOffers.candidateId, jobCandidates.id),
                  )
                  .where(eq(jobCandidates.jobId, jobId))
                  .orderBy(asc(jobCandidates.rankOrder), desc(jobCandidates.totalScore));
      }

      async offer(
            jobId: string,
            candidateId: string,
            input: OfferCandidateDto,
      ) {
            const candidate = await this.getCandidate(jobId, candidateId);
            const expiresAt = new Date(
                  Date.now() + (input.expiresInMinutes ?? 120) * 60_000,
            );

            await this.database.db
                  .insert(candidateOffers)
                  .values({
                        id: randomUUID(),
                        jobId,
                        candidateId,
                        status: 'OFFERED',
                        proposedPayout: candidate.proposedPayout ?? 0,
                        offeredByUserId: input.actorUserId,
                        expiresAt,
                  })
                  .onDuplicateKeyUpdate({
                        set: {
                              status: 'OFFERED',
                              proposedPayout: candidate.proposedPayout ?? 0,
                              responseNote: null,
                              offeredByUserId: input.actorUserId,
                              offeredAt: new Date(),
                              expiresAt,
                              respondedAt: null,
                              confirmedAt: null,
                              confirmedByUserId: null,
                        },
                  });

            await this.database.db
                  .update(jobCandidates)
                  .set({ status: 'OFFERED' })
                  .where(eq(jobCandidates.id, candidateId));

            return this.list(jobId);
      }

      async respond(
            jobId: string,
            offerId: string,
            input: RespondOfferDto,
      ) {
            const offer = await this.getOffer(jobId, offerId);

            const [worker] = await this.database.db
                  .select({ userId: workerProfiles.userId })
                  .from(jobCandidates)
                  .innerJoin(
                        workerProfiles,
                        eq(jobCandidates.workerId, workerProfiles.id),
                  )
                  .where(eq(jobCandidates.id, offer.candidateId))
                  .limit(1);

            if (worker?.userId !== input.workerUserId) {
                  throw new BadRequestException('Offer không thuộc worker này');
            }

            if (offer.status !== 'OFFERED') {
                  throw new BadRequestException('Offer không chờ phản hồi');
            }

            if (offer.expiresAt < new Date()) {
                  await this.expire(jobId);
                  throw new BadRequestException('Offer đã hết hạn');
            }

            const status =
                  input.decision === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED';

            await this.database.db.transaction(async (tx) => {
                  await tx
                        .update(candidateOffers)
                        .set({
                              status,
                              responseNote: input.note,
                              respondedAt: new Date(),
                        })
                        .where(eq(candidateOffers.id, offerId));

                  await tx
                        .update(jobCandidates)
                        .set({
                              status,
                              respondedAt: new Date(),
                        })
                        .where(eq(jobCandidates.id, offer.candidateId));
            });

            return this.list(jobId);
      }

      async confirm(
            jobId: string,
            offerId: string,
            input: ConfirmOfferDto,
      ) {
            const job = await this.getJob(jobId);
            const offer = await this.getOffer(jobId, offerId);

            if (offer.status !== 'ACCEPTED') {
                  throw new BadRequestException('Worker chưa chấp nhận offer');
            }

            const [candidate] = await this.database.db
                  .select()
                  .from(jobCandidates)
                  .where(eq(jobCandidates.id, offer.candidateId))
                  .limit(1);

            if (!candidate) {
                  throw new NotFoundException('Không tìm thấy candidate');
            }

            const confirmed = await this.database.db
                  .select({ id: assignments.id })
                  .from(assignments)
                  .where(
                        and(
                              eq(assignments.jobId, jobId),
                              inArray(assignments.status, ['CONFIRMED', 'ACTIVE']),
                        ),
                  );

            if (confirmed.length >= job.headcount) {
                  throw new BadRequestException('Công việc đã đủ nhân sự');
            }

            const assignmentId = randomUUID();

            await this.database.db.transaction(async (tx) => {
                  await tx.insert(assignments).values({
                        id: assignmentId,
                        jobId,
                        workerId: candidate.workerId,
                        candidateId: candidate.id,
                        status: 'CONFIRMED',
                        agreedPayout: offer.proposedPayout,
                        retentionAmount: input.retentionAmount ?? 0,
                  });

                  await tx
                        .update(candidateOffers)
                        .set({
                              status: 'CONFIRMED',
                              confirmedAt: new Date(),
                              confirmedByUserId: input.actorUserId,
                        })
                        .where(eq(candidateOffers.id, offerId));

                  await tx
                        .update(jobCandidates)
                        .set({ status: 'CONFIRMED' })
                        .where(eq(jobCandidates.id, candidate.id));

                  if (confirmed.length + 1 >= job.headcount) {
                        await tx
                              .update(jobs)
                              .set({ status: JOB_STATUSES.ASSIGNED })
                              .where(eq(jobs.id, jobId));
                  }
            });

            return {
                  assignmentId,
                  jobStatus:
                        confirmed.length + 1 >= job.headcount
                              ? JOB_STATUSES.ASSIGNED
                              : JOB_STATUSES.MATCHING,
            };
      }

      async expire(jobId: string) {
            const expiredOffers = await this.database.db
                  .select({ id: candidateOffers.id, candidateId: candidateOffers.candidateId })
                  .from(candidateOffers)
                  .where(
                        and(
                              eq(candidateOffers.jobId, jobId),
                              eq(candidateOffers.status, 'OFFERED'),
                              lt(candidateOffers.expiresAt, new Date()),
                        ),
                  );

            await this.database.db.transaction(async (tx) => {
                  for (const offer of expiredOffers) {
                        await tx
                              .update(candidateOffers)
                              .set({
                                    status: 'EXPIRED',
                                    responseNote: 'Hết thời hạn phản hồi',
                              })
                              .where(eq(candidateOffers.id, offer.id));

                        await tx
                              .update(jobCandidates)
                              .set({ status: 'EXPIRED' })
                              .where(eq(jobCandidates.id, offer.candidateId));
                  }
            });

            return this.list(jobId);
      }

      private async getJob(jobId: string) {
            const [job] = await this.database.db
                  .select()
                  .from(jobs)
                  .where(eq(jobs.id, jobId))
                  .limit(1);

            if (!job) {
                  throw new NotFoundException('Không tìm thấy công việc');
            }

            return job;
      }

      private async getCandidate(jobId: string, candidateId: string) {
            const [candidate] = await this.database.db
                  .select()
                  .from(jobCandidates)
                  .where(
                        and(
                              eq(jobCandidates.id, candidateId),
                              eq(jobCandidates.jobId, jobId),
                        ),
                  )
                  .limit(1);

            if (!candidate) {
                  throw new NotFoundException('Không tìm thấy candidate');
            }

            return candidate;
      }

      private async getOffer(jobId: string, offerId: string) {
            const [offer] = await this.database.db
                  .select()
                  .from(candidateOffers)
                  .where(
                        and(
                              eq(candidateOffers.id, offerId),
                              eq(candidateOffers.jobId, jobId),
                        ),
                  )
                  .limit(1);

            if (!offer) {
                  throw new NotFoundException('Không tìm thấy offer');
            }

            return offer;
      }

      private hasSchedule(
            schedules: Array<typeof workerAvailability.$inferSelect>,
            startAt: Date,
            endAt: Date,
      ): boolean {
            const specificDate = startAt.toISOString().slice(0, 10);
            const dayOfWeek = startAt.getUTCDay();
            const startTime = startAt.toISOString().slice(11, 19);
            const endTime = endAt.toISOString().slice(11, 19);

            return schedules.some((item) => {
                  const itemSpecificDate =
                        item.specificDate instanceof Date
                              ? item.specificDate.toISOString().slice(0, 10)
                              : null;

                  const dateMatches =
                        item.availabilityType === 'ONE_TIME'
                              ? itemSpecificDate === specificDate
                              : item.dayOfWeek === dayOfWeek;

                  return (
                        item.isAvailable &&
                        dateMatches &&
                        item.startTime <= startTime &&
                        item.endTime >= endTime
                  );
            });
      }
}
