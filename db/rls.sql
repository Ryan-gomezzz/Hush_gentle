-- RLS policies for Hush Gentle Ecommerce

-- Helpers
create or replace function public.is_authenticated()
returns boolean
language sql
stable
as $$
  select auth.uid() is not null;
$$;

-- Enable RLS on all public tables
alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.testimonials enable row level security;
alter table public.amazon_reviews enable row level security;
alter table public.analytics_events enable row level security;
alter table public.chatbot_sessions enable row level security;
alter table public.chatbot_messages enable row level security;

-- -----------------------------------
-- Public read content
-- -----------------------------------
create policy "categories_select_public"
on public.categories for select
using (true);

create policy "products_select_public"
on public.products for select
using (is_active = true);

create policy "product_images_select_public"
on public.product_images for select
using (true);

create policy "testimonials_select_public"
on public.testimonials for select
using (is_published = true);

create policy "amazon_reviews_select_public"
on public.amazon_reviews for select
using (true);

-- -----------------------------------
-- Users/profiles: user-owned
-- -----------------------------------
create policy "users_select_own"
on public.users for select
using (id = auth.uid());

create policy "users_insert_self"
on public.users for insert
with check (id = auth.uid());

create policy "users_update_self"
on public.users for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "profiles_select_own"
on public.profiles for select
using (user_id = auth.uid());

create policy "profiles_insert_own"
on public.profiles for insert
with check (user_id = auth.uid());

create policy "profiles_update_own"
on public.profiles for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- -----------------------------------
-- Carts/items: user-owned
-- -----------------------------------
create policy "carts_select_own"
on public.carts for select
using (user_id = auth.uid());

create policy "carts_insert_own"
on public.carts for insert
with check (user_id = auth.uid());

create policy "carts_update_own"
on public.carts for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "cart_items_select_own"
on public.cart_items for select
using (exists (
  select 1 from public.carts c
  where c.id = cart_items.cart_id and c.user_id = auth.uid()
));

create policy "cart_items_insert_own"
on public.cart_items for insert
with check (exists (
  select 1 from public.carts c
  where c.id = cart_items.cart_id and c.user_id = auth.uid()
));

create policy "cart_items_update_own"
on public.cart_items for update
using (exists (
  select 1 from public.carts c
  where c.id = cart_items.cart_id and c.user_id = auth.uid()
))
with check (exists (
  select 1 from public.carts c
  where c.id = cart_items.cart_id and c.user_id = auth.uid()
));

create policy "cart_items_delete_own"
on public.cart_items for delete
using (exists (
  select 1 from public.carts c
  where c.id = cart_items.cart_id and c.user_id = auth.uid()
));

-- -----------------------------------
-- Wishlist/items: user-owned
-- -----------------------------------
create policy "wishlists_select_own"
on public.wishlists for select
using (user_id = auth.uid());

create policy "wishlists_insert_own"
on public.wishlists for insert
with check (user_id = auth.uid());

create policy "wishlist_items_select_own"
on public.wishlist_items for select
using (exists (
  select 1 from public.wishlists w
  where w.id = wishlist_items.wishlist_id and w.user_id = auth.uid()
));

create policy "wishlist_items_insert_own"
on public.wishlist_items for insert
with check (exists (
  select 1 from public.wishlists w
  where w.id = wishlist_items.wishlist_id and w.user_id = auth.uid()
));

create policy "wishlist_items_delete_own"
on public.wishlist_items for delete
using (exists (
  select 1 from public.wishlists w
  where w.id = wishlist_items.wishlist_id and w.user_id = auth.uid()
));

-- -----------------------------------
-- Orders/order_items/payments: user-owned
-- -----------------------------------
create policy "orders_select_own"
on public.orders for select
using (user_id = auth.uid());

create policy "orders_insert_own"
on public.orders for insert
with check (user_id = auth.uid());

create policy "orders_update_own"
on public.orders for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "order_items_select_own"
on public.order_items for select
using (exists (
  select 1 from public.orders o
  where o.id = order_items.order_id and o.user_id = auth.uid()
));

create policy "order_items_insert_own"
on public.order_items for insert
with check (exists (
  select 1 from public.orders o
  where o.id = order_items.order_id and o.user_id = auth.uid()
));

create policy "payments_select_own"
on public.payments for select
using (user_id = auth.uid());

create policy "payments_insert_own"
on public.payments for insert
with check (user_id = auth.uid());

create policy "payments_update_own"
on public.payments for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Note:
-- - `analytics_events` and chatbot tables are written via server-side API using service role.
-- - No direct client access policies are created to reduce abuse risk.


