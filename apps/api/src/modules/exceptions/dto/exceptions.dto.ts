import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AssessCancellationDto {
  @IsUUID()
  actorUserId!: string;

  @IsString()
  @IsIn(['CANCELLATION', 'NO_SHOW'])
  eventType!: string;

  @IsString()
  @IsIn(['CUSTOMER', 'WORKER', 'OPERATIONS'])
  cancelledByParty!: string;

  @IsString()
  @MaxLength(500)
  reason!: string;
}

export class ApproveCancellationDto {
  @IsUUID()
  actorUserId!: string;
}

export class RequestReplacementDto {
  @IsUUID()
  actorUserId!: string;

  @IsString()
  @MaxLength(500)
  reason!: string;

  @IsOptional()
  @IsString()
  @IsIn(['NORMAL', 'HIGH', 'CRITICAL'])
  priority?: string;
}

export class FulfillReplacementDto {
  @IsUUID()
  actorUserId!: string;

  @IsUUID()
  workerId!: string;

  @IsNumber()
  @Min(0)
  agreedPayout!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  retentionAmount?: number;
}

export class EvidenceItemDto {
  @IsString()
  @IsIn(['PHOTO', 'VIDEO', 'DOCUMENT', 'OTHER'])
  type!: string;

  @IsString()
  @MaxLength(1000)
  url!: string;
}

export class OpenDisputeDto {
  @IsUUID()
  actorUserId!: string;

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceItemDto)
  evidence?: EvidenceItemDto[];
}

export class UpdateDisputeDto {
  @IsUUID()
  actorUserId!: string;

  @IsString()
  @IsIn([
    'UNDER_REVIEW',
    'WAITING_EVIDENCE',
    'RESOLVED',
    'REJECTED',
  ])
  status!: string;

  @IsString()
  @MaxLength(5000)
  note!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceItemDto)
  evidence?: EvidenceItemDto[];
}

export class ProposeAdjustmentDto {
  @IsUUID()
  actorUserId!: string;

  @IsOptional()
  @IsUUID()
  originalPaymentId?: string;

  @IsString()
  @IsIn([
    'CUSTOMER_REFUND',
    'WORKER_ADJUSTMENT',
    'CUSTOMER_ADJUSTMENT',
  ])
  adjustmentType!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  @MaxLength(500)
  reason!: string;
}

export class ApproveAdjustmentDto {
  @IsUUID()
  actorUserId!: string;
}
