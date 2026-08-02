import {
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';

export class ReportingQueryDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;
}

export class ExportQueryDto extends ReportingQueryDto {
  @IsOptional()
  @IsString()
  @IsIn([
    'JOBS',
    'PAYMENTS',
    'WORKERS',
    'CASES',
    'CERTIFICATES',
  ])
  report?: string;
}
