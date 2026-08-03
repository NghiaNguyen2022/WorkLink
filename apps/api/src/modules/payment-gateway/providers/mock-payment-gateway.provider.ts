import { randomUUID } from 'node:crypto';

import { Injectable, Logger } from '@nestjs/common';

import type {
  CapturePaymentInput,
  CreatePaymentIntentInput,
  CreatePayoutInput,
  PaymentGatewayProvider,
  PaymentIntentResult,
  PaymentOperationResult,
  RefundInput,
  WebhookEvent,
} from '../payment-gateway.types';

/**
 * Local/dev default. Never calls a real network endpoint — every
 * operation succeeds immediately with a synthetic reference so the
 * rest of the payment lifecycle (settlement approve, webhook handling,
 * idempotency) can be built and tested without a real provider
 * contract yet.
 */
@Injectable()
export class MockPaymentGatewayProvider
  implements PaymentGatewayProvider
{
  readonly name = 'MOCK';

  private readonly logger = new Logger(
    MockPaymentGatewayProvider.name,
  );

  async createPaymentIntent(
    input: CreatePaymentIntentInput,
  ): Promise<PaymentIntentResult> {
    const providerReference = `MOCK-INTENT-${randomUUID()}`;

    this.logger.warn(
      `[MOCK] createPaymentIntent ${input.purpose} ${input.amount} ${input.currency} for payment ${input.paymentId} -> ${providerReference}`,
    );

    return {
      provider: this.name,
      providerReference,
      status: 'SUCCEEDED',
    };
  }

  async capturePayment(
    input: CapturePaymentInput,
  ): Promise<PaymentOperationResult> {
    this.logger.warn(
      `[MOCK] capturePayment ${input.providerReference}`,
    );

    return {
      provider: this.name,
      providerReference: input.providerReference,
      status: 'SUCCEEDED',
    };
  }

  async refund(
    input: RefundInput,
  ): Promise<PaymentOperationResult> {
    this.logger.warn(
      `[MOCK] refund ${input.amount} for ${input.providerReference}`,
    );

    return {
      provider: this.name,
      providerReference: input.providerReference,
      status: 'SUCCEEDED',
    };
  }

  async createPayout(
    input: CreatePayoutInput,
  ): Promise<PaymentIntentResult> {
    const providerReference = `MOCK-PAYOUT-${randomUUID()}`;

    this.logger.warn(
      `[MOCK] createPayout ${input.amount} ${input.currency} for worker ${input.workerId} -> ${providerReference}`,
    );

    return {
      provider: this.name,
      providerReference,
      status: 'SUCCEEDED',
    };
  }

  verifyWebhookSignature(): boolean {
    return true;
  }

  parseWebhookEvent(
    payload: Record<string, unknown>,
  ): WebhookEvent {
    return {
      providerEventId: String(
        payload.providerEventId ?? randomUUID(),
      ),
      providerReference: String(
        payload.providerReference ?? '',
      ),
      eventType:
        payload.eventType as WebhookEvent['eventType'],
      amount:
        typeof payload.amount === 'number'
          ? payload.amount
          : undefined,
      raw: payload,
    };
  }
}
