import Image from "next/image";

export function ProductGallery({
  name,
  images,
}: {
  name: string;
  images: Array<{ path: string; alt?: string | null; sort_order?: number | null }>;
}) {
  const sorted = images.slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const first = sorted[0];
  const src = first?.path ? `/${String(first.path).replace(/^\/+/, "")}` : "/images/brand/Banner_product.png";

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-muted">
      <div className="relative aspect-square w-full">
        <Image
          src={src}
          alt={first?.alt ?? name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
    </div>
  );
}


