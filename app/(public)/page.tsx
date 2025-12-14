import { ButtonLink } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ProductCard } from "@/components/ProductCard";
import { getFeaturedProducts, getPublishedTestimonials } from "@/lib/storefront";

export default async function HomePage() {
  const [featured, testimonials] = await Promise.all([
    getFeaturedProducts(4),
    getPublishedTestimonials(),
  ]);

  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-[var(--spacing-pageX)] py-[var(--spacing-sectionY)]">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm text-muted-foreground">Organic • Cruelty-free • No harsh chemicals</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
              Gentle, honest care for everyday skin rituals.
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
              Thoughtfully made with organic butters, cold-pressed oils, and essential oils—so your skin feels
              calm, comfortable, and cared for.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="/products" className="w-full sm:w-auto">
                Shop products
              </ButtonLink>
              <ButtonLink href="#why" variant="secondary" className="w-full sm:w-auto">
                Why it’s gentle
              </ButtonLink>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-muted">
            <div className="relative aspect-[16/10] w-full">
              <video
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="/images/brand/Banner_product.png"
              >
                <source src="/videos/hero.webm" type="video/webm" />
                <source src="/videos/hero.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-[var(--spacing-pageX)] pb-[var(--spacing-sectionY)]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Featured</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Simple, gentle essentials customers come back to.
            </p>
          </div>
          <ButtonLink href="/products" variant="ghost" className="hidden sm:inline-flex">
            View all
          </ButtonLink>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section id="why" className="bg-muted/60">
        <div className="mx-auto w-full max-w-6xl px-[var(--spacing-pageX)] py-[var(--spacing-sectionY)]">
          <h2 className="text-2xl font-semibold">Why Hush Gentle?</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            We keep it calm and honest—ingredients you can understand, textures that feel comforting, and formulas
            designed for everyday use.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Organic ingredients",
                desc: "Cold-pressed oils, organic butters, and vitamin E—chosen for comfort.",
              },
              {
                title: "No harsh chemicals",
                desc: "No aggressive additives. Just a gentle, skin-first approach.",
              },
              {
                title: "Cruelty-free",
                desc: "Not tested on animals—care that feels right.",
              },
            ].map((x) => (
              <Card key={x.title}>
                <CardContent>
                  <h3 className="text-sm font-semibold">{x.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{x.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="trust" className="mx-auto w-full max-w-6xl px-[var(--spacing-pageX)] py-[var(--spacing-sectionY)]">
        <h2 className="text-2xl font-semibold">Trusted, with real feedback</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          We showcase internal testimonials and Amazon-sourced feedback (manually added) to help you choose with
          confidence.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.id}>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{t.display_name}</p>
                  <p className="text-xs text-muted-foreground">{`${t.rating}★`}</p>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{t.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}


