import { Card, CardContent } from "@/components/ui/Card";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatINR } from "@/utils/format";

export default async function AdminHomePage() {
  const supabase = createSupabaseAdminClient();

  type OrderRow = { total_inr: number; status: string; created_at: string };
  type PaymentRow = { status: string; created_at: string };
  type ProductRow = { id: string; is_active: boolean };
  type EventRow = { event_name: string; created_at: string };

  const [{ data: orders }, { data: payments }, { data: products }, { data: events }] =
    await Promise.all([
      supabase.from("orders").select("total_inr,status,created_at").limit(1000),
      supabase.from("payments").select("status,created_at").limit(1000),
      supabase.from("products").select("id,is_active").limit(1000),
      supabase
        .from("analytics_events")
        .select("event_name,created_at")
        .limit(2000),
    ]);

  const paidStatuses = new Set(["paid", "fulfilled"]);
  const totalSales = ((orders ?? []) as OrderRow[])
    .filter((o) => paidStatuses.has(o.status))
    .reduce((sum, o) => sum + (o.total_inr ?? 0), 0);

  const totalProducts = ((products ?? []) as ProductRow[]).length;
  const activeProducts = ((products ?? []) as ProductRow[]).filter((p) => p.is_active).length;

  const paymentFailures = ((payments ?? []) as PaymentRow[]).filter((p) => p.status === "failed").length;

  const pageViews = ((events ?? []) as EventRow[]).filter((e) => e.event_name === "page_view").length;
  const checkoutCompleted = ((events ?? []) as EventRow[]).filter((e) => e.event_name === "checkout_completed").length;
  const conversionRate = pageViews > 0 ? Math.round((checkoutCompleted / pageViews) * 1000) / 10 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">Total sales</p>
          <p className="mt-2 text-2xl font-semibold">{formatINR(totalSales)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Paid + fulfilled orders (MVP calculation).
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">Conversion rate</p>
          <p className="mt-2 text-2xl font-semibold">{conversionRate}%</p>
          <p className="mt-1 text-xs text-muted-foreground">
            checkout_completed / page_view (requires analytics events).
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">Products</p>
          <p className="mt-2 text-2xl font-semibold">
            {activeProducts}/{totalProducts}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Active / total</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">Payment failures</p>
          <p className="mt-2 text-2xl font-semibold">{paymentFailures}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Logged from payment verification (stub for now).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


