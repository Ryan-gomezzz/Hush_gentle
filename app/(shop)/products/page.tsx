import { Filters } from "@/components/Filters";
import { ProductCard } from "@/components/ProductCard";
import { getCategories, getProducts } from "@/lib/storefront";

export default async function ProductsPage({
  searchParams,
}: {
  // Next.js 16: `searchParams` is a Promise in Server Components
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  const category = sp.category ?? null;

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug: category }),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-[var(--spacing-pageX)] py-10">
      <div>
        <h1 className="text-2xl font-semibold">Shop</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Calm, honest essentials—made for daily use.
        </p>
      </div>

      <div className="mt-6">
        <Filters categories={categories} activeCategorySlug={category} />
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}


