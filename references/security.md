## Security model (threats & mitigations)

### Threats we care about
- Unauthenticated users reading/writing private data.
- Authenticated users accessing other users’ carts/orders.
- Admin pages exposed publicly.
- Secrets leaked to the browser bundle.
- Abuse/spam of analytics and chatbot logging.

### Mitigations implemented
- **RLS enabled on all tables** (`db/rls.sql`).
- **User-owned policies**: carts, wishlist, orders, payments are scoped to `auth.uid()`.
- **Admin access**: `/admin/*` requires server-side check against `ADMIN_EMAIL` (no client-side gating).
- **Service role isolation**: `SUPABASE_SERVICE_ROLE_KEY` is only used server-side in `lib/supabase/admin.ts`.
- **Analytics ingestion**: event insert happens server-side via `/api/analytics` using service role.
- **Chat logging**: chatbot sessions/messages written via `/api/chat` using service role.
- **Validation**: request payloads validated via Zod (`lib/validators.ts`).

### Operational guidance
- Rotate keys if exposed.
- Keep `ADMIN_EMAIL` tightly controlled.
- In production, consider adding stronger rate limiting for `/api/analytics` and `/api/chat` (edge/cdn level).


