import type { PaymentsProvider } from "@/lib/payments/types";
import { StubPaymentsProvider } from "@/lib/payments/providers/stub";

export function getPaymentsProvider(): PaymentsProvider {
  const provider = (process.env.PAYMENTS_PROVIDER ?? "stub").toLowerCase();
  switch (provider) {
    case "stub":
    default:
      return new StubPaymentsProvider();
  }
}


