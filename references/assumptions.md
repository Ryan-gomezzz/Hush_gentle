## Assumptions (explicit)

### Business / product
- Currency is **INR (₹)**.
- Shipping/taxes are shown as “calculated at checkout” for MVP.
- Checkout requires login (no guest checkout in MVP).
- Amazon reviews are **manual import** only (no scraping).

### Technical
- Deployed on **Netlify** with environment variables set.
- Supabase Auth is configured for email/password sign-in.
- Admin access is controlled via `ADMIN_EMAIL` environment variable.

### UX
- Calm, minimal aesthetic; no heavy animation; mobile-first.
- Chatbot provides guidance without medical claims; includes a gentle disclaimer.


