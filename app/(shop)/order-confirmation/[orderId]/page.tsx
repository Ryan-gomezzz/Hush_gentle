import Link from "next/link";
import { notFound } from "next/navigation";

import { ButtonLink } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { getUserOrRedirect } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatINR } from "@/utils/format";

export default async function OrderConfirmationPage({
  params,
}: {
  params: { orderId: string };
}) {
  const user = await getUserOrRedirect("/login");
  const supabase = await createSupabaseServerClient();

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("id,status,total_inr,created_at,shipping_address")
    .eq("id", params.orderId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (orderErr) throw orderErr;
  if (!order) notFound();

  const { data: items, error: itemsErr } = await supabase
    .from("order_items")
    .select("id,quantity,price_inr, products(name,slug)")
    .eq("order_id", order.id);
  if (itemsErr) throw itemsErr;

  return (
    <div className="mx-auto w-full max-w-4xl px-[var(--spacing-pageX)] py-10">
      <h1 className="text-2xl font-semibold">Order confirmed</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Thank you. We’ve saved your order details. Payment is in stub mode for the MVP demo.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent>
            <h2 className="text-base font-semibold">Order details</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-medium">{order.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">{order.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">{formatINR(order.total_inr)}</span>
              </div>
            </div>
            <div className="mt-5">
              <ButtonLink href="/products" variant="secondary">
                Continue shopping
              </ButtonLink>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-base font-semibold">Items</h2>
            <div className="mt-4 space-y-3 text-sm">
              {(((items ?? []) as unknown) as Array<{
                id: string;
                quantity: number;
                price_inr: number;
                products: Array<{ name: string; slug: string }> | { name: string; slug: string };
              }>)
                .map((it) => ({
                  ...it,
                  products: Array.isArray(it.products) ? it.products[0] : it.products,
                }))
                .map((it) => (
                <div key={it.id} className="flex items-center justify-between">
                  <Link href={`/products/${it.products.slug}`} className="text-muted-foreground hover:text-foreground">
                    {it.products.name} × {it.quantity}
                  </Link>
                  <span className="font-medium">{formatINR(it.price_inr * it.quantity)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


