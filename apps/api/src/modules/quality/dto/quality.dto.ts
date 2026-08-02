import {
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  reviewerUserId!: string;

  @IsUUID()
  assignmentId!: string;

  @IsString()
  @IsIn(['CUSTOMER_TO_WORKER', 'WORKER_TO_CUSTOMER'])
  reviewerType!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  overallRating!: number;

  @IsOptional()
  @IsObject()
  criteria?: Record<string, number>;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;

  @IsOptional()
  @IsBoolean()
  wouldHireAgain?: boolean;
}

export class ModerateReviewDto {
  @IsUUID()
  actorUserId!: string;

  @IsString()
  @IsIn(['PUBLISHED', 'FLAGGED', 'HIDDEN'])
  status!: string;

  @IsString()
  @MaxLength(500)
  reason!: string;
}

export class SetRelationshipDto {
  @IsUUID()
  customerId!: string;

  @IsUUID()
  workerId!: string;

  @IsUUID()
  actorUserId!: string;

  @IsString()
  @IsIn(['CUSTOMER', 'WORKER'])
  setByParty!: string;

  @IsString()
  @IsIn(['PREFERRED', 'BLOCKED', 'NEUTRAL'])
  preferenceType!: string;

  @IsOptional()
  @IsUUID()
  sourceJobId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class RehireJobDto {
  @IsUUID()
  requestedByUserId!: string;

  @IsOptional()
  @IsUUID()
  preferredWorkerId?: string;

  @IsString()
  startAt!: string;

  @IsString()
  endAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  specialNotes?: string;
}
