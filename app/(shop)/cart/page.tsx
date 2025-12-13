import Image from "next/image";
import Link from "next/link";

import { removeCartItem, updateCartItemQuantity } from "@/app/(shop)/actions";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getUserOrRedirect } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatINR } from "@/utils/format";

export default async function CartPage() {
  const user = await getUserOrRedirect("/login");
  const supabase = await createSupabaseServerClient();

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
          title="Your cart is empty"
          description="When you find something that feels right, it will appear here."
          action={<ButtonLink href="/products">Browse products</ButtonLink>}
        />
      </div>
    );
  }

  const { data: items, error } = await supabase
    .from("cart_items")
    .select("id,quantity, products(id,name,slug,price_inr,short_benefit, product_images(path,alt,sort_order))")
    .eq("cart_id", cart.id)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const list = items ?? [];
  if (!list.length) {
    return (
      <div className="mx-auto w-full max-w-3xl px-[var(--spacing-pageX)] py-10">
        <EmptyState
          title="Your cart is empty"
          description="When you find something that feels right, it will appear here."
          action={<ButtonLink href="/products">Browse products</ButtonLink>}
        />
      </div>
    );
  }

  type CartItemRow = {
    id: string;
    quantity: number;
    products:
      | Array<{
          id: string;
          name: string;
          slug: string;
          price_inr: number;
          short_benefit: string | null;
          product_images: Array<{ path: string; alt: string | null; sort_order: number }>;
        }>
      | {
          id: string;
          name: string;
          slug: string;
          price_inr: number;
          short_benefit: string | null;
          product_images: Array<{ path: string; alt: string | null; sort_order: number }>;
        };
  };
  const typedList = ((list as unknown) as CartItemRow[]).map((it) => ({
    ...it,
    products: Array.isArray(it.products) ? it.products[0] : it.products,
  }));
  const subtotal = typedList.reduce((sum, it) => sum + it.quantity * (it.products?.price_inr ?? 0), 0);

  return (
    <div className="mx-auto w-full max-w-4xl px-[var(--spacing-pageX)] py-10">
      <h1 className="text-2xl font-semibold">Cart</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Simple, calm checkout—no surprises.
      </p>

      <div className="mt-8 space-y-4">
        {typedList.map((it) => {
          const p = it.products;
          const img = (p?.product_images ?? [])
            .slice()
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
          const src = img?.path ? `/${String(img.path).replace(/^\/+/, "")}` : "/images/brand/Banner_product.png";

          return (
            <Card key={it.id}>
              <CardContent className="flex gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <Image src={src} alt={img?.alt ?? p?.name ?? "Product"} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/products/${p.slug}`} className="font-medium hover:underline">
                        {p.name}
                      </Link>
                      {p.short_benefit ? (
                        <p className="mt-1 text-sm text-muted-foreground">{p.short_benefit}</p>
                      ) : null}
                    </div>
                    <div className="text-sm font-semibold">{formatINR(p.price_inr)}</div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <form action={updateCartItemQuantity} className="flex items-center gap-2">
                      <input type="hidden" name="cartItemId" value={it.id} />
                      <label className="text-sm text-muted-foreground" htmlFor={`qty-${it.id}`}>
                        Qty
                      </label>
                      <input
                        id={`qty-${it.id}`}
                        name="quantity"
                        type="number"
                        min={1}
                        defaultValue={it.quantity}
                        className="h-9 w-20 rounded-xl border border-border bg-card px-3 text-sm"
                      />
                      <button className="rounded-xl border border-border bg-muted px-3 py-2 text-sm hover:bg-muted/70">
                        Update
                      </button>
                    </form>

                    <form action={removeCartItem}>
                      <input type="hidden" name="cartItemId" value={it.id} />
                      <button className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
                        Remove
                      </button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-muted-foreground">Subtotal</p>
          <p className="mt-1 text-xl font-semibold">{formatINR(subtotal)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Shipping & taxes calculated at checkout (MVP).</p>
        </div>
        <ButtonLink href="/checkout" className="w-full sm:w-auto">
          Continue to checkout
        </ButtonLink>
      </div>
    </div>
  );
}


