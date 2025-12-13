import { revalidatePath } from "next/cache";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Table, Td, Th } from "@/components/ui/Table";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/utils/slug";

export default async function AdminProductsPage() {
  const supabase = createSupabaseAdminClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("id,name,slug,price_inr,is_active,is_featured,short_benefit")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;

  async function createProduct(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    const price_inr = Number(formData.get("price_inr") ?? 0);
    const short_benefit = String(formData.get("short_benefit") ?? "").trim();
    const slug = slugify(name);

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("products").insert({
      name,
      slug,
      price_inr: Math.max(0, price_inr),
      short_benefit: short_benefit || null,
      is_active: true,
    });
    if (error) throw error;
    revalidatePath("/admin/products");
  }

  async function updateProduct(formData: FormData) {
    "use server";
    const id = String(formData.get("id") ?? "");
    const price_inr = Number(formData.get("price_inr") ?? 0);
    const short_benefit = String(formData.get("short_benefit") ?? "").trim();
    const is_active = String(formData.get("is_active") ?? "") === "on";
    const is_featured = String(formData.get("is_featured") ?? "") === "on";

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("products")
      .update({
        price_inr: Math.max(0, price_inr),
        short_benefit: short_benefit || null,
        is_active,
        is_featured,
      })
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/products");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <h2 className="text-base font-semibold">Add a product</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep descriptions calm and honest. Images can be added later.
          </p>

          <form action={createProduct} className="mt-5 grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium" htmlFor="name">
                Name
              </label>
              <Input id="name" name="name" required className="mt-2" />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="price_inr">
                Price (INR)
              </label>
              <Input id="price_inr" name="price_inr" type="number" min={0} required className="mt-2" />
            </div>
            <div className="md:col-span-4">
              <label className="text-sm font-medium" htmlFor="short_benefit">
                Short benefit
              </label>
              <Textarea id="short_benefit" name="short_benefit" className="mt-2" placeholder="One calm line about what it helps with." />
            </div>
            <div className="md:col-span-4">
              <Button type="submit">Create product</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-base font-semibold">Products</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Toggle “Active” to hide/show, and “Featured” for the homepage.
        </p>
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Slug</Th>
            <Th>Price</Th>
            <Th>Active</Th>
            <Th>Featured</Th>
            <Th>Short benefit</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {(products ?? []).map((p) => (
            <tr key={p.id}>
              <Td className="font-medium">{p.name}</Td>
              <Td className="text-muted-foreground">{p.slug}</Td>
              <Td>
                <form id={`product-${p.id}`} action={updateProduct}>
                  <input type="hidden" name="id" value={p.id} />
                </form>
                <input
                  form={`product-${p.id}`}
                  name="price_inr"
                  type="number"
                  min={0}
                  defaultValue={p.price_inr}
                  className="h-9 w-24 rounded-xl border border-border bg-card px-3 text-sm"
                />
              </Td>
              <Td>
                <input
                  form={`product-${p.id}`}
                  name="is_active"
                  type="checkbox"
                  defaultChecked={p.is_active}
                  className="h-4 w-4 accent-[hsl(var(--accent))]"
                />
              </Td>
              <Td>
                <input
                  form={`product-${p.id}`}
                  name="is_featured"
                  type="checkbox"
                  defaultChecked={p.is_featured}
                  className="h-4 w-4 accent-[hsl(var(--accent))]"
                />
              </Td>
              <Td>
                <input
                  form={`product-${p.id}`}
                  name="short_benefit"
                  defaultValue={p.short_benefit ?? ""}
                  className="h-9 w-full min-w-[18rem] rounded-xl border border-border bg-card px-3 text-sm"
                  placeholder="Short benefit"
                />
              </Td>
              <Td>
                <Button form={`product-${p.id}`} type="submit" variant="secondary" size="sm">
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


