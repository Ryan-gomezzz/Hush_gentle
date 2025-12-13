import Link from "next/link";

import { placeOrder } from "@/app/(shop)/actions";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { trackEventServer } from "@/lib/analytics";
import { getUserOrRedirect } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatINR } from "@/utils/format";

export default async function CheckoutPage() {
  const user = await getUserOrRedirect("/login");
  const supabase = await createSupabaseServerClient();

  await trackEventServer({ event_name: "checkout_started", path: "/checkout" });

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!cart?.id) {
    return (
      <div className="mx-auto w-full max-w-3xl px-[var(--spacing-pageX)] py-10">
        <EmptyState
          title="Nothing to checkout"
          description="Add a product to your cart, then come back here."
          action={
            <Link className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white" href="/products">
              Browse products
            </Link>
          }
        />
      </div>
    );
  }

  const { data: items, error } = await supabase
    .from("cart_items")
    .select("id,quantity, products(id,name,price_inr)")
    .eq("cart_id", cart.id);
  if (error) throw error;

  const list = items ?? [];
  if (!list.length) {
    return (
      <div className="mx-auto w-full max-w-3xl px-[var(--spacing-pageX)] py-10">
        <EmptyState
          title="Nothing to checkout"
          description="Add a product to your cart, then come back here."
          action={
            <Link className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white" href="/products">
              Browse products
            </Link>
          }
        />
      </div>
    );
  }

  type CheckoutItemRow = {
    id: string;
    quantity: number;
    products: Array<{ id: string; name: string; price_inr: number }> | { id: string; name: string; price_inr: number };
  };
  const typedList = ((list as unknown) as CheckoutItemRow[]).map((it) => ({
    ...it,
    products: Array.isArray(it.products) ? it.products[0] : it.products,
  }));
  const subtotal = typedList.reduce((sum, it) => sum + it.quantity * (it.products?.price_inr ?? 0), 0);
  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <div className="mx-auto w-full max-w-6xl px-[var(--spacing-pageX)] py-10">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Calm, simple, and secure. Payment is stubbed for MVP demo.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent>
            <h2 className="text-base font-semibold">Shipping details</h2>
            <form action={placeOrder} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="fullName">
                    Full name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="phone">
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="addressLine1">
                  Address line 1
                </label>
                <input
                  id="addressLine1"
                  name="addressLine1"
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="addressLine2">
                  Address line 2 (optional)
                </label>
                <input
                  id="addressLine2"
                  name="addressLine2"
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-1">
                  <label className="text-sm font-medium" htmlFor="city">
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm"
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-1">
                  <label className="text-sm font-medium" htmlFor="state">
                    State
                  </label>
                  <input
                    id="state"
                    name="state"
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm"
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-1">
                  <label className="text-sm font-medium" htmlFor="pincode">
                    Pincode
                  </label>
                  <input
                    id="pincode"
                    name="pincode"
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Place order (MVP)
              </Button>
              <p className="text-xs text-muted-foreground">
                This demo uses a payment stub. In production, this button will create a payment intent and verify
                completion.
              </p>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-base font-semibold">Order summary</h2>
            <div className="mt-5 space-y-3">
              {typedList.map((it) => (
                <div key={it.id} className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">
                    {it.products?.name} <span className="text-muted-foreground">× {it.quantity}</span>
                  </div>
                  <div className="font-medium">
                    {formatINR((it.products?.price_inr ?? 0) * it.quantity)}
                  </div>
                </div>
              ))}
              <div className="my-4 h-px bg-border" />
              <div className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground">Subtotal</div>
                <div className="font-medium">{formatINR(subtotal)}</div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground">Shipping</div>
                <div className="font-medium">{formatINR(shipping)}</div>
              </div>
              <div className="flex items-center justify-between text-base">
                <div className="font-semibold">Total</div>
                <div className="font-semibold">{formatINR(total)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


