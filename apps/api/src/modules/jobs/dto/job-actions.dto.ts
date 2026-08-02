import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class ActorDto {
  @IsUUID()
  actorUserId!: string;
}

export class AddVerificationNoteDto extends ActorDto {
  @IsString()
  @IsIn([
    'CALL',
    'CUSTOMER_RESPONSE',
    'INTERNAL',
    'RISK',
    'PRICING',
  ])
  noteType!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(5000)
  content!: string;
}

export class RequestJobInformationDto extends ActorDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}

export class VerifyJobDto extends ActorDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class CreateJobQuoteDto extends ActorDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  timeSurcharge?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  locationSurcharge?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  skillSurcharge?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  urgencySurcharge?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  riskSurcharge?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  retentionFee?: number;
}

export class AcceptJobQuoteDto extends ActorDto {}

export class CancelJobDto extends ActorDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}
