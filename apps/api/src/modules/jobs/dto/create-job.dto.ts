import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
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
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateJobRequirementDto {
  @IsString()
  @IsIn([
    'SKILL',
    'CERTIFICATE',
    'BEHAVIOR',
    'GENDER',
    'EXPERIENCE',
    'HEALTH',
    'OTHER',
  ])
  requirementType!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  requirementCode?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(500)
  description!: string;

  @IsOptional()
  @IsBoolean()
  mandatory?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  minimumLevel?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class CreateJobDto {
  @IsUUID()
  customerId!: string;

  @IsUUID()
  categoryId!: string;

  @IsUUID()
  locationId!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description!: string;

  @IsInt()
  @Min(1)
  @Max(100)
  headcount!: number;

  @IsDateString()
  startAt!: string;

  @IsDateString()
  endAt!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(480)
  breakMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  customerBudget?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  dressCode?: string;

  @IsOptional()
  @IsString()
  @IsIn(['CUSTOMER', 'WORKER', 'PLATFORM', 'SHARED'])
  toolsProvidedBy?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  specialNotes?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => CreateJobRequirementDto)
  requirements?: CreateJobRequirementDto[];
}
