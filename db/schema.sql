-- Hush Gentle Ecommerce (Supabase Postgres)
-- Schema: public
-- Notes:
-- - Enable RLS on all tables (see rls.sql)
-- - Auth is managed by Supabase (auth.users); we reference auth.uid() in policies

create extension if not exists pgcrypto;

-- -----------------------------
-- Users / Profiles
-- -----------------------------
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------
-- Catalog
-- -----------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  short_benefit text,
  description text,
  ingredients text,
  how_to_use text,
  why_gentle text,
  price_inr integer not null check (price_inr >= 0),
  is_active boolean not null default true,
  is_featured boolean not null default false,
  attributes jsonb not null default '{}'::jsonb, -- organic, cruelty_free, etc.
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  path text not null,
  alt text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_is_active on public.products(is_active);
create index if not exists idx_products_is_featured on public.products(is_featured);
create index if not exists idx_product_images_product_id on public.product_images(product_id);

alter table public.product_images
  add constraint if not exists uq_product_images_product_path unique (product_id, path);

-- -----------------------------
-- Cart / Wishlist
-- -----------------------------
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active','converted','abandoned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, status) deferrable initially immediate
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(cart_id, product_id)
);

create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id)
);

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique(wishlist_id, product_id)
);

create index if not exists idx_carts_user_id on public.carts(user_id);
create index if not exists idx_cart_items_cart_id on public.cart_items(cart_id);
create index if not exists idx_wishlist_items_wishlist_id on public.wishlist_items(wishlist_id);

-- -----------------------------
-- Orders / Payments
-- -----------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  status text not null default 'created'
    check (status in ('created','paid','fulfilled','cancelled','refunded')),
  currency text not null default 'INR',
  subtotal_inr integer not null check (subtotal_inr >= 0),
  shipping_inr integer not null default 0 check (shipping_inr >= 0),
  total_inr integer not null check (total_inr >= 0),
  shipping_address jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  price_inr integer not null check (price_inr >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete restrict,
  provider text not null default 'stub',
  status text not null default 'created'
    check (status in ('created','requires_action','succeeded','failed','refunded')),
  amount_inr integer not null check (amount_inr >= 0),
  provider_reference text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_payments_order_id on public.payments(order_id);
create index if not exists idx_payments_user_id on public.payments(user_id);

-- -----------------------------
-- Testimonials / Amazon Reviews
-- -----------------------------
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  rating integer not null check (rating between 1 and 5),
  content text not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.testimonials
  add constraint if not exists uq_testimonials_display_content unique (display_name, content);

create table if not exists public.amazon_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  title text,
  content text not null,
  reviewer_name text,
  reviewed_at date,
  is_verified boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.amazon_reviews
  add constraint if not exists uq_amazon_reviews_dedupe unique (product_id, content, reviewer_name, reviewed_at);

create index if not exists idx_amazon_reviews_product_id on public.amazon_reviews(product_id);

-- -----------------------------
-- Analytics
-- -----------------------------
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  user_id uuid references public.users(id) on delete set null,
  session_id text not null,
  path text not null,
  referrer text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_analytics_events_created_at on public.analytics_events(created_at);
create index if not exists idx_analytics_events_event_name_created_at on public.analytics_events(event_name, created_at);
create index if not exists idx_analytics_events_user_id on public.analytics_events(user_id);

-- -----------------------------
-- Chatbot logging
-- -----------------------------
create table if not exists public.chatbot_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  session_id text not null,
  started_at timestamptz not null default now()
);

create table if not exists public.chatbot_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chatbot_sessions(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_chatbot_sessions_user_id on public.chatbot_sessions(user_id);
create index if not exists idx_chatbot_messages_session_id on public.chatbot_messages(session_id);

-- -----------------------------
-- updated_at automation
-- -----------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_users_updated_at') then
    create trigger trg_users_updated_at before update on public.users
      for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_profiles_updated_at') then
    create trigger trg_profiles_updated_at before update on public.profiles
      for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_categories_updated_at') then
    create trigger trg_categories_updated_at before update on public.categories
      for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_products_updated_at') then
    create trigger trg_products_updated_at before update on public.products
      for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_carts_updated_at') then
    create trigger trg_carts_updated_at before update on public.carts
      for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_cart_items_updated_at') then
    create trigger trg_cart_items_updated_at before update on public.cart_items
      for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_orders_updated_at') then
    create trigger trg_orders_updated_at before update on public.orders
      for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_payments_updated_at') then
    create trigger trg_payments_updated_at before update on public.payments
      for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_testimonials_updated_at') then
    create trigger trg_testimonials_updated_at before update on public.testimonials
      for each row execute function public.set_updated_at();
  end if;
end $$;

-- -----------------------------
-- Auth sync (Supabase Auth -> public.users/profiles)
-- -----------------------------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;

  insert into public.profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_auth_user();
  end if;
end $$;


