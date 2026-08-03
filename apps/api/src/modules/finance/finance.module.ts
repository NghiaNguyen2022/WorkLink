import { Module } from '@nestjs/common';

import { PaymentGatewayModule } from '../payment-gateway/payment-gateway.module';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';

@Module({
  imports: [PaymentGatewayModule],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
