## Hush Gentle — Architecture

### Goals
- **Low maintenance**: minimal services, no paid analytics, no cron.
- **Secure by default**: RLS on all tables, server-side authorization, no secrets on client.
- **Scalable without refactor**: clear module boundaries (auth, analytics, payments, chatbot).

### Runtime layout
- **Next.js App Router** with **Server Components first**.
- **Client components** only for small interactive widgets (tabs, charts, chatbot, analytics tracker).

### Trust boundaries
- **Client**: renders UI, triggers server actions, sends analytics/chat messages to API routes.
- **Server** (Next): performs all writes/privileged reads.
- **Database** (Supabase Postgres): enforces access via **RLS**.

### Supabase clients
- `lib/supabase/server.ts`: server client using **anon key + user session cookies** (RLS enforced).
- `lib/supabase/admin.ts`: server-only **service role** client for admin dashboards & internal ingestion.
- `lib/supabase/browser.ts`: browser client (used sparingly; most flows are server actions).

### Core flows
- **Catalog browsing**: Server Components query `products/categories/product_images`.
- **Cart/Wishlist**: Server actions write to user-owned tables (RLS).
- **Checkout**: Server action creates `orders/order_items`, then payments abstraction updates `payments`.
- **Admin**: `/admin/*` guarded by `ADMIN_EMAIL` server-side; uses service role for CRUD.
- **Analytics**: `/api/analytics` inserts server-side using service role (avoids public spam).
- **Chatbot**: `/api/chat` logs messages server-side and returns a provider-agnostic response.


