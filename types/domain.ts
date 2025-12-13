export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_benefit: string | null;
  description: string | null;
  ingredients: string | null;
  how_to_use: string | null;
  why_gentle: string | null;
  price_inr: number;
  is_active: boolean;
  is_featured: boolean;
  attributes: Record<string, unknown>;
};

export type ProductImage = {
  id: string;
  product_id: string;
  path: string;
  alt: string | null;
  sort_order: number;
};

export type Testimonial = {
  id: string;
  display_name: string;
  rating: number;
  content: string;
};

export type AmazonReview = {
  id: string;
  product_id: string | null;
  rating: number;
  title: string | null;
  content: string;
  reviewer_name: string | null;
  reviewed_at: string | null;
  is_verified: boolean;
};

export type CartItemJoined = {
  id: string;
  quantity: number;
  product: Pick<Product, "id" | "name" | "slug" | "price_inr" | "short_benefit"> & {
    product_images: Array<Pick<ProductImage, "path" | "alt" | "sort_order">>;
  };
};


