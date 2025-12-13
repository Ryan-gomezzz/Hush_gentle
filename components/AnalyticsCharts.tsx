"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type DailyMetricPoint = {
  day: string; // YYYY-MM-DD
  page_views: number;
  add_to_cart: number;
  checkout_started: number;
  checkout_completed: number;
  payment_success: number;
  payment_failure: number;
};

export function AnalyticsCharts({ data }: { data: DailyMetricPoint[] }) {
  return (
    <div className="space-y-6">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tickMargin={8} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="page_views" stroke="hsl(var(--foreground))" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="add_to_cart" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tickMargin={8} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="checkout_started" stroke="hsl(var(--warn))" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="checkout_completed" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


