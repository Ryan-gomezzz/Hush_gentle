import { revalidatePath } from "next/cache";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Table, Td, Th } from "@/components/ui/Table";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/utils/slug";

export default async function AdminCategoriesPage() {
  const supabase = createSupabaseAdminClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id,name,slug,description")
    .order("name");
  if (error) throw error;

  async function createCategory(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    const slug = slugify(name);
    const description = String(formData.get("description") ?? "").trim();

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("categories").insert({
      name,
      slug,
      description: description || null,
    });
    if (error) throw error;
    revalidatePath("/admin/categories");
  }

  async function updateCategory(formData: FormData) {
    "use server";
    const id = String(formData.get("id") ?? "");
    const description = String(formData.get("description") ?? "").trim();

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("categories")
      .update({ description: description || null })
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/categories");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <h2 className="text-base font-semibold">Add a category</h2>
          <form action={createCategory} className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">
                Name
              </label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="description">
                Description
              </label>
              <Textarea id="description" name="description" placeholder="Optional short description." />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Create category</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-base font-semibold">Categories</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Categories help customers browse calmly.
        </p>
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Slug</Th>
            <Th>Description</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {(categories ?? []).map((c) => (
            <tr key={c.id}>
              <Td className="font-medium">{c.name}</Td>
              <Td className="text-muted-foreground">{c.slug}</Td>
              <Td>
                <form id={`cat-${c.id}`} action={updateCategory}>
                  <input type="hidden" name="id" value={c.id} />
                </form>
                <input
                  form={`cat-${c.id}`}
                  name="description"
                  defaultValue={c.description ?? ""}
                  className="h-9 w-full min-w-[18rem] rounded-xl border border-border bg-card px-3 text-sm"
                  placeholder="Description"
                />
              </Td>
              <Td>
                <Button form={`cat-${c.id}`} type="submit" variant="secondary" size="sm">
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


