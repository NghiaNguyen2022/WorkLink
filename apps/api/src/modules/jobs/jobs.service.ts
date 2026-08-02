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
  customerLocations,
  customerProfiles,
  jobCategories,
  jobRequirements,
  jobs,
  jobStatusHistory,
  jobVerificationNotes,
  pricingQuotes,
} from '../../database/schema/index';
import { CreateJobDto } from './dto/create-job.dto';
import {
  AcceptJobQuoteDto,
  ActorDto,
  AddVerificationNoteDto,
  CancelJobDto,
  CreateJobQuoteDto,
  RequestJobInformationDto,
  VerifyJobDto,
} from './dto/job-actions.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import {
  canTransition,
  JOB_STATUSES,
  type JobStatus,
} from './job-status';
import { JobPricingService } from './job-pricing.service';

@Injectable()
export class JobsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly pricing: JobPricingService,
  ) {}

  async findCategories() {
    return this.database.db
      .select()
      .from(jobCategories)
      .where(eq(jobCategories.active, true))
      .orderBy(asc(jobCategories.name));
  }

  async findAll() {
    return this.database.db
      .select({
        id: jobs.id,
        jobCode: jobs.jobCode,
        title: jobs.title,
        status: jobs.status,
        headcount: jobs.headcount,
        startAt: jobs.startAt,
        endAt: jobs.endAt,
        customerBudget: jobs.customerBudget,
        suggestedPrice: jobs.suggestedPrice,
        agreedPrice: jobs.agreedPrice,
        categoryName: jobCategories.name,
        createdAt: jobs.createdAt,
      })
      .from(jobs)
      .innerJoin(
        jobCategories,
        eq(jobs.categoryId, jobCategories.id),
      )
      .orderBy(desc(jobs.createdAt));
  }

  async findById(id: string) {
    const rows = await this.database.db
      .select({
        job: jobs,
        category: jobCategories,
        customer: customerProfiles,
        location: customerLocations,
      })
      .from(jobs)
      .innerJoin(
        jobCategories,
        eq(jobs.categoryId, jobCategories.id),
      )
      .innerJoin(
        customerProfiles,
        eq(jobs.customerId, customerProfiles.id),
      )
      .innerJoin(
        customerLocations,
        eq(jobs.locationId, customerLocations.id),
      )
      .where(eq(jobs.id, id))
      .limit(1);

    const row = rows[0];

    if (!row) {
      throw new NotFoundException('Không tìm thấy công việc');
    }

    const requirements = await this.database.db
      .select()
      .from(jobRequirements)
      .where(eq(jobRequirements.jobId, id))
      .orderBy(asc(jobRequirements.createdAt));

    const quotes = await this.database.db
      .select()
      .from(pricingQuotes)
      .where(eq(pricingQuotes.jobId, id))
      .orderBy(desc(pricingQuotes.quoteVersion));

    const verificationNotes = await this.database.db
      .select()
      .from(jobVerificationNotes)
      .where(eq(jobVerificationNotes.jobId, id))
      .orderBy(desc(jobVerificationNotes.createdAt));

    const statusHistory = await this.database.db
      .select()
      .from(jobStatusHistory)
      .where(eq(jobStatusHistory.jobId, id))
      .orderBy(desc(jobStatusHistory.createdAt));

    return {
      ...row,
      requirements,
      quotes,
      verificationNotes,
      statusHistory,
    };
  }

  async create(input: CreateJobDto) {
    this.validateDates(input.startAt, input.endAt);

    await this.validateReferences(
      input.customerId,
      input.categoryId,
      input.locationId,
    );

    const id = randomUUID();
    const jobCode = await this.createJobCode();

    await this.database.db.transaction(async (transaction) => {
      const category = await transaction
        .select()
        .from(jobCategories)
        .where(eq(jobCategories.id, input.categoryId))
        .limit(1);

      const categoryRecord = category[0];

      if (!categoryRecord) {
        throw new NotFoundException(
          'Không tìm thấy danh mục công việc',
        );
      }

      await transaction.insert(jobs).values({
        id,
        jobCode,
        customerId: input.customerId,
        categoryId: input.categoryId,
        locationId: input.locationId,
        title: input.title,
        description: input.description,
        status: JOB_STATUSES.DRAFT,
        matchingMode: categoryRecord.matchingMode,
        riskLevel: categoryRecord.riskLevel,
        headcount: input.headcount,
        startAt: new Date(input.startAt),
        endAt: new Date(input.endAt),
        breakMinutes: input.breakMinutes ?? 0,
        customerBudget: input.customerBudget,
        dressCode: input.dressCode,
        toolsProvidedBy: input.toolsProvidedBy,
        specialNotes: input.specialNotes,
      });

      if (input.requirements?.length) {
        await transaction.insert(jobRequirements).values(
          input.requirements.map((requirement) => ({
            id: randomUUID(),
            jobId: id,
            requirementType: requirement.requirementType,
            requirementCode: requirement.requirementCode,
            description: requirement.description,
            mandatory: requirement.mandatory ?? true,
            minimumLevel: requirement.minimumLevel,
            metadata: requirement.metadata,
          })),
        );
      }

      await transaction.insert(jobStatusHistory).values({
        id: randomUUID(),
        jobId: id,
        fromStatus: null,
        toStatus: JOB_STATUSES.DRAFT,
        reason: 'Khởi tạo bài đăng công việc',
      });
    });

    return this.findById(id);
  }

  async update(id: string, input: UpdateJobDto) {
    const job = await this.getJob(id);

    if (job.status !== JOB_STATUSES.DRAFT) {
      throw new BadRequestException(
        'Chỉ được chỉnh sửa toàn bộ nội dung khi công việc ở trạng thái DRAFT',
      );
    }

    if (input.startAt || input.endAt) {
      this.validateDates(
        input.startAt ?? job.startAt.toISOString(),
        input.endAt ?? job.endAt.toISOString(),
      );
    }

    await this.database.db.transaction(async (transaction) => {
      await transaction
        .update(jobs)
        .set({
          customerId: input.customerId,
          categoryId: input.categoryId,
          locationId: input.locationId,
          title: input.title,
          description: input.description,
          headcount: input.headcount,
          startAt: input.startAt
            ? new Date(input.startAt)
            : undefined,
          endAt: input.endAt
            ? new Date(input.endAt)
            : undefined,
          breakMinutes: input.breakMinutes,
          customerBudget: input.customerBudget,
          dressCode: input.dressCode,
          toolsProvidedBy: input.toolsProvidedBy,
          specialNotes: input.specialNotes,
        })
        .where(eq(jobs.id, id));

      if (input.requirements) {
        await transaction
          .delete(jobRequirements)
          .where(eq(jobRequirements.jobId, id));

        if (input.requirements.length) {
          await transaction.insert(jobRequirements).values(
            input.requirements.map((requirement) => ({
              id: randomUUID(),
              jobId: id,
              requirementType: requirement.requirementType,
              requirementCode: requirement.requirementCode,
              description: requirement.description,
              mandatory: requirement.mandatory ?? true,
              minimumLevel: requirement.minimumLevel,
              metadata: requirement.metadata,
            })),
          );
        }
      }
    });

    return this.findById(id);
  }

  async submit(id: string, input: ActorDto) {
    const job = await this.getJob(id);

    await this.transition(
      job,
      JOB_STATUSES.PENDING_VERIFICATION,
      input.actorUserId,
      'Khách hàng gửi công việc để xác minh',
      {
        submittedAt: new Date(),
      },
    );

    return this.findById(id);
  }

  async addVerificationNote(
    id: string,
    input: AddVerificationNoteDto,
  ) {
    await this.getJob(id);

    await this.database.db.insert(jobVerificationNotes).values({
      id: randomUUID(),
      jobId: id,
      noteType: input.noteType,
      content: input.content,
      createdByUserId: input.actorUserId,
    });

    return this.findById(id);
  }

  async requestInformation(
    id: string,
    input: RequestJobInformationDto,
  ) {
    const job = await this.getJob(id);

    await this.transition(
      job,
      JOB_STATUSES.PENDING_INFORMATION,
      input.actorUserId,
      input.reason,
    );

    await this.database.db.insert(jobVerificationNotes).values({
      id: randomUUID(),
      jobId: id,
      noteType: 'CUSTOMER_RESPONSE',
      content: input.reason,
      createdByUserId: input.actorUserId,
    });

    return this.findById(id);
  }

  async verify(id: string, input: VerifyJobDto) {
    const job = await this.getJob(id);

    await this.transition(
      job,
      JOB_STATUSES.VERIFIED,
      input.actorUserId,
      input.note ?? 'Điều phối viên xác nhận đủ thông tin',
      {
        verifiedAt: new Date(),
        verifiedByUserId: input.actorUserId,
      },
    );

    if (input.note) {
      await this.database.db
        .insert(jobVerificationNotes)
        .values({
          id: randomUUID(),
          jobId: id,
          noteType: 'INTERNAL',
          content: input.note,
          createdByUserId: input.actorUserId,
        });
    }

    return this.findById(id);
  }

  async createQuote(id: string, input: CreateJobQuoteDto) {
    const job = await this.getJob(id);

    if (
      job.status !== JOB_STATUSES.VERIFIED &&
      job.status !== JOB_STATUSES.PRICED &&
      job.status !==
        JOB_STATUSES.PENDING_CUSTOMER_APPROVAL
    ) {
      throw new BadRequestException(
        'Chỉ được báo giá sau khi công việc đã được xác minh',
      );
    }

    const categoryRows = await this.database.db
      .select()
      .from(jobCategories)
      .where(eq(jobCategories.id, job.categoryId))
      .limit(1);

    const category = categoryRows[0];

    if (!category) {
      throw new NotFoundException(
        'Không tìm thấy danh mục công việc',
      );
    }

    const versionRows = await this.database.db
      .select({
        latestVersion: max(pricingQuotes.quoteVersion),
      })
      .from(pricingQuotes)
      .where(eq(pricingQuotes.jobId, id));

    const quoteVersion =
      (versionRows[0]?.latestVersion ?? 0) + 1;

    const calculated = this.pricing.calculate(
      category,
      job,
      input,
    );

    const quoteId = randomUUID();

    await this.database.db.transaction(async (transaction) => {
      await transaction
        .update(pricingQuotes)
        .set({
          quoteStatus: 'SUPERSEDED',
        })
        .where(
          and(
            eq(pricingQuotes.jobId, id),
            eq(pricingQuotes.quoteStatus, 'PROPOSED'),
          ),
        );

      await transaction.insert(pricingQuotes).values({
        id: quoteId,
        jobId: id,
        quoteVersion,
        quoteStatus: 'PROPOSED',
        ...calculated,
        createdByUserId: input.actorUserId,
      });

      await transaction
        .update(jobs)
        .set({
          status: JOB_STATUSES.PENDING_CUSTOMER_APPROVAL,
          suggestedPrice: calculated.customerTotal,
          workerPayoutRate: calculated.workerPayoutRate,
          workerPayoutAmount:
            calculated.workerPayoutAmount,
          platformFeeAmount:
            calculated.platformFeeAmount,
        })
        .where(eq(jobs.id, id));

      await transaction.insert(jobStatusHistory).values([
        {
          id: randomUUID(),
          jobId: id,
          fromStatus: job.status,
          toStatus: JOB_STATUSES.PRICED,
          reason: `Tạo báo giá phiên bản ${quoteVersion}`,
          changedByUserId: input.actorUserId,
        },
        {
          id: randomUUID(),
          jobId: id,
          fromStatus: JOB_STATUSES.PRICED,
          toStatus:
            JOB_STATUSES.PENDING_CUSTOMER_APPROVAL,
          reason: 'Gửi báo giá cho khách hàng phê duyệt',
          changedByUserId: input.actorUserId,
        },
      ]);
    });

    return this.findById(id);
  }

  async acceptQuote(
    id: string,
    quoteId: string,
    input: AcceptJobQuoteDto,
  ) {
    const job = await this.getJob(id);

    if (
      job.status !==
      JOB_STATUSES.PENDING_CUSTOMER_APPROVAL
    ) {
      throw new BadRequestException(
        'Công việc không ở trạng thái chờ khách hàng duyệt giá',
      );
    }

    const quoteRows = await this.database.db
      .select()
      .from(pricingQuotes)
      .where(
        and(
          eq(pricingQuotes.id, quoteId),
          eq(pricingQuotes.jobId, id),
        ),
      )
      .limit(1);

    const quote = quoteRows[0];

    if (!quote || quote.quoteStatus !== 'PROPOSED') {
      throw new NotFoundException(
        'Không tìm thấy báo giá đang hiệu lực',
      );
    }

    await this.database.db.transaction(async (transaction) => {
      await transaction
        .update(pricingQuotes)
        .set({
          quoteStatus: 'ACCEPTED',
          acceptedAt: new Date(),
          acceptedByUserId: input.actorUserId,
        })
        .where(eq(pricingQuotes.id, quoteId));

      await transaction
        .update(jobs)
        .set({
          status: JOB_STATUSES.MATCHING,
          agreedPrice: quote.customerTotal,
          workerPayoutRate: quote.workerPayoutRate,
          workerPayoutAmount:
            quote.workerPayoutAmount,
          platformFeeAmount:
            quote.platformFeeAmount,
          publishedAt: new Date(),
        })
        .where(eq(jobs.id, id));

      await transaction.insert(jobStatusHistory).values({
        id: randomUUID(),
        jobId: id,
        fromStatus: job.status,
        toStatus: JOB_STATUSES.MATCHING,
        reason:
          'Khách hàng chấp nhận báo giá, chuyển sang Matching',
        changedByUserId: input.actorUserId,
      });
    });

    return this.findById(id);
  }

  async cancel(id: string, input: CancelJobDto) {
    const job = await this.getJob(id);

    await this.transition(
      job,
      JOB_STATUSES.CANCELLED,
      input.actorUserId,
      input.reason,
      {
        cancelledAt: new Date(),
        cancellationReason: input.reason,
      },
    );

    return this.findById(id);
  }

  private async getJob(id: string) {
    const rows = await this.database.db
      .select()
      .from(jobs)
      .where(eq(jobs.id, id))
      .limit(1);

    const job = rows[0];

    if (!job) {
      throw new NotFoundException('Không tìm thấy công việc');
    }

    return job;
  }

  private async validateReferences(
    customerId: string,
    categoryId: string,
    locationId: string,
  ) {
    const [customerRows, categoryRows, locationRows] =
      await Promise.all([
        this.database.db
          .select({ id: customerProfiles.id })
          .from(customerProfiles)
          .where(eq(customerProfiles.id, customerId))
          .limit(1),

        this.database.db
          .select({ id: jobCategories.id })
          .from(jobCategories)
          .where(
            and(
              eq(jobCategories.id, categoryId),
              eq(jobCategories.active, true),
            ),
          )
          .limit(1),

        this.database.db
          .select({
            id: customerLocations.id,
            customerId: customerLocations.customerId,
          })
          .from(customerLocations)
          .where(eq(customerLocations.id, locationId))
          .limit(1),
      ]);

    if (!customerRows[0]) {
      throw new NotFoundException(
        'Không tìm thấy hồ sơ khách hàng',
      );
    }

    if (!categoryRows[0]) {
      throw new NotFoundException(
        'Không tìm thấy danh mục công việc',
      );
    }

    if (!locationRows[0]) {
      throw new NotFoundException(
        'Không tìm thấy địa điểm công việc',
      );
    }

    if (locationRows[0].customerId !== customerId) {
      throw new BadRequestException(
        'Địa điểm không thuộc khách hàng đã chọn',
      );
    }
  }

  private validateDates(
    startAtValue: string,
    endAtValue: string,
  ) {
    const startAt = new Date(startAtValue);
    const endAt = new Date(endAtValue);

    if (endAt <= startAt) {
      throw new BadRequestException(
        'Thời gian kết thúc phải sau thời gian bắt đầu',
      );
    }
  }

  private async transition(
    job: Awaited<ReturnType<JobsService['getJob']>>,
    toStatus: JobStatus,
    actorUserId: string,
    reason: string,
    additionalValues: Partial<typeof jobs.$inferInsert> = {},
  ) {
    if (!canTransition(job.status, toStatus)) {
      throw new BadRequestException(
        `Không thể chuyển trạng thái từ ${job.status} sang ${toStatus}`,
      );
    }

    await this.database.db.transaction(async (transaction) => {
      await transaction
        .update(jobs)
        .set({
          status: toStatus,
          ...additionalValues,
        })
        .where(eq(jobs.id, job.id));

      await transaction.insert(jobStatusHistory).values({
        id: randomUUID(),
        jobId: job.id,
        fromStatus: job.status,
        toStatus,
        reason,
        changedByUserId: actorUserId,
      });
    });
  }

  private async createJobCode(): Promise<string> {
    const timestamp = new Date()
      .toISOString()
      .replace(/\D/g, '')
      .slice(0, 14);

    return `JOB-${timestamp}-${randomUUID().slice(0, 4).toUpperCase()}`;
  }
}
