import * as React from "react";

import { AdminNav } from "@/components/AdminNav";
import { requireAdminOrRedirect } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdminOrRedirect();

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-[var(--spacing-pageX)] py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Simple tools to run Hush Gentle day to day.
          </p>
        </div>
        <AdminNav />
        {children}
      </div>
    </div>
  );
}


