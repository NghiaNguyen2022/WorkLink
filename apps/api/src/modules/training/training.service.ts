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
  max,
} from 'drizzle-orm';

import { DatabaseService } from '../../database/database.service';
import {
  assessmentAttempts,
  assessmentQuestions,
  auditLogs,
  courseAssessments,
  courseEnrollments,
  trainingCourses,
  users,
  workerBadges,
  workerCertificates,
  workerProfiles,
  workerSkills,
} from '../../database/schema/index';
import {
  CreateAssessmentDto,
  CreateCourseDto,
  EnrollWorkerDto,
  RevokeCertificateDto,
  SubmitAssessmentDto,
  UpdateProgressDto,
} from './dto/training.dto';

@Injectable()
export class TrainingService {
  constructor(
    private readonly database: DatabaseService,
  ) {}

  listCourses() {
    return this.database.db
      .select()
      .from(trainingCourses)
      .orderBy(desc(trainingCourses.createdAt));
  }

  async createCourse(input: CreateCourseDto) {
    const id = randomUUID();

    await this.database.db.insert(trainingCourses).values({
      id,
      courseCode: input.courseCode,
      title: input.title,
      description: input.description,
      skillCode: input.skillCode,
      certificationCode: input.certificationCode,
      deliveryMode: input.deliveryMode,
      durationMinutes: input.durationMinutes,
      passingScore: input.passingScore,
      certificateValidityDays:
        input.certificateValidityDays,
      createdByUserId: input.actorUserId,
    });

    return this.getCourse(id);
  }

  async getCourse(courseId: string) {
    const [course] = await this.database.db
      .select()
      .from(trainingCourses)
      .where(eq(trainingCourses.id, courseId))
      .limit(1);

    if (!course) {
      throw new NotFoundException(
        'Không tìm thấy khóa học',
      );
    }

    const [enrollments, assessments] = await Promise.all([
      this.database.db
        .select()
        .from(courseEnrollments)
        .where(eq(courseEnrollments.courseId, courseId))
        .orderBy(asc(courseEnrollments.enrolledAt)),
      this.database.db
        .select()
        .from(courseAssessments)
        .where(eq(courseAssessments.courseId, courseId)),
    ]);

    return {
      course,
      enrollments,
      assessments,
    };
  }

  async enroll(courseId: string, input: EnrollWorkerDto) {
    await this.getCourse(courseId);

    const [worker] = await this.database.db
      .select({ id: workerProfiles.id })
      .from(workerProfiles)
      .where(eq(workerProfiles.id, input.workerId))
      .limit(1);

    if (!worker) {
      throw new NotFoundException(
        'Không tìm thấy Worker',
      );
    }

    await this.database.db
      .insert(courseEnrollments)
      .values({
        id: randomUUID(),
        courseId,
        workerId: input.workerId,
        status: 'ENROLLED',
        enrolledByUserId: input.actorUserId,
      })
      .onDuplicateKeyUpdate({
        set: {
          status: 'ENROLLED',
          progressPercent: 0,
          enrolledByUserId: input.actorUserId,
          completedAt: null,
        },
      });

    return this.getCourse(courseId);
  }

  async updateProgress(
    enrollmentId: string,
    input: UpdateProgressDto,
  ) {
    const [enrollment] = await this.database.db
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.id, enrollmentId))
      .limit(1);

    if (!enrollment) {
      throw new NotFoundException(
        'Không tìm thấy ghi danh',
      );
    }

    const completed =
      input.completed || input.progressPercent >= 100;

    await this.database.db
      .update(courseEnrollments)
      .set({
        status: completed ? 'TRAINING_COMPLETED' : 'IN_PROGRESS',
        progressPercent: completed
          ? 100
          : input.progressPercent,
        startedAt: enrollment.startedAt ?? new Date(),
        completedAt: completed ? new Date() : null,
      })
      .where(eq(courseEnrollments.id, enrollmentId));

    return this.getCourse(enrollment.courseId);
  }

  async createAssessment(
    courseId: string,
    input: CreateAssessmentDto,
  ) {
    await this.getCourse(courseId);

    if (!input.questions.length) {
      throw new BadRequestException(
        'Bài kiểm tra phải có câu hỏi',
      );
    }

    const assessmentId = randomUUID();

    await this.database.db.transaction(async (tx) => {
      await tx.insert(courseAssessments).values({
        id: assessmentId,
        courseId,
        title: input.title,
        timeLimitMinutes: input.timeLimitMinutes,
        maximumAttempts: input.maximumAttempts,
      });

      for (const [index, question] of input.questions.entries()) {
        await tx.insert(assessmentQuestions).values({
          id: randomUUID(),
          assessmentId,
          questionText: question.questionText,
          questionType: question.questionType,
          options: question.options,
          correctAnswers: question.correctAnswers,
          weight: question.weight,
          sortOrder: index + 1,
        });
      }
    });

    return this.getAssessment(assessmentId, false);
  }

  async getAssessment(
    assessmentId: string,
    includeAnswers: boolean,
  ) {
    const [assessment] = await this.database.db
      .select()
      .from(courseAssessments)
      .where(eq(courseAssessments.id, assessmentId))
      .limit(1);

    if (!assessment) {
      throw new NotFoundException(
        'Không tìm thấy bài kiểm tra',
      );
    }

    const questions = await this.database.db
      .select()
      .from(assessmentQuestions)
      .where(
        eq(
          assessmentQuestions.assessmentId,
          assessmentId,
        ),
      )
      .orderBy(asc(assessmentQuestions.sortOrder));

    return {
      assessment,
      questions: questions.map((question) => ({
        ...question,
        correctAnswers: includeAnswers
          ? question.correctAnswers
          : undefined,
      })),
    };
  }

  async submitAssessment(
    assessmentId: string,
    input: SubmitAssessmentDto,
  ) {
    const [context] = await this.database.db
      .select({
        assessment: courseAssessments,
        course: trainingCourses,
        enrollment: courseEnrollments,
        workerUserId: workerProfiles.userId,
      })
      .from(courseAssessments)
      .innerJoin(
        trainingCourses,
        eq(courseAssessments.courseId, trainingCourses.id),
      )
      .innerJoin(
        courseEnrollments,
        and(
          eq(
            courseEnrollments.courseId,
            trainingCourses.id,
          ),
          eq(courseEnrollments.id, input.enrollmentId),
        ),
      )
      .innerJoin(
        workerProfiles,
        eq(
          courseEnrollments.workerId,
          workerProfiles.id,
        ),
      )
      .where(eq(courseAssessments.id, assessmentId))
      .limit(1);

    if (!context) {
      throw new NotFoundException(
        'Không tìm thấy dữ liệu làm bài',
      );
    }

    if (context.workerUserId !== input.workerUserId) {
      throw new BadRequestException(
        'Worker không thuộc ghi danh này',
      );
    }

    if (
      context.enrollment.status !== 'TRAINING_COMPLETED' &&
      context.enrollment.status !== 'PASSED'
    ) {
      throw new BadRequestException(
        'Worker chưa hoàn thành phần học',
      );
    }

    const [attemptCounter] = await this.database.db
      .select({
        latest: max(assessmentAttempts.attemptNumber),
      })
      .from(assessmentAttempts)
      .where(
        and(
          eq(
            assessmentAttempts.assessmentId,
            assessmentId,
          ),
          eq(
            assessmentAttempts.workerId,
            context.enrollment.workerId,
          ),
        ),
      );

    const attemptNumber =
      (attemptCounter?.latest ?? 0) + 1;

    if (
      attemptNumber >
      context.assessment.maximumAttempts
    ) {
      throw new BadRequestException(
        'Worker đã hết số lần làm bài',
      );
    }

    const questions = await this.database.db
      .select()
      .from(assessmentQuestions)
      .where(
        eq(
          assessmentQuestions.assessmentId,
          assessmentId,
        ),
      );

    const result = this.grade(
      questions,
      input.answers,
      context.course.passingScore,
    );

    const attemptId = randomUUID();

    await this.database.db.transaction(async (tx) => {
      await tx.insert(assessmentAttempts).values({
        id: attemptId,
        assessmentId,
        enrollmentId: input.enrollmentId,
        workerId: context.enrollment.workerId,
        attemptNumber,
        answers: input.answers,
        score: result.score,
        passed: result.passed,
        status: 'GRADED',
        submittedAt: new Date(),
        gradedAt: new Date(),
      });

      await tx
        .update(courseEnrollments)
        .set({
          status: result.passed ? 'PASSED' : 'FAILED',
        })
        .where(
          eq(
            courseEnrollments.id,
            input.enrollmentId,
          ),
        );
    });

    if (result.passed) {
      await this.issueCertificate(
        context.course,
        context.enrollment.workerId,
        attemptId,
      );
    }

    return {
      attemptId,
      attemptNumber,
      ...result,
    };
  }

  async workerTraining(workerId: string) {
    const [worker] = await this.database.db
      .select()
      .from(workerProfiles)
      .where(eq(workerProfiles.id, workerId))
      .limit(1);

    if (!worker) {
      throw new NotFoundException(
        'Không tìm thấy Worker',
      );
    }

    const [enrollments, certificates, badges] =
      await Promise.all([
        this.database.db
          .select()
          .from(courseEnrollments)
          .where(eq(courseEnrollments.workerId, workerId))
          .orderBy(desc(courseEnrollments.enrolledAt)),
        this.database.db
          .select()
          .from(workerCertificates)
          .where(eq(workerCertificates.workerId, workerId))
          .orderBy(desc(workerCertificates.issuedAt)),
        this.database.db
          .select()
          .from(workerBadges)
          .where(eq(workerBadges.workerId, workerId))
          .orderBy(desc(workerBadges.awardedAt)),
      ]);

    return {
      worker,
      enrollments,
      certificates,
      badges,
    };
  }

  async revokeCertificate(
    certificateId: string,
    input: RevokeCertificateDto,
  ) {
    const [certificate] = await this.database.db
      .select()
      .from(workerCertificates)
      .where(eq(workerCertificates.id, certificateId))
      .limit(1);

    if (!certificate) {
      throw new NotFoundException(
        'Không tìm thấy chứng nhận',
      );
    }

    if (certificate.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Chứng nhận không còn ACTIVE',
      );
    }

    await this.database.db.transaction(async (tx) => {
      await tx
        .update(workerCertificates)
        .set({
          status: 'REVOKED',
          revokedAt: new Date(),
          revocationReason: input.reason,
        })
        .where(eq(workerCertificates.id, certificateId));

      await tx
        .update(workerBadges)
        .set({ active: false })
        .where(eq(workerBadges.sourceId, certificateId));

      await tx.insert(auditLogs).values({
        id: randomUUID(),
        actorUserId: input.actorUserId,
        action: 'CERTIFICATE_REVOKED',
        entityType: 'WORKER_CERTIFICATE',
        entityId: certificateId,
        beforeData: { status: certificate.status },
        afterData: {
          status: 'REVOKED',
          reason: input.reason,
        },
      });
    });

    return this.workerTraining(certificate.workerId);
  }

  private async issueCertificate(
    course: typeof trainingCourses.$inferSelect,
    workerId: string,
    attemptId: string,
  ) {
    if (!course.certificationCode) {
      return;
    }

    const certificateId = randomUUID();
    const certificateNumber =
      `WL-CERT-${Date.now()}-${workerId.slice(0, 6)}`;

    const expiresAt = course.certificateValidityDays
      ? new Date(
          Date.now() +
            course.certificateValidityDays *
              86_400_000,
        )
      : null;

    await this.database.db.transaction(async (tx) => {
      await tx
        .update(workerCertificates)
        .set({ status: 'SUPERSEDED' })
        .where(
          and(
            eq(workerCertificates.workerId, workerId),
            eq(
              workerCertificates.certificateCode,
              course.certificationCode!,
            ),
            eq(workerCertificates.status, 'ACTIVE'),
          ),
        );

      await tx.insert(workerCertificates).values({
        id: certificateId,
        certificateCode: course.certificationCode!,
        workerId,
        courseId: course.id,
        assessmentAttemptId: attemptId,
        status: 'ACTIVE',
        certificateNumber,
        expiresAt,
        metadata: {
          courseCode: course.courseCode,
          scoringVersion: 'ASSESSMENT_V1',
        },
      });

      await tx.insert(workerBadges).values({
        id: randomUUID(),
        workerId,
        badgeCode: course.certificationCode!,
        badgeName: course.title,
        sourceType: 'CERTIFICATE',
        sourceId: certificateId,
        expiresAt,
      });

      if (course.skillCode) {
        await tx
          .insert(workerSkills)
          .values({
            id: randomUUID(),
            workerId,
            skillCode: course.skillCode,
            skillName: course.title,
            proficiencyLevel: 'CERTIFIED',
            verificationStatus: 'VERIFIED',
            verifiedAt: new Date(),
            certificateName: course.title,
            certificateExpiresAt: expiresAt,
          })
          .onDuplicateKeyUpdate({
            set: {
              proficiencyLevel: 'CERTIFIED',
              verificationStatus: 'VERIFIED',
              verifiedAt: new Date(),
              certificateName: course.title,
              certificateExpiresAt: expiresAt,
            },
          });
      }
    });
  }

  private grade(
    questions: Array<
      typeof assessmentQuestions.$inferSelect
    >,
    answers: Record<string, string[]>,
    passingScore: number,
  ) {
    const totalWeight = questions.reduce(
      (sum, question) => sum + question.weight,
      0,
    );

    const earnedWeight = questions.reduce(
      (sum, question) => {
        const expected = [
          ...(question.correctAnswers ?? []),
        ].sort();
        const actual = [
          ...(answers[question.id] ?? []),
        ].sort();

        const correct =
          expected.length === actual.length &&
          expected.every(
            (value, index) => value === actual[index],
          );

        return sum + (correct ? question.weight : 0);
      },
      0,
    );

    const score =
      totalWeight > 0
        ? Math.round(
            (earnedWeight / totalWeight) * 10_000,
          ) / 100
        : 0;

    return {
      score,
      passed: score >= passingScore,
      passingScore,
      scoringVersion: 'ASSESSMENT_V1',
    };
  }
}
