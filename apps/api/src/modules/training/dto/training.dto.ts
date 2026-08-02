import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCourseDto {
  @IsString()
  @MaxLength(50)
  courseCode!: string;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  skillCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  certificationCode?: string;

  @IsString()
  @IsIn(['ONLINE', 'OFFLINE', 'BLENDED'])
  deliveryMode!: string;

  @IsInt()
  @Min(1)
  durationMinutes!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  passingScore!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  certificateValidityDays?: number;

  @IsUUID()
  actorUserId!: string;
}

export class EnrollWorkerDto {
  @IsUUID()
  workerId!: string;

  @IsUUID()
  actorUserId!: string;
}

export class UpdateProgressDto {
  @IsUUID()
  actorUserId!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  progressPercent!: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}

export class QuestionDto {
  @IsString()
  @MaxLength(5000)
  questionText!: string;

  @IsString()
  @IsIn(['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE'])
  questionType!: string;

  @IsArray()
  options!: Array<{ code: string; label: string }>;

  @IsArray()
  @IsString({ each: true })
  correctAnswers!: string[];

  @IsNumber()
  @Min(0.01)
  weight!: number;
}

export class CreateAssessmentDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimitMinutes?: number;

  @IsInt()
  @Min(1)
  maximumAttempts!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions!: QuestionDto[];
}

export class SubmitAssessmentDto {
  @IsUUID()
  workerUserId!: string;

  @IsUUID()
  enrollmentId!: string;

  @IsObject()
  answers!: Record<string, string[]>;
}

export class RevokeCertificateDto {
  @IsUUID()
  actorUserId!: string;

  @IsString()
  @MaxLength(500)
  reason!: string;
}
