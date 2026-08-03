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

export class UpdateWorkerProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  biography?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  currentAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  currentDistrict?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  currentCity?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  @IsString()
  @IsIn(['MOTORBIKE', 'CAR', 'BICYCLE', 'PUBLIC_TRANSPORT', 'WALK'])
  transportType?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(200)
  maxTravelKm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumHourlyRate?: number;

  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  emergencyContactPhone?: string;
}

export class CreateAvailabilityDto {
  @IsOptional()
  @IsString()
  @IsIn(['ONE_TIME', 'RECURRING'])
  availabilityType?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek?: number;

  @IsOptional()
  @IsString()
  specificDate?: string;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceAreas?: string[];

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

export class UpdateAvailabilityDto {
  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceAreas?: string[];

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

export class WorkerOfferRespondDto {
  @IsString()
  @IsIn(['ACCEPT', 'REJECT'])
  decision!: 'ACCEPT' | 'REJECT';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class WorkerCheckInDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @IsOptional()
  @IsString()
  @IsIn(['GPS', 'QR', 'MANUAL'])
  method?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class WorkerEvidenceItemDto {
  @IsString()
  @IsIn(['PHOTO', 'VIDEO', 'DOCUMENT', 'SIGNATURE', 'OTHER'])
  type!: string;

  @IsString()
  @MaxLength(1000)
  url!: string;
}

export class WorkerCheckOutDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @IsOptional()
  @IsString()
  @IsIn(['GPS', 'QR', 'MANUAL'])
  method?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkerEvidenceItemDto)
  evidence?: WorkerEvidenceItemDto[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class WorkerAddEvidenceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkerEvidenceItemDto)
  evidence!: WorkerEvidenceItemDto[];
}

export class WorkerCreateIncidentDto {
  @IsString()
  @IsIn([
    'LATE',
    'NO_SHOW',
    'SAFETY',
    'QUALITY',
    'CUSTOMER',
    'WORKER',
    'EQUIPMENT',
    'OTHER',
  ])
  incidentType!: string;

  @IsString()
  @IsIn(['LOW', 'NORMAL', 'HIGH', 'CRITICAL'])
  severity!: string;

  @IsString()
  @MaxLength(5000)
  description!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkerEvidenceItemDto)
  evidence?: WorkerEvidenceItemDto[];
}

export class WorkerReviewDto {
  @IsUUID()
  jobId!: string;

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
