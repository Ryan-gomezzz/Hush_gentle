import { revalidatePath } from "next/cache";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Table, Td, Th } from "@/components/ui/Table";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function AdminTestimonialsPage() {
  const supabase = createSupabaseAdminClient();
  const { data: testimonials, error } = await supabase
    .from("testimonials")
    .select("id,display_name,rating,content,is_published,created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;

  async function createTestimonial(formData: FormData) {
    "use server";
    const display_name = String(formData.get("display_name") ?? "").trim();
    const rating = Number(formData.get("rating") ?? 5);
    const content = String(formData.get("content") ?? "").trim();

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("testimonials").insert({
      display_name,
      rating: Math.min(5, Math.max(1, rating)),
      content,
      is_published: true,
    });
    if (error) throw error;
    revalidatePath("/admin/testimonials");
    revalidatePath("/");
  }

  async function togglePublish(formData: FormData) {
    "use server";
    const id = String(formData.get("id") ?? "");
    const is_published = String(formData.get("is_published") ?? "") === "on";
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("testimonials")
      .update({ is_published })
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/testimonials");
    revalidatePath("/");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <h2 className="text-base font-semibold">Add a testimonial</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep it short, calm, and specific.
          </p>

          <form action={createTestimonial} className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="display_name">
                Name
              </label>
              <Input id="display_name" name="display_name" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="rating">
                Rating (1–5)
              </label>
              <Input id="rating" name="rating" type="number" min={1} max={5} defaultValue={5} required />
            </div>
            <div className="space-y-2 md:col-span-3">
              <label className="text-sm font-medium" htmlFor="content">
                Review text
              </label>
              <Textarea id="content" name="content" required />
            </div>
            <div className="md:col-span-3">
              <Button type="submit">Add testimonial</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Rating</Th>
            <Th>Published</Th>
            <Th>Text</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {(testimonials ?? []).map((t) => (
            <tr key={t.id}>
              <Td className="font-medium">{t.display_name}</Td>
              <Td>{t.rating}★</Td>
              <Td>
                <form id={`t-${t.id}`} action={togglePublish}>
                  <input type="hidden" name="id" value={t.id} />
                </form>
                <input
                  form={`t-${t.id}`}
                  name="is_published"
                  type="checkbox"
                  defaultChecked={t.is_published}
                  className="h-4 w-4 accent-[hsl(var(--accent))]"
                />
              </Td>
              <Td className="text-muted-foreground">{t.content}</Td>
              <Td>
                <Button form={`t-${t.id}`} type="submit" variant="secondary" size="sm">
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


