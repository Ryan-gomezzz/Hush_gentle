import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductGallery } from "@/components/ProductGallery";
import { WishlistButton } from "@/components/WishlistButton";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { getAmazonReviewsForProduct, getProductBySlug } from "@/lib/storefront";
import { formatINR } from "@/utils/format";

export default async function ProductDetailPage({
  params,
}: {
  // Next.js 16: `params` is a Promise in Server Components
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const amazonReviews = await getAmazonReviewsForProduct(product.id);

  const trustBadges = [
    { label: "Organic", variant: "soft" as const },
    { label: "Cruelty-free", variant: "soft" as const },
    { label: "No harsh chemicals", variant: "soft" as const },
    { label: "Sensitive-skin friendly", variant: "soft" as const },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-[var(--spacing-pageX)] py-10">
      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery name={product.name} images={product.product_images ?? []} />

        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
          {product.short_benefit ? (
            <p className="mt-3 text-base text-muted-foreground">{product.short_benefit}</p>
          ) : null}
          <div className="mt-4 text-lg font-semibold">{formatINR(product.price_inr)}</div>

          <div className="mt-5 flex flex-wrap gap-2">
            {trustBadges.map((b) => (
              <Badge key={b.label} variant={b.variant}>
                {b.label}
              </Badge>
            ))}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <AddToCartButton productId={product.id} />
            <WishlistButton productId={product.id} />
          </div>

          <div className="mt-8">
            <Tabs
              items={[
                {
                  key: "description",
                  label: "Description",
                  content: (
                    <p className="text-sm text-muted-foreground">
                      {product.description ?? "A calm, gentle product made for everyday use."}
                    </p>
                  ),
                },
                {
                  key: "ingredients",
                  label: "Ingredients",
                  content: (
                    <p className="text-sm text-muted-foreground">
                      {product.ingredients ??
                        "Cold-pressed oils, organic butters, lanolin, vitamin E, essential oils."}
                    </p>
                  ),
                },
                {
                  key: "how",
                  label: "How to use",
                  content: (
                    <p className="text-sm text-muted-foreground">
                      {product.how_to_use ?? "Apply a small amount and massage gently until absorbed."}
                    </p>
                  ),
                },
                {
                  key: "gentle",
                  label: "Why it’s gentle",
                  content: (
                    <p className="text-sm text-muted-foreground">
                      {product.why_gentle ??
                        "We keep formulas minimal and skin-respecting—no harsh chemicals, just gentle care."}
                    </p>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent>
            <h2 className="text-base font-semibold">Amazon reviews</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manually added “Verified Amazon Customer” feedback for trust.
            </p>
            <div className="mt-5 space-y-4">
              {amazonReviews.length ? (
                amazonReviews.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{r.title ?? "Review"}</p>
                      <p className="text-xs text-muted-foreground">{`${r.rating}★`}</p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{r.content}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {r.is_verified ? "Verified Amazon Customer" : "Amazon Customer"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No Amazon reviews yet for this product.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-base font-semibold">A gentle note</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We keep information calm and practical. If you have sensitive skin concerns, patch-test first and
              choose what feels comfortable for you.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


