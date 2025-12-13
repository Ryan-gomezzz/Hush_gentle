import Image from "next/image";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/Card";
import { formatINR } from "@/utils/format";

export function ProductCard({
  product,
}: {
  product: {
    id: string;
    name: string;
    slug: string;
    short_benefit?: string | null;
    price_inr: number;
    product_images?: Array<{ path: string; alt?: string | null; sort_order?: number | null }>;
  };
}) {
  const image = (product.product_images ?? [])
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
  const src = image?.path
    ? `/${String(image.path).replace(/^\/+/, "")}`
    : "/images/brand/Banner_product.png";

  return (
    <Card className="overflow-hidden">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] w-full bg-muted">
          <Image
            src={src}
            alt={image?.alt ?? product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      </Link>
      <CardContent className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href={`/products/${product.slug}`} className="font-medium hover:underline">
              {product.name}
            </Link>
            {product.short_benefit ? (
              <p className="mt-1 text-sm text-muted-foreground">{product.short_benefit}</p>
            ) : null}
          </div>
          <div className="shrink-0 text-sm font-semibold">{formatINR(product.price_inr)}</div>
        </div>
      </CardContent>
    </Card>
  );
}


