export type PaymentStatus =
  | "created"
  | "requires_action"
  | "succeeded"
  | "failed"
  | "refunded";

export type PaymentIntentResult = {
  provider: string;
  status: PaymentStatus;
  providerReference?: string | null;
  clientSecret?: string | null;
  redirectUrl?: string | null;
  meta?: Record<string, unknown>;
};

export type CreatePaymentIntentInput = {
  orderId: string;
  userId: string;
  amountInr: number;
  currency: "INR";
};

export type VerifyPaymentInput = {
  providerReference: string;
};

export type RefundPaymentInput = {
  providerReference: string;
  amountInr?: number;
};

export interface PaymentsProvider {
  providerName: string;
  createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult>;
  verifyPayment(input: VerifyPaymentInput): Promise<PaymentIntentResult>;
  refundPayment(input: RefundPaymentInput): Promise<PaymentIntentResult>;
}


