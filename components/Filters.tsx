import Link from "next/link";

import type { Category } from "@/types/domain";
import { cn } from "@/utils/cn";

export function Filters({
  categories,
  activeCategorySlug,
}: {
  categories: Category[];
  activeCategorySlug?: string | null;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/products"
        className={cn(
          "rounded-full border border-border bg-card px-3 py-1.5 text-sm",
          !activeCategorySlug ? "bg-muted" : "hover:bg-muted/70",
        )}
      >
        All
      </Link>
      {categories.map((c) => {
        const active = c.slug === activeCategorySlug;
        return (
          <Link
            key={c.id}
            href={`/products?category=${encodeURIComponent(c.slug)}`}
            className={cn(
              "rounded-full border border-border bg-card px-3 py-1.5 text-sm",
              active ? "bg-muted" : "hover:bg-muted/70",
            )}
          >
            {c.name}
          </Link>
        );
      })}
    </div>
  );
}


