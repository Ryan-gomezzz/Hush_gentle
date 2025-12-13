"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/utils/cn";

const items = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/amazon-reviews", label: "Amazon reviews" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/chat", label: "Chat logs" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {items.map((it) => {
        const active = pathname === it.href;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "rounded-full border border-border bg-card px-3 py-1.5 text-sm",
              active ? "bg-muted" : "hover:bg-muted/70",
            )}
          >
            {it.label}
          </Link>
        );
      })}
    </div>
  );
}


