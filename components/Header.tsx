import Image from "next/image";
import Link from "next/link";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button, ButtonLink } from "@/components/ui/Button";

export async function Header() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function signOut() {
    "use server";
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-[var(--spacing-pageX)] py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/brand/logo.png"
            alt="Hush Gentle"
            width={140}
            height={40}
            priority
          />
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="/products" className="text-muted-foreground hover:text-foreground">
            Shop
          </Link>
          <Link href="/#why" className="text-muted-foreground hover:text-foreground">
            Why Hush Gentle
          </Link>
          <Link href="/#trust" className="text-muted-foreground hover:text-foreground">
            Reviews
          </Link>
          <Link href="/cart" className="text-muted-foreground hover:text-foreground">
            Cart
          </Link>
          <Link href="/wishlist" className="text-muted-foreground hover:text-foreground">
            Wishlist
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <ButtonLink href="/admin" variant="ghost" className="hidden md:inline-flex">
                Admin
              </ButtonLink>
              <form action={signOut}>
                <Button type="submit" variant="secondary">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="secondary">
                Sign in
              </ButtonLink>
              <ButtonLink href="/signup" className="hidden sm:inline-flex">
                Create account
              </ButtonLink>
            </>
          )}

          <details className="relative md:hidden">
            <summary className="list-none rounded-xl border border-border bg-card px-3 py-2 text-sm">
              Menu
            </summary>
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-[0_20px_60px_rgba(0,0,0,0.10)]">
              <Link className="block rounded-xl px-3 py-2 text-sm hover:bg-muted" href="/products">
                Shop
              </Link>
              <Link className="block rounded-xl px-3 py-2 text-sm hover:bg-muted" href="/cart">
                Cart
              </Link>
              <Link className="block rounded-xl px-3 py-2 text-sm hover:bg-muted" href="/wishlist">
                Wishlist
              </Link>
              <Link className="block rounded-xl px-3 py-2 text-sm hover:bg-muted" href="/#why">
                Why Hush Gentle
              </Link>
              <Link className="block rounded-xl px-3 py-2 text-sm hover:bg-muted" href="/#trust">
                Reviews
              </Link>
              {user ? (
                <Link className="block rounded-xl px-3 py-2 text-sm hover:bg-muted" href="/admin">
                  Admin
                </Link>
              ) : null}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}


