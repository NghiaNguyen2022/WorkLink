import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class RunMatchingDto {
  @IsUUID()
  actorUserId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minimumScore?: number;
}

export class OfferCandidateDto {
  @IsUUID()
  actorUserId!: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(1440)
  expiresInMinutes?: number;
}

export class RespondOfferDto {
  @IsUUID()
  workerUserId!: string;

  @IsString()
  @IsIn(['ACCEPT', 'REJECT'])
  decision!: 'ACCEPT' | 'REJECT';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class ConfirmOfferDto {
  @IsUUID()
  actorUserId!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  retentionAmount?: number;
}
