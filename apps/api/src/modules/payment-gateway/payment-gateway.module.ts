import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MockPaymentGatewayProvider } from './providers/mock-payment-gateway.provider';
import { PAYMENT_GATEWAY_PROVIDER } from './payment-gateway.token';

@Module({
  providers: [
    MockPaymentGatewayProvider,
    {
      provide: PAYMENT_GATEWAY_PROVIDER,
      inject: [ConfigService, MockPaymentGatewayProvider],
      useFactory: (
        config: ConfigService,
        mock: MockPaymentGatewayProvider,
      ) => {
        const selected =
          config.get<string>('PAYMENT_GATEWAY_PROVIDER') ??
          'mock';

        switch (selected) {
          // Add real providers here as they're implemented, e.g.
          // case 'vnpay': return vnpay;
          case 'mock':
          default:
            return mock;
        }
      },
    },
  ],
  exports: [PAYMENT_GATEWAY_PROVIDER],
})
export class PaymentGatewayModule {}
