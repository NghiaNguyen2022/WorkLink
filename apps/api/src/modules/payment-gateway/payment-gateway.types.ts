export type PaymentGatewayOperationStatus =
  | 'PENDING'
  | 'REQUIRES_ACTION'
  | 'SUCCEEDED'
  | 'FAILED';

export interface CreatePaymentIntentInput {
  paymentId: string;
  jobId: string;
  amount: number;
  currency: string;
  purpose: 'CUSTOMER_CHARGE' | 'WORKER_PAYOUT';
}

export interface PaymentIntentResult {
  provider: string;
  providerReference: string;
  status: PaymentGatewayOperationStatus;
  redirectUrl?: string;
}

export interface CapturePaymentInput {
  providerReference: string;
}

export interface PaymentOperationResult {
  provider: string;
  providerReference: string;
  status: PaymentGatewayOperationStatus;
  raw?: Record<string, unknown>;
}

export interface RefundInput {
  providerReference: string;
  amount: number;
  reason?: string;
}

export interface CreatePayoutInput {
  paymentId: string;
  workerId: string;
  amount: number;
  currency: string;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
}

export type WebhookEventType =
  | 'PAYMENT_SUCCEEDED'
  | 'PAYMENT_FAILED'
  | 'PAYOUT_SUCCEEDED'
  | 'PAYOUT_FAILED'
  | 'REFUND_SUCCEEDED';

export interface WebhookEvent {
  providerEventId: string;
  providerReference: string;
  eventType: WebhookEventType;
  amount?: number;
  raw: Record<string, unknown>;
}

/**
 * Port that any real payment gateway (VNPay, Momo, ZaloPay, Stripe...)
 * must implement. FinanceService only ever talks to this interface —
 * swapping providers means adding one class + one config value, no
 * changes to business logic.
 */
export interface PaymentGatewayProvider {
  readonly name: string;

  createPaymentIntent(
    input: CreatePaymentIntentInput,
  ): Promise<PaymentIntentResult>;

  capturePayment(
    input: CapturePaymentInput,
  ): Promise<PaymentOperationResult>;

  refund(
    input: RefundInput,
  ): Promise<PaymentOperationResult>;

  createPayout(
    input: CreatePayoutInput,
  ): Promise<PaymentIntentResult>;

  verifyWebhookSignature(
    rawBody: string,
    signature: string | undefined,
  ): boolean;

  parseWebhookEvent(
    payload: Record<string, unknown>,
  ): WebhookEvent;
}
