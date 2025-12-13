import Image from "next/image";
import Link from "next/link";

import { toggleWishlist } from "@/app/(shop)/actions";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getUserOrRedirect } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatINR } from "@/utils/format";

export default async function WishlistPage() {
  const user = await getUserOrRedirect("/login");
  const supabase = await createSupabaseServerClient();

  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!wishlist?.id) {
    return (
      <div className="mx-auto w-full max-w-3xl px-[var(--spacing-pageX)] py-10">
        <EmptyState
          title="Your wishlist is empty"
          description="Save products you’d like to come back to later."
          action={<ButtonLink href="/products">Browse products</ButtonLink>}
        />
      </div>
    );
  }

  const { data: items, error } = await supabase
    .from("wishlist_items")
    .select("id, products(id,name,slug,price_inr,short_benefit, product_images(path,alt,sort_order))")
    .eq("wishlist_id", wishlist.id)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const list = items ?? [];
  if (!list.length) {
    return (
      <div className="mx-auto w-full max-w-3xl px-[var(--spacing-pageX)] py-10">
        <EmptyState
          title="Your wishlist is empty"
          description="Save products you’d like to come back to later."
          action={<ButtonLink href="/products">Browse products</ButtonLink>}
        />
      </div>
    );
  }

  type WishlistItemRow = {
    id: string;
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
  const typedList = ((list as unknown) as WishlistItemRow[]).map((it) => ({
    ...it,
    products: Array.isArray(it.products) ? it.products[0] : it.products,
  }));

  return (
    <div className="mx-auto w-full max-w-4xl px-[var(--spacing-pageX)] py-10">
      <h1 className="text-2xl font-semibold">Wishlist</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Keep a calm shortlist of what you love.
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

                  <div className="mt-4">
                    <form action={toggleWishlist}>
                      <input type="hidden" name="productId" value={p.id} />
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
    </div>
  );
}


