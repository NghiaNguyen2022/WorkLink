import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EvidenceItemDto {
  @IsString()
  @IsIn(['PHOTO', 'VIDEO', 'DOCUMENT', 'SIGNATURE', 'OTHER'])
  type!: string;

  @IsString()
  @MaxLength(1000)
  url!: string;
}

export class CheckInDto {
  @IsUUID()
  workerUserId!: string;

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

export class AddEvidenceDto {
  @IsUUID()
  actorUserId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceItemDto)
  evidence!: EvidenceItemDto[];
}

export class CheckOutDto {
  @IsUUID()
  workerUserId!: string;

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
  @Type(() => EvidenceItemDto)
  evidence?: EvidenceItemDto[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class CustomerConfirmDto {
  @IsUUID()
  customerUserId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class CreateIncidentDto {
  @IsUUID()
  reportedByUserId!: string;

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
  @Type(() => EvidenceItemDto)
  evidence?: EvidenceItemDto[];
}

export class AssignmentActionDto {
  @IsUUID()
  actorUserId!: string;

  @IsString()
  @MaxLength(500)
  reason!: string;
}
