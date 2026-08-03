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
} from 'class-validator';

export class CreateCustomerJobDto {
  @IsUUID()
  categoryId!: string;

  @IsUUID()
  locationId!: string;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(5000)
  description!: string;

  @IsInt()
  @Min(1)
  @Max(100)
  headcount!: number;

  @IsString()
  startAt!: string;

  @IsString()
  endAt!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  breakMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  customerBudget?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  dressCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  toolsProvidedBy?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  specialNotes?: string;

  @IsOptional()
  @IsArray()
  requirements?: Array<{
    requirementType: string;
    requirementCode?: string;
    description: string;
    mandatory: boolean;
    minimumLevel?: string;
  }>;
}

export class CustomerActionDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

export class ApproveQuoteDto extends CustomerActionDto {
  @IsUUID()
  quoteId!: string;
}

export class CustomerReviewDto {
  @IsUUID()
  assignmentId!: string;

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

export class CustomerRelationshipDto {
  @IsUUID()
  workerId!: string;

  @IsString()
  @IsIn(['PREFERRED', 'BLOCKED', 'NEUTRAL'])
  preferenceType!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class CustomerRehireDto {
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

export class CustomerComplaintDto {
  @IsString()
  @IsIn(['COMPLAINT', 'DISPUTE'])
  caseType!: string;

  @IsString()
  @IsIn(['NORMAL', 'HIGH', 'CRITICAL'])
  priority!: string;

  @IsString()
  @MaxLength(200)
  subject!: string;

  @IsString()
  @MaxLength(5000)
  description!: string;
}

export class UpdateCustomerProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  companyName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;
}

export class CreateCustomerLocationDto {
  @IsString()
  @MaxLength(100)
  label!: string;

  @IsString()
  @MaxLength(150)
  contactName!: string;

  @IsString()
  @MaxLength(30)
  contactPhone!: string;

  @IsString()
  @MaxLength(255)
  addressLine!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ward?: string;

  @IsString()
  @MaxLength(100)
  district!: string;

  @IsString()
  @MaxLength(100)
  city!: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateCustomerLocationDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  label?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  contactName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  contactPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ward?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
