import { NextResponse } from "next/server";
import { z } from "zod";

import { trackEventServer } from "@/lib/analytics";
import { getUserOrRedirect } from "@/lib/auth";
import { getPaymentsProvider } from "@/lib/payments";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  paymentId: z.string().uuid(),
});

export async function POST(req: Request) {
  const user = await getUserOrRedirect("/login");
  const supabase = await createSupabaseServerClient();

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { data: payment, error: payErr } = await supabase
    .from("payments")
    .select("id,order_id,provider,provider_reference,status")
    .eq("id", parsed.data.paymentId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (payErr) return NextResponse.json({ error: payErr.message }, { status: 400 });
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  const provider = getPaymentsProvider();
  const providerRef = payment.provider_reference;
  if (!providerRef) {
    return NextResponse.json({ error: "Missing provider reference" }, { status: 400 });
  }

  const result = await provider.verifyPayment({ providerReference: providerRef });

  await supabase
    .from("payments")
    .update({
      status: result.status,
      meta: result.meta ?? {},
    })
    .eq("id", payment.id);

  if (result.status === "succeeded") {
    await supabase.from("orders").update({ status: "paid" }).eq("id", payment.order_id);
    await trackEventServer({
      event_name: "payment_success",
      path: `/order-confirmation/${payment.order_id}`,
      meta: { orderId: payment.order_id, paymentId: payment.id, provider: provider.providerName },
    });
  } else if (result.status === "failed") {
    await trackEventServer({
      event_name: "payment_failure",
      path: `/checkout`,
      meta: { orderId: payment.order_id, paymentId: payment.id, provider: provider.providerName },
    });
  }

  return NextResponse.json({ ok: true, status: result.status });
}


