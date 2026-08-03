import { randomUUID } from 'node:crypto';

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  and,
  desc,
  eq,
  gte,
  inArray,
} from 'drizzle-orm';

import { DatabaseService } from '../../database/database.service';
import {
  assignments,
  candidateOffers,
  jobCandidates,
  jobs,
  payments,
  workerAvailability,
  workerCertificates,
  workerProfiles,
  workerSkills,
} from '../../database/schema/index';
import { ExecutionService } from '../execution/execution.service';
import { FinanceService } from '../finance/finance.service';
import { MatchingService } from '../matching/matching.service';
import { QualityService } from '../quality/quality.service';
import {
  CreateAvailabilityDto,
  UpdateAvailabilityDto,
  UpdateWorkerProfileDto,
  WorkerAddEvidenceDto,
  WorkerCheckInDto,
  WorkerCheckOutDto,
  WorkerCreateIncidentDto,
  WorkerOfferRespondDto,
  WorkerReviewDto,
  WorkerSetRelationshipDto,
} from './dto/worker-portal.dto';

@Injectable()
export class WorkerPortalService {
  constructor(
    private readonly database: DatabaseService,
    private readonly executionService: ExecutionService,
    private readonly financeService: FinanceService,
    private readonly matchingService: MatchingService,
    private readonly qualityService: QualityService,
  ) {}

  async dashboard(workerId: string, workerUserId: string) {
    await this.assertWorker(workerId, workerUserId);

    const workerAssignments = await this.database.db
      .select({
        assignment: assignments,
        job: jobs,
      })
      .from(assignments)
      .innerJoin(jobs, eq(assignments.jobId, jobs.id))
      .where(eq(assignments.workerId, workerId))
      .orderBy(desc(assignments.createdAt));

    const pendingOffers = await this.database.db
      .select({ offer: candidateOffers })
      .from(candidateOffers)
      .innerJoin(
        jobCandidates,
        eq(candidateOffers.candidateId, jobCandidates.id),
      )
      .where(
        and(
          eq(jobCandidates.workerId, workerId),
          eq(candidateOffers.status, 'OFFERED'),
        ),
      );

    const assignmentIds = workerAssignments.map(
      (item) => item.assignment.id,
    );

    const workerPayments = assignmentIds.length
      ? await this.database.db
          .select()
          .from(payments)
          .where(
            and(
              inArray(payments.assignmentId, assignmentIds),
              eq(payments.paymentType, 'WORKER_PAYOUT'),
            ),
          )
      : [];

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return {
      activeAssignments: workerAssignments.filter((item) =>
        ['CONFIRMED', 'ACTIVE'].includes(item.assignment.status),
      ).length,
      waitingConfirmation: workerAssignments.filter(
        (item) => item.assignment.status === 'WAITING_CONFIRMATION',
      ).length,
      completedAssignments: workerAssignments.filter(
        (item) => item.assignment.status === 'COMPLETED',
      ).length,
      pendingOffers: pendingOffers.length,
      totalEarned: this.roundMoney(
        workerPayments
          .filter((item) => item.status === 'PAID')
          .reduce((sum, item) => sum + item.amount, 0),
      ),
      pendingEarnings: this.roundMoney(
        workerPayments
          .filter((item) => item.status !== 'PAID')
          .reduce((sum, item) => sum + item.amount, 0),
      ),
      earningsThisMonth: this.roundMoney(
        workerPayments
          .filter(
            (item) =>
              item.status === 'PAID' &&
              item.createdAt >= startOfMonth,
          )
          .reduce((sum, item) => sum + item.amount, 0),
      ),
      recentAssignments: workerAssignments.slice(0, 5),
    };
  }

  async getProfile(workerId: string, workerUserId: string) {
    const worker = await this.assertWorker(workerId, workerUserId);

    return worker;
  }

  async updateProfile(
    workerId: string,
    workerUserId: string,
    input: UpdateWorkerProfileDto,
  ) {
    await this.assertWorker(workerId, workerUserId);

    await this.database.db
      .update(workerProfiles)
      .set({
        ...(input.biography !== undefined && {
          biography: input.biography,
        }),
        ...(input.currentAddress !== undefined && {
          currentAddress: input.currentAddress,
        }),
        ...(input.currentDistrict !== undefined && {
          currentDistrict: input.currentDistrict,
        }),
        ...(input.currentCity !== undefined && {
          currentCity: input.currentCity,
        }),
        ...(input.latitude !== undefined && {
          latitude: input.latitude,
        }),
        ...(input.longitude !== undefined && {
          longitude: input.longitude,
        }),
        ...(input.transportType !== undefined && {
          transportType: input.transportType,
        }),
        ...(input.maxTravelKm !== undefined && {
          maxTravelKm: input.maxTravelKm,
        }),
        ...(input.minimumHourlyRate !== undefined && {
          minimumHourlyRate: input.minimumHourlyRate,
        }),
        ...(input.available !== undefined && {
          available: input.available,
        }),
        ...(input.emergencyContactName !== undefined && {
          emergencyContactName: input.emergencyContactName,
        }),
        ...(input.emergencyContactPhone !== undefined && {
          emergencyContactPhone: input.emergencyContactPhone,
        }),
      })
      .where(eq(workerProfiles.id, workerId));

    return this.getProfile(workerId, workerUserId);
  }

  async listAvailability(workerId: string, workerUserId: string) {
    await this.assertWorker(workerId, workerUserId);

    return this.database.db
      .select()
      .from(workerAvailability)
      .where(eq(workerAvailability.workerId, workerId))
      .orderBy(desc(workerAvailability.createdAt));
  }

  async createAvailability(
    workerId: string,
    workerUserId: string,
    input: CreateAvailabilityDto,
  ) {
    await this.assertWorker(workerId, workerUserId);

    const id = randomUUID();

    await this.database.db.insert(workerAvailability).values({
      id,
      workerId,
      availabilityType: input.availabilityType ?? 'ONE_TIME',
      dayOfWeek: input.dayOfWeek,
      specificDate: input.specificDate
        ? new Date(input.specificDate)
        : undefined,
      startTime: input.startTime,
      endTime: input.endTime,
      serviceAreas: input.serviceAreas,
      isAvailable: input.isAvailable ?? true,
    });

    return this.listAvailability(workerId, workerUserId);
  }

  async updateAvailability(
    workerId: string,
    workerUserId: string,
    availabilityId: string,
    input: UpdateAvailabilityDto,
  ) {
    await this.assertWorker(workerId, workerUserId);
    await this.assertAvailability(workerId, availabilityId);

    await this.database.db
      .update(workerAvailability)
      .set({
        ...(input.startTime !== undefined && {
          startTime: input.startTime,
        }),
        ...(input.endTime !== undefined && {
          endTime: input.endTime,
        }),
        ...(input.serviceAreas !== undefined && {
          serviceAreas: input.serviceAreas,
        }),
        ...(input.isAvailable !== undefined && {
          isAvailable: input.isAvailable,
        }),
      })
      .where(eq(workerAvailability.id, availabilityId));

    return this.listAvailability(workerId, workerUserId);
  }

  async deleteAvailability(
    workerId: string,
    workerUserId: string,
    availabilityId: string,
  ) {
    await this.assertWorker(workerId, workerUserId);
    await this.assertAvailability(workerId, availabilityId);

    await this.database.db
      .delete(workerAvailability)
      .where(eq(workerAvailability.id, availabilityId));

    return this.listAvailability(workerId, workerUserId);
  }

  async listSkills(workerId: string, workerUserId: string) {
    await this.assertWorker(workerId, workerUserId);

    return this.database.db
      .select()
      .from(workerSkills)
      .where(eq(workerSkills.workerId, workerId));
  }

  async listCertificates(workerId: string, workerUserId: string) {
    await this.assertWorker(workerId, workerUserId);

    return this.database.db
      .select()
      .from(workerCertificates)
      .where(eq(workerCertificates.workerId, workerId))
      .orderBy(desc(workerCertificates.issuedAt));
  }

  async listOffers(workerId: string, workerUserId: string) {
    await this.assertWorker(workerId, workerUserId);

    return this.database.db
      .select({
        offerId: candidateOffers.id,
        candidateId: jobCandidates.id,
        jobId: jobs.id,
        jobCode: jobs.jobCode,
        jobTitle: jobs.title,
        startAt: jobs.startAt,
        endAt: jobs.endAt,
        proposedPayout: candidateOffers.proposedPayout,
        status: candidateOffers.status,
        offeredAt: candidateOffers.offeredAt,
        expiresAt: candidateOffers.expiresAt,
        totalScore: jobCandidates.totalScore,
        reasons: jobCandidates.reasons,
      })
      .from(candidateOffers)
      .innerJoin(
        jobCandidates,
        eq(candidateOffers.candidateId, jobCandidates.id),
      )
      .innerJoin(jobs, eq(candidateOffers.jobId, jobs.id))
      .where(
        and(
          eq(jobCandidates.workerId, workerId),
          eq(candidateOffers.status, 'OFFERED'),
          gte(candidateOffers.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(candidateOffers.offeredAt));
  }

  async respondOffer(
    workerId: string,
    workerUserId: string,
    offerId: string,
    input: WorkerOfferRespondDto,
  ) {
    await this.assertWorker(workerId, workerUserId);

    const [offer] = await this.database.db
      .select({
        jobId: candidateOffers.jobId,
        workerId: jobCandidates.workerId,
      })
      .from(candidateOffers)
      .innerJoin(
        jobCandidates,
        eq(candidateOffers.candidateId, jobCandidates.id),
      )
      .where(eq(candidateOffers.id, offerId))
      .limit(1);

    if (!offer) {
      throw new NotFoundException('Không tìm thấy offer');
    }

    if (offer.workerId !== workerId) {
      throw new ForbiddenException('Offer không thuộc worker này');
    }

    return this.matchingService.respond(offer.jobId, offerId, {
      workerUserId,
      decision: input.decision,
      note: input.note,
    });
  }

  async listAssignments(workerId: string, workerUserId: string) {
    await this.assertWorker(workerId, workerUserId);

    return this.database.db
      .select({
        assignment: assignments,
        job: jobs,
      })
      .from(assignments)
      .innerJoin(jobs, eq(assignments.jobId, jobs.id))
      .where(eq(assignments.workerId, workerId))
      .orderBy(desc(assignments.createdAt));
  }

  async assignmentDetail(
    workerId: string,
    workerUserId: string,
    assignmentId: string,
  ) {
    await this.assertWorker(workerId, workerUserId);
    await this.assertAssignment(workerId, assignmentId);

    return this.executionService.getAssignmentExecution(assignmentId);
  }

  async checkIn(
    workerId: string,
    workerUserId: string,
    assignmentId: string,
    input: WorkerCheckInDto,
  ) {
    await this.assertWorker(workerId, workerUserId);
    await this.assertAssignment(workerId, assignmentId);

    return this.executionService.checkIn(assignmentId, {
      workerUserId,
      latitude: input.latitude,
      longitude: input.longitude,
      method: input.method,
      note: input.note,
    });
  }

  async checkOut(
    workerId: string,
    workerUserId: string,
    assignmentId: string,
    input: WorkerCheckOutDto,
  ) {
    await this.assertWorker(workerId, workerUserId);
    await this.assertAssignment(workerId, assignmentId);

    return this.executionService.checkOut(assignmentId, {
      workerUserId,
      latitude: input.latitude,
      longitude: input.longitude,
      method: input.method,
      evidence: input.evidence,
      note: input.note,
    });
  }

  async addEvidence(
    workerId: string,
    workerUserId: string,
    assignmentId: string,
    input: WorkerAddEvidenceDto,
  ) {
    await this.assertWorker(workerId, workerUserId);
    await this.assertAssignment(workerId, assignmentId);

    return this.executionService.addEvidence(assignmentId, {
      actorUserId: workerUserId,
      evidence: input.evidence,
    });
  }

  async createIncident(
    workerId: string,
    workerUserId: string,
    assignmentId: string,
    input: WorkerCreateIncidentDto,
  ) {
    await this.assertWorker(workerId, workerUserId);
    await this.assertAssignment(workerId, assignmentId);

    return this.executionService.createIncident(assignmentId, {
      reportedByUserId: workerUserId,
      incidentType: input.incidentType,
      severity: input.severity,
      description: input.description,
      evidence: input.evidence,
    });
  }

  async earnings(
    workerId: string,
    workerUserId: string,
    status: string,
  ) {
    await this.assertWorker(workerId, workerUserId);

    return this.financeService.workerEarnings(workerId, status);
  }

  async reviewCustomer(
    workerId: string,
    workerUserId: string,
    input: WorkerReviewDto,
  ) {
    await this.assertWorker(workerId, workerUserId);
    await this.assertAssignment(workerId, input.assignmentId);

    return this.qualityService.createReview(input.jobId, {
      reviewerUserId: workerUserId,
      assignmentId: input.assignmentId,
      reviewerType: 'WORKER_TO_CUSTOMER',
      overallRating: input.overallRating,
      criteria: input.criteria,
      comment: input.comment,
      wouldHireAgain: input.wouldHireAgain,
    });
  }

  async setRelationship(
    workerId: string,
    workerUserId: string,
    input: WorkerSetRelationshipDto,
  ) {
    await this.assertWorker(workerId, workerUserId);

    const [job] = await this.database.db
      .select({ customerId: jobs.customerId })
      .from(jobs)
      .where(eq(jobs.id, input.jobId))
      .limit(1);

    if (!job) {
      throw new NotFoundException('Không tìm thấy Job');
    }

    return this.qualityService.setRelationship({
      customerId: job.customerId,
      workerId,
      actorUserId: workerUserId,
      setByParty: 'WORKER',
      preferenceType: input.preferenceType,
      sourceJobId: input.jobId,
      reason: input.reason,
    });
  }

  async listRelationships(
    workerId: string,
    workerUserId: string,
  ) {
    await this.assertWorker(workerId, workerUserId);

    return this.qualityService.workerRelationships(workerId);
  }

  private roundMoney(value: number) {
    return Math.round(value * 100) / 100;
  }

  private async assertWorker(
    workerId: string,
    workerUserId: string,
  ) {
    const [worker] = await this.database.db
      .select()
      .from(workerProfiles)
      .where(
        and(
          eq(workerProfiles.id, workerId),
          eq(workerProfiles.userId, workerUserId),
        ),
      )
      .limit(1);

    if (!worker) {
      throw new ForbiddenException(
        'Tài khoản hiện tại không thuộc quyền sở hữu workerId này',
      );
    }

    return worker;
  }

  private async assertAvailability(
    workerId: string,
    availabilityId: string,
  ) {
    const [row] = await this.database.db
      .select({ id: workerAvailability.id })
      .from(workerAvailability)
      .where(
        and(
          eq(workerAvailability.id, availabilityId),
          eq(workerAvailability.workerId, workerId),
        ),
      )
      .limit(1);

    if (!row) {
      throw new NotFoundException(
        'Không tìm thấy lịch rảnh của worker',
      );
    }

    return row;
  }

  private async assertAssignment(
    workerId: string,
    assignmentId: string,
  ) {
    const [assignment] = await this.database.db
      .select({
        id: assignments.id,
        workerId: assignments.workerId,
      })
      .from(assignments)
      .where(eq(assignments.id, assignmentId))
      .limit(1);

    if (!assignment) {
      throw new NotFoundException('Không tìm thấy assignment');
    }

    if (assignment.workerId !== workerId) {
      throw new ForbiddenException(
        'Assignment không thuộc worker này',
      );
    }

    return assignment;
  }
}
