import type {
  CreatePaymentIntentInput,
  PaymentIntentResult,
  PaymentsProvider,
  RefundPaymentInput,
  VerifyPaymentInput,
} from "@/lib/payments/types";

export class StubPaymentsProvider implements PaymentsProvider {
  providerName = "stub";

  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult> {
    return {
      provider: this.providerName,
      status: "succeeded",
      providerReference: `stub_${crypto.randomUUID()}`,
      meta: {
        mode: "demo",
        orderId: input.orderId,
        amountInr: input.amountInr,
      },
    };
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<PaymentIntentResult> {
    return {
      provider: this.providerName,
      status: "succeeded",
      providerReference: input.providerReference,
      meta: { mode: "demo" },
    };
  }

  async refundPayment(input: RefundPaymentInput): Promise<PaymentIntentResult> {
    return {
      provider: this.providerName,
      status: "refunded",
      providerReference: input.providerReference,
      meta: { mode: "demo", amountInr: input.amountInr ?? null },
    };
  }
}


