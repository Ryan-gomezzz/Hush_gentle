import { revalidatePath } from "next/cache";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Table, Td, Th } from "@/components/ui/Table";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatINR } from "@/utils/format";

const statuses = ["created", "paid", "fulfilled", "cancelled", "refunded"] as const;

export default async function AdminOrdersPage() {
  const supabase = createSupabaseAdminClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id,user_id,status,total_inr,created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;

  async function updateOrderStatus(formData: FormData) {
    "use server";
    const id = String(formData.get("id") ?? "");
    const status = String(formData.get("status") ?? "created");
    if (!statuses.includes(status as (typeof statuses)[number])) return;

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/orders");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <h2 className="text-base font-semibold">Orders</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Update order statuses as you process shipments.
          </p>
        </CardContent>
      </Card>

      <Table>
        <thead>
          <tr>
            <Th>Order ID</Th>
            <Th>User</Th>
            <Th>Total</Th>
            <Th>Status</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {(orders ?? []).map((o) => (
            <tr key={o.id}>
              <Td className="font-medium">{o.id}</Td>
              <Td className="text-muted-foreground">{o.user_id}</Td>
              <Td>{formatINR(o.total_inr)}</Td>
              <Td>
                <form id={`order-${o.id}`} action={updateOrderStatus}>
                  <input type="hidden" name="id" value={o.id} />
                </form>
                <select
                  form={`order-${o.id}`}
                  name="status"
                  defaultValue={o.status}
                  className="h-9 rounded-xl border border-border bg-card px-3 text-sm"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Td>
              <Td>
                <Button form={`order-${o.id}`} type="submit" variant="secondary" size="sm">
                  Save
                </Button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}


