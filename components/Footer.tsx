export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-[var(--spacing-pageX)] py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold">Hush Gentle</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Organic, gentle, skin-safe cosmetics with honest ingredients and calm
              rituals.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Customer care</h3>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li>Shipping & returns (MVP)</li>
              <li>Contact (MVP)</li>
              <li>FAQ (MVP)</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Trust</h3>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li>Organic ingredients</li>
              <li>Not tested on animals</li>
              <li>No harsh chemicals</li>
            </ul>
          </div>
        </div>
        <p className="mt-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Hush Gentle. All rights reserved.
        </p>
      </div>
    </footer>
  );
}


