import { randomUUID } from 'node:crypto';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  and,
  asc,
  eq,
  inArray,
} from 'drizzle-orm';

import { DatabaseService } from '../../database/database.service';
import {
  assignmentEvents,
  assignments,
  customerLocations,
  customerProfiles,
  jobs,
  users,
  workerProfiles,
  workIncidents,
  workSessions,
} from '../../database/schema/index';
import { JOB_STATUSES } from '../jobs/job-status';
import {
  AddEvidenceDto,
  AssignmentActionDto,
  CheckInDto,
  CheckOutDto,
  CreateIncidentDto,
  CustomerConfirmDto,
} from './dto/execution.dto';

const CHECK_IN_RADIUS_METERS = 500;
const EARLY_CHECK_IN_MINUTES = 60;

@Injectable()
export class ExecutionService {
  constructor(
    private readonly database: DatabaseService,
  ) {}

  async getJobExecution(jobId: string) {
    const job = await this.getJob(jobId);

    const rows = await this.database.db
      .select({
        assignment: assignments,
        worker: workerProfiles,
        workerUser: {
          id: users.id,
          fullName: users.fullName,
          phone: users.phone,
        },
        session: workSessions,
      })
      .from(assignments)
      .innerJoin(
        workerProfiles,
        eq(assignments.workerId, workerProfiles.id),
      )
      .innerJoin(users, eq(workerProfiles.userId, users.id))
      .leftJoin(
        workSessions,
        eq(workSessions.assignmentId, assignments.id),
      )
      .where(eq(assignments.jobId, jobId))
      .orderBy(asc(users.fullName));

    return {
      job,
      assignments: rows,
    };
  }

  async getAssignmentExecution(assignmentId: string) {
    const assignment = await this.getAssignment(assignmentId);

    const [session] = await this.database.db
      .select()
      .from(workSessions)
      .where(eq(workSessions.assignmentId, assignmentId))
      .limit(1);

    const events = await this.database.db
      .select()
      .from(assignmentEvents)
      .where(eq(assignmentEvents.assignmentId, assignmentId))
      .orderBy(asc(assignmentEvents.createdAt));

    const incidents = await this.database.db
      .select()
      .from(workIncidents)
      .where(eq(workIncidents.assignmentId, assignmentId))
      .orderBy(asc(workIncidents.createdAt));

    return {
      assignment,
      session: session ?? null,
      events,
      incidents,
    };
  }

  async checkIn(
    assignmentId: string,
    input: CheckInDto,
  ) {
    const context = await this.getAssignmentContext(assignmentId);

    if (context.workerUserId !== input.workerUserId) {
      throw new BadRequestException(
        'Assignment không thuộc người lao động này',
      );
    }

    if (context.assignment.status !== 'CONFIRMED') {
      throw new BadRequestException(
        'Chỉ assignment CONFIRMED mới được check-in',
      );
    }

    const earliest = new Date(
      context.job.startAt.getTime() -
        EARLY_CHECK_IN_MINUTES * 60_000,
    );

    if (new Date() < earliest) {
      throw new BadRequestException(
        `Chỉ được check-in sớm tối đa ${EARLY_CHECK_IN_MINUTES} phút`,
      );
    }

    const distanceMeters = this.distanceMeters(
      input.latitude,
      input.longitude,
      context.location.latitude,
      context.location.longitude,
    );

    if (
      distanceMeters !== null &&
      distanceMeters > CHECK_IN_RADIUS_METERS
    ) {
      throw new BadRequestException(
        `Ngoài phạm vi check-in: ${Math.round(distanceMeters)} m`,
      );
    }

    const now = new Date();
    const lateMinutes = Math.max(
      0,
      Math.floor(
        (now.getTime() - context.job.startAt.getTime()) /
          60_000,
      ),
    );
    const sessionId = randomUUID();

    await this.database.db.transaction(async (tx) => {
      await tx.insert(workSessions).values({
        id: sessionId,
        assignmentId,
        checkInAt: now,
        checkInLatitude: input.latitude,
        checkInLongitude: input.longitude,
        checkInMethod: input.method ?? 'GPS',
        evidence: [],
      });

      await tx
        .update(assignments)
        .set({ status: 'ACTIVE' })
        .where(eq(assignments.id, assignmentId));

      await tx.insert(assignmentEvents).values({
        id: randomUUID(),
        assignmentId,
        eventType: lateMinutes > 0 ? 'LATE_CHECK_IN' : 'CHECK_IN',
        fromStatus: context.assignment.status,
        toStatus: 'ACTIVE',
        actorUserId: input.workerUserId,
        latitude: input.latitude,
        longitude: input.longitude,
        note: input.note,
        metadata: {
          distanceMeters,
          lateMinutes,
        },
      });

      if (context.job.status === JOB_STATUSES.ASSIGNED) {
        await tx
          .update(jobs)
          .set({ status: JOB_STATUSES.IN_PROGRESS })
          .where(eq(jobs.id, context.job.id));
      }
    });

    return this.getAssignmentExecution(assignmentId);
  }

  async addEvidence(
    assignmentId: string,
    input: AddEvidenceDto,
  ) {
    await this.getAssignment(assignmentId);

    const [session] = await this.database.db
      .select()
      .from(workSessions)
      .where(eq(workSessions.assignmentId, assignmentId))
      .limit(1);

    if (!session) {
      throw new BadRequestException(
        'Assignment chưa có work session',
      );
    }

    const evidence = [
      ...(session.evidence ?? []),
      ...input.evidence,
    ];

    await this.database.db.transaction(async (tx) => {
      await tx
        .update(workSessions)
        .set({ evidence })
        .where(eq(workSessions.id, session.id));

      await tx.insert(assignmentEvents).values({
        id: randomUUID(),
        assignmentId,
        eventType: 'EVIDENCE_ADDED',
        actorUserId: input.actorUserId,
        metadata: {
          addedCount: input.evidence.length,
        },
      });
    });

    return this.getAssignmentExecution(assignmentId);
  }

  async createIncident(
    assignmentId: string,
    input: CreateIncidentDto,
  ) {
    await this.getAssignment(assignmentId);

    const [session] = await this.database.db
      .select({ id: workSessions.id })
      .from(workSessions)
      .where(eq(workSessions.assignmentId, assignmentId))
      .limit(1);

    const incidentId = randomUUID();

    await this.database.db.transaction(async (tx) => {
      await tx.insert(workIncidents).values({
        id: incidentId,
        assignmentId,
        workSessionId: session?.id,
        incidentType: input.incidentType,
        severity: input.severity,
        description: input.description,
        evidence: input.evidence,
        reportedByUserId: input.reportedByUserId,
      });

      await tx.insert(assignmentEvents).values({
        id: randomUUID(),
        assignmentId,
        eventType: 'INCIDENT_REPORTED',
        actorUserId: input.reportedByUserId,
        note: input.description.slice(0, 500),
        metadata: {
          incidentId,
          incidentType: input.incidentType,
          severity: input.severity,
        },
      });
    });

    return this.getAssignmentExecution(assignmentId);
  }

  async checkOut(
    assignmentId: string,
    input: CheckOutDto,
  ) {
    const context = await this.getAssignmentContext(assignmentId);

    if (context.workerUserId !== input.workerUserId) {
      throw new BadRequestException(
        'Assignment không thuộc người lao động này',
      );
    }

    if (context.assignment.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Chỉ assignment ACTIVE mới được check-out',
      );
    }

    const [session] = await this.database.db
      .select()
      .from(workSessions)
      .where(eq(workSessions.assignmentId, assignmentId))
      .limit(1);

    if (!session?.checkInAt) {
      throw new BadRequestException(
        'Không tìm thấy thời gian check-in',
      );
    }

    const now = new Date();
    const actualMinutes = Math.max(
      0,
      Math.floor(
        (now.getTime() - session.checkInAt.getTime()) /
          60_000,
      ),
    );
    const plannedMinutes = Math.max(
      0,
      Math.floor(
        (context.job.endAt.getTime() -
          context.job.startAt.getTime()) /
          60_000,
      ) - context.job.breakMinutes,
    );
    const overtimeMinutes = Math.max(
      0,
      actualMinutes - plannedMinutes,
    );

    const evidence = [
      ...(session.evidence ?? []),
      ...(input.evidence ?? []),
    ];

    await this.database.db.transaction(async (tx) => {
      await tx
        .update(workSessions)
        .set({
          checkOutAt: now,
          checkOutLatitude: input.latitude,
          checkOutLongitude: input.longitude,
          checkOutMethod: input.method ?? 'GPS',
          actualMinutes,
          overtimeMinutes,
          evidence,
        })
        .where(eq(workSessions.id, session.id));

      await tx
        .update(assignments)
        .set({ status: 'WAITING_CONFIRMATION' })
        .where(eq(assignments.id, assignmentId));

      await tx.insert(assignmentEvents).values({
        id: randomUUID(),
        assignmentId,
        eventType: 'CHECK_OUT',
        fromStatus: context.assignment.status,
        toStatus: 'WAITING_CONFIRMATION',
        actorUserId: input.workerUserId,
        latitude: input.latitude,
        longitude: input.longitude,
        note: input.note,
        metadata: {
          actualMinutes,
          plannedMinutes,
          overtimeMinutes,
        },
      });
    });

    return this.getAssignmentExecution(assignmentId);
  }

  async customerConfirm(
    assignmentId: string,
    input: CustomerConfirmDto,
  ) {
    const context = await this.getAssignmentContext(assignmentId);

    if (context.customerUserId !== input.customerUserId) {
      throw new BadRequestException(
        'Người xác nhận không thuộc khách hàng của công việc',
      );
    }

    if (
      context.assignment.status !== 'WAITING_CONFIRMATION'
    ) {
      throw new BadRequestException(
        'Assignment chưa chờ khách hàng xác nhận',
      );
    }

    const [session] = await this.database.db
      .select()
      .from(workSessions)
      .where(eq(workSessions.assignmentId, assignmentId))
      .limit(1);

    if (!session?.checkOutAt) {
      throw new BadRequestException(
        'Assignment chưa hoàn tất check-out',
      );
    }

    await this.database.db.transaction(async (tx) => {
      await tx
        .update(workSessions)
        .set({ customerConfirmedAt: new Date() })
        .where(eq(workSessions.id, session.id));

      await tx
        .update(assignments)
        .set({ status: 'COMPLETED' })
        .where(eq(assignments.id, assignmentId));

      await tx.insert(assignmentEvents).values({
        id: randomUUID(),
        assignmentId,
        eventType: 'CUSTOMER_CONFIRMED',
        fromStatus: context.assignment.status,
        toStatus: 'COMPLETED',
        actorUserId: input.customerUserId,
        note: input.note,
      });
    });

    await this.completeJobWhenReady(context.job.id);

    return this.getAssignmentExecution(assignmentId);
  }

  async markNoShow(
    assignmentId: string,
    input: AssignmentActionDto,
  ) {
    const assignment = await this.getAssignment(assignmentId);

    if (!['CONFIRMED', 'ACTIVE'].includes(assignment.status)) {
      throw new BadRequestException(
        'Không thể đánh dấu vắng mặt ở trạng thái hiện tại',
      );
    }

    await this.changeAssignmentStatus(
      assignment,
      'NO_SHOW',
      'NO_SHOW',
      input.actorUserId,
      input.reason,
    );

    return this.getAssignmentExecution(assignmentId);
  }

  async cancel(
    assignmentId: string,
    input: AssignmentActionDto,
  ) {
    const assignment = await this.getAssignment(assignmentId);

    if (
      ['COMPLETED', 'CANCELLED'].includes(assignment.status)
    ) {
      throw new BadRequestException(
        'Assignment đã kết thúc',
      );
    }

    await this.database.db.transaction(async (tx) => {
      await tx
        .update(assignments)
        .set({
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancellationReason: input.reason,
        })
        .where(eq(assignments.id, assignmentId));

      await tx.insert(assignmentEvents).values({
        id: randomUUID(),
        assignmentId,
        eventType: 'CANCELLED',
        fromStatus: assignment.status,
        toStatus: 'CANCELLED',
        actorUserId: input.actorUserId,
        note: input.reason,
      });
    });

    return this.getAssignmentExecution(assignmentId);
  }

  async requestReplacement(
    assignmentId: string,
    input: AssignmentActionDto,
  ) {
    const assignment = await this.getAssignment(assignmentId);

    if (
      !['NO_SHOW', 'CANCELLED'].includes(assignment.status)
    ) {
      throw new BadRequestException(
        'Chỉ yêu cầu thay người sau khi no-show hoặc hủy assignment',
      );
    }

    await this.changeAssignmentStatus(
      assignment,
      'REPLACEMENT_REQUIRED',
      'REPLACEMENT_REQUESTED',
      input.actorUserId,
      input.reason,
    );

    return this.getAssignmentExecution(assignmentId);
  }

  private async completeJobWhenReady(jobId: string) {
    const rows = await this.database.db
      .select({ status: assignments.status })
      .from(assignments)
      .where(eq(assignments.jobId, jobId));

    const relevant = rows.filter(
      (item) =>
        !['CANCELLED', 'NO_SHOW', 'REPLACEMENT_REQUIRED'].includes(
          item.status,
        ),
    );

    if (
      relevant.length > 0 &&
      relevant.every((item) => item.status === 'COMPLETED')
    ) {
      await this.database.db
        .update(jobs)
        .set({ status: JOB_STATUSES.COMPLETED })
        .where(eq(jobs.id, jobId));
    }
  }

  private async changeAssignmentStatus(
    assignment: typeof assignments.$inferSelect,
    status: string,
    eventType: string,
    actorUserId: string,
    reason: string,
  ) {
    await this.database.db.transaction(async (tx) => {
      await tx
        .update(assignments)
        .set({ status })
        .where(eq(assignments.id, assignment.id));

      await tx.insert(assignmentEvents).values({
        id: randomUUID(),
        assignmentId: assignment.id,
        eventType,
        fromStatus: assignment.status,
        toStatus: status,
        actorUserId,
        note: reason,
      });
    });
  }

  private async getAssignment(assignmentId: string) {
    const [assignment] = await this.database.db
      .select()
      .from(assignments)
      .where(eq(assignments.id, assignmentId))
      .limit(1);

    if (!assignment) {
      throw new NotFoundException(
        'Không tìm thấy assignment',
      );
    }

    return assignment;
  }

  private async getJob(jobId: string) {
    const [job] = await this.database.db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (!job) {
      throw new NotFoundException(
        'Không tìm thấy công việc',
      );
    }

    return job;
  }

  private async getAssignmentContext(
    assignmentId: string,
  ) {
    const [row] = await this.database.db
      .select({
        assignment: assignments,
        job: jobs,
        workerUserId: workerProfiles.userId,
        customerUserId: customerProfiles.userId,
        location: customerLocations,
      })
      .from(assignments)
      .innerJoin(
        jobs,
        eq(assignments.jobId, jobs.id),
      )
      .innerJoin(
        workerProfiles,
        eq(assignments.workerId, workerProfiles.id),
      )
      .innerJoin(
        customerProfiles,
        eq(jobs.customerId, customerProfiles.id),
      )
      .innerJoin(
        customerLocations,
        eq(jobs.locationId, customerLocations.id),
      )
      .where(eq(assignments.id, assignmentId))
      .limit(1);

    if (!row) {
      throw new NotFoundException(
        'Không tìm thấy dữ liệu vận hành assignment',
      );
    }

    return row;
  }

  private distanceMeters(
    latitude1: number,
    longitude1: number,
    latitude2: number | null,
    longitude2: number | null,
  ): number | null {
    if (latitude2 === null || longitude2 === null) {
      return null;
    }

    const radius = 6_371_000;
    const toRadians = (value: number) =>
      (value * Math.PI) / 180;
    const deltaLatitude = toRadians(latitude2 - latitude1);
    const deltaLongitude = toRadians(longitude2 - longitude1);

    const a =
      Math.sin(deltaLatitude / 2) ** 2 +
      Math.cos(toRadians(latitude1)) *
        Math.cos(toRadians(latitude2)) *
        Math.sin(deltaLongitude / 2) ** 2;

    return (
      radius *
      2 *
      Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    );
  }
}
