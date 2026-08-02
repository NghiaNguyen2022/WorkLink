import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class PrepareSettlementDto {
  @IsUUID()
  actorUserId!: string;
}

export class AddAdjustmentDto {
  @IsUUID()
  actorUserId!: string;

  @IsString()
  @IsIn(['CUSTOMER', 'WORKER'])
  target!: 'CUSTOMER' | 'WORKER';

  @IsOptional()
  @IsUUID()
  assignmentId?: string;

  @IsNumber()
  amount!: number;

  @IsString()
  @MaxLength(500)
  description!: string;
}

export class ApproveSettlementDto {
  @IsUUID()
  actorUserId!: string;
}

export class PaymentActionDto {
  @IsUUID()
  actorUserId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  provider?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  providerReference?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

export class EarningsQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'PAID', 'ALL'])
  status?: 'PENDING' | 'PAID' | 'ALL';
}
