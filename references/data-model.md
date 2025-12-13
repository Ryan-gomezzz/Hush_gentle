## Data model rationale

### Core principles
- **RLS on everything**: user-owned tables are readable/writable only by the owner.
- **Public read**: catalog + testimonials + Amazon reviews are publicly readable.
- **Audit columns**: `created_at`, `updated_at` for operational visibility.
- **Indexes**: every relation/fk is indexed; common filters indexed (`products.slug`, analytics by date).

### Tables (what & why)
- **`users`**: links `auth.users(id)` to app data; provides stable FK targets from other tables.
- **`profiles`**: optional public profile fields (name/phone).
- **`categories`**: catalog categories for filtering.
- **`products`**: main catalog entity with content fields required for PDP sections.
- **`product_images`**: multiple images per product, ordered.
- **`carts` / `cart_items`**: active carts for signed-in users.
- **`wishlists` / `wishlist_items`**: saved items per user.
- **`orders` / `order_items`**: immutable snapshot of purchased items and prices.
- **`payments`**: gateway-agnostic payment status + provider references.
- **`testimonials`**: internal reviews (publish toggle).
- **`amazon_reviews`**: manually imported Amazon reviews linked to products.
- **`analytics_events`**: internal event stream powering admin dashboards.
- **`chatbot_sessions` / `chatbot_messages`**: conversation logging (admin view).

### Why key indexes exist
- `products.slug`: fast PDP lookup.
- FK indexes (`*_id`): efficient joins and user-scoped queries.
- `analytics_events(created_at)` and `(event_name, created_at)`: fast “last 7/30 days” charts.

### Notes
- `db/schema.sql` includes triggers to keep `updated_at` current.
- A trigger on `auth.users` creates/updates `public.users` and a blank `profiles` row.


