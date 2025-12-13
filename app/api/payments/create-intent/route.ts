import { NextResponse } from "next/server";
import { z } from "zod";

import { trackEventServer } from "@/lib/analytics";
import { getUserOrRedirect } from "@/lib/auth";
import { getPaymentsProvider } from "@/lib/payments";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  orderId: z.string().uuid(),
});

export async function POST(req: Request) {
  const user = await getUserOrRedirect("/login");
  const supabase = createSupabaseServerClient();

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("id,total_inr,status")
    .eq("id", parsed.data.orderId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 400 });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const provider = getPaymentsProvider();

  // Create payment row (user-owned via RLS)
  const { data: payment, error: payErr } = await supabase
    .from("payments")
    .insert({
      order_id: order.id,
      user_id: user.id,
      provider: provider.providerName,
      status: "created",
      amount_inr: order.total_inr,
    })
    .select("id")
    .single();
  if (payErr) return NextResponse.json({ error: payErr.message }, { status: 400 });

  const result = await provider.createPaymentIntent({
    orderId: order.id,
    userId: user.id,
    amountInr: order.total_inr,
    currency: "INR",
  });

  const { error: updErr } = await supabase
    .from("payments")
    .update({
      status: result.status,
      provider_reference: result.providerReference ?? null,
      meta: result.meta ?? {},
    })
    .eq("id", payment.id);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 });

  if (result.status === "succeeded") {
    await supabase.from("orders").update({ status: "paid" }).eq("id", order.id);
    await trackEventServer({
      event_name: "payment_success",
      path: `/order-confirmation/${order.id}`,
      meta: { orderId: order.id, paymentId: payment.id, provider: provider.providerName },
    });
  } else if (result.status === "failed") {
    await trackEventServer({
      event_name: "payment_failure",
      path: `/checkout`,
      meta: { orderId: order.id, paymentId: payment.id, provider: provider.providerName },
    });
  }

  return NextResponse.json({
    ok: true,
    paymentId: payment.id,
    status: result.status,
    redirectUrl: result.redirectUrl ?? null,
    clientSecret: result.clientSecret ?? null,
  });
}


