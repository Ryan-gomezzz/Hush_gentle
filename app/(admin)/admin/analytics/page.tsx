import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { Card, CardContent } from "@/components/ui/Card";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function toDayKey(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default async function AdminAnalyticsPage() {
  const supabase = createSupabaseAdminClient();
  const since = new Date();
  since.setDate(since.getDate() - 29);

  const { data: events, error } = await supabase
    .from("analytics_events")
    .select("event_name,created_at")
    .gte("created_at", since.toISOString())
    .limit(5000);
  if (error) throw error;

  const days: Record<
    string,
    {
      day: string;
      page_views: number;
      add_to_cart: number;
      checkout_started: number;
      checkout_completed: number;
      payment_success: number;
      payment_failure: number;
    }
  > = {};

  for (let i = 0; i < 30; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = toDayKey(d);
    days[key] = {
      day: key,
      page_views: 0,
      add_to_cart: 0,
      checkout_started: 0,
      checkout_completed: 0,
      payment_success: 0,
      payment_failure: 0,
    };
  }

  for (const e of events ?? []) {
    const key = toDayKey(new Date(e.created_at));
    const bucket = days[key];
    if (!bucket) continue;
    switch (e.event_name) {
      case "page_view":
        bucket.page_views++;
        break;
      case "add_to_cart":
        bucket.add_to_cart++;
        break;
      case "checkout_started":
        bucket.checkout_started++;
        break;
      case "checkout_completed":
        bucket.checkout_completed++;
        break;
      case "payment_success":
        bucket.payment_success++;
        break;
      case "payment_failure":
        bucket.payment_failure++;
        break;
      default:
        break;
    }
  }

  const data = Object.values(days).sort((a, b) => a.day.localeCompare(b.day));

  const totals = data.reduce(
    (acc, cur) => {
      acc.page_views += cur.page_views;
      acc.add_to_cart += cur.add_to_cart;
      acc.checkout_started += cur.checkout_started;
      acc.checkout_completed += cur.checkout_completed;
      acc.payment_success += cur.payment_success;
      acc.payment_failure += cur.payment_failure;
      return acc;
    },
    {
      page_views: 0,
      add_to_cart: 0,
      checkout_started: 0,
      checkout_completed: 0,
      payment_success: 0,
      payment_failure: 0,
    },
  );

  const conversion = totals.page_views
    ? Math.round((totals.checkout_completed / totals.page_views) * 1000) / 10
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <h2 className="text-base font-semibold">Analytics (last 30 days)</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Internal event tracking (privacy-respecting, no paid tools).
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Page views</p>
              <p className="mt-1 text-xl font-semibold">{totals.page_views}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Checkout completed</p>
              <p className="mt-1 text-xl font-semibold">{totals.checkout_completed}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Conversion rate</p>
              <p className="mt-1 text-xl font-semibold">{conversion}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3 className="text-base font-semibold">Trends</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Page views, add-to-cart, and checkout funnel.
          </p>
          <div className="mt-6">
            <AnalyticsCharts data={data} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


