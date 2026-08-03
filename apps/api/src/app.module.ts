import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { envValidationSchema } from './common/config/env.validation';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { CustomersModule } from './modules/customers/customers.module';
import { CustomerPortalModule } from './modules/customer-portal/customer-portal.module';
import { ExecutionModule } from './modules/execution/execution.module';
import { ExceptionsModule } from './modules/exceptions/exceptions.module';
import { FinanceModule } from './modules/finance/finance.module';
import { HealthModule } from './modules/health/health.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { MatchingModule } from './modules/matching/matching.module';
import { QualityModule } from './modules/quality/quality.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { UsersModule } from './modules/users/users.module';
import { WorkersModule } from './modules/workers/workers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
      validationSchema: envValidationSchema,
    }),
    DatabaseModule,
    HealthModule,
    UsersModule,
    AuthModule,
    CustomersModule,
    CustomerPortalModule,
    WorkersModule,
    JobsModule,
    MatchingModule,
    ExecutionModule,
    ExceptionsModule,
    FinanceModule,
    QualityModule,
    ReportingModule,
  ],
})
export class AppModule {}
