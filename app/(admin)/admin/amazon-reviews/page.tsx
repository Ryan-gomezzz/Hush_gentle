import { revalidatePath } from "next/cache";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Table, Td, Th } from "@/components/ui/Table";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function AdminAmazonReviewsPage() {
  const supabase = createSupabaseAdminClient();
  const [{ data: products }, { data: reviews, error }] = await Promise.all([
    supabase.from("products").select("id,name").order("name"),
    supabase
      .from("amazon_reviews")
      .select("id,product_id,rating,title,content,reviewer_name,reviewed_at,is_verified,created_at, products(name)")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);
  if (error) throw error;

  async function createReview(formData: FormData) {
    "use server";
    const product_id = String(formData.get("product_id") ?? "");
    const rating = Number(formData.get("rating") ?? 5);
    const title = String(formData.get("title") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    const reviewer_name = String(formData.get("reviewer_name") ?? "").trim();
    const reviewed_at = String(formData.get("reviewed_at") ?? "").trim();
    const is_verified = String(formData.get("is_verified") ?? "") === "on";

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("amazon_reviews").insert({
      product_id: product_id || null,
      rating: Math.min(5, Math.max(1, rating)),
      title: title || null,
      content,
      reviewer_name: reviewer_name || null,
      reviewed_at: reviewed_at || null,
      is_verified,
    });
    if (error) throw error;
    revalidatePath("/admin/amazon-reviews");
    revalidatePath("/products");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <h2 className="text-base font-semibold">Add Amazon review (manual)</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            No scraping. Just paste short, helpful excerpts and mark as verified.
          </p>

          <form action={createReview} className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="product_id">
                Product
              </label>
              <select
                id="product_id"
                name="product_id"
                className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm"
              >
                <option value="">(Not linked)</option>
                {(products ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="rating">
                Rating (1–5)
              </label>
              <Input id="rating" name="rating" type="number" min={1} max={5} defaultValue={5} required />
            </div>
            <div className="space-y-2 md:col-span-3">
              <label className="text-sm font-medium" htmlFor="title">
                Title (optional)
              </label>
              <Input id="title" name="title" />
            </div>
            <div className="space-y-2 md:col-span-3">
              <label className="text-sm font-medium" htmlFor="content">
                Review text
              </label>
              <Textarea id="content" name="content" required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="reviewer_name">
                Reviewer name (optional)
              </label>
              <Input id="reviewer_name" name="reviewer_name" placeholder="Verified Amazon Customer" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="reviewed_at">
                Date (optional)
              </label>
              <Input id="reviewed_at" name="reviewed_at" type="date" />
            </div>
            <div className="md:col-span-3 flex items-center gap-2">
              <input
                id="is_verified"
                name="is_verified"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 accent-[hsl(var(--accent))]"
              />
              <label htmlFor="is_verified" className="text-sm text-muted-foreground">
                Verified Amazon Customer
              </label>
            </div>
            <div className="md:col-span-3">
              <Button type="submit">Add Amazon review</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Table>
        <thead>
          <tr>
            <Th>Product</Th>
            <Th>Rating</Th>
            <Th>Verified</Th>
            <Th>Title</Th>
            <Th>Text</Th>
          </tr>
        </thead>
        <tbody>
          {((reviews ?? []) as Array<{
            id: string;
            rating: number;
            title: string | null;
            content: string;
            is_verified: boolean;
            products: { name: string } | null;
          }>).map((r) => (
            <tr key={r.id}>
              <Td className="font-medium">{r.products?.name ?? "—"}</Td>
              <Td>{r.rating}★</Td>
              <Td className="text-muted-foreground">{r.is_verified ? "Yes" : "No"}</Td>
              <Td className="text-muted-foreground">{r.title ?? "—"}</Td>
              <Td className="text-muted-foreground">{r.content}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}


