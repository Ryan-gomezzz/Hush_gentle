import * as React from "react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function ShopLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}


