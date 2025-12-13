import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AmazonReview, Category, Product, ProductImage, Testimonial } from "@/types/domain";

export async function getCategories(): Promise<Category[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,description")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getFeaturedProducts(limit = 4) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(path,alt,sort_order)")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Array<Product & { product_images: ProductImage[] }>;
}

export async function getProducts(params: { categorySlug?: string | null } = {}) {
  const supabase = createSupabaseServerClient();

  if (params.categorySlug) {
    const { data: cat, error: catErr } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.categorySlug)
      .maybeSingle();
    if (catErr) throw catErr;

    const categoryId = cat?.id ?? null;
    const q = supabase
      .from("products")
      .select("*, product_images(path,alt,sort_order), categories(name,slug)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    const { data, error } = categoryId ? await q.eq("category_id", categoryId) : await q;
    if (error) throw error;
    return data ?? [];
  }

  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(path,alt,sort_order), categories(name,slug)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getProductBySlug(slug: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(path,alt,sort_order), categories(name,slug)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data as (Product & { product_images: ProductImage[] }) | null;
}

export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("id,display_name,rating,content")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(6);
  if (error) throw error;
  return data ?? [];
}

export async function getAmazonReviewsForProduct(productId: string): Promise<AmazonReview[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("amazon_reviews")
    .select("id,product_id,rating,title,content,reviewer_name,reviewed_at,is_verified")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(8);
  if (error) throw error;
  return data ?? [];
}


