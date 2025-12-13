import { cookies, headers } from "next/headers";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { analyticsEventNameSchema, analyticsIngestSchema } from "@/lib/validators";

export type AnalyticsEventName = ReturnType<typeof analyticsEventNameSchema.parse>;

const SESSION_COOKIE = "hg_sid";

export async function getOrCreateSessionId() {
  const store = await cookies();
  const existing = store.get(SESSION_COOKIE)?.value;
  if (existing) return existing;
  const sid = crypto.randomUUID();
  store.set(SESSION_COOKIE, sid, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return sid;
}

async function ensurePublicUser(userId: string, email?: string | null) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("users").upsert({ id: userId, email: email ?? null });
  await supabase.from("profiles").upsert({ user_id: userId });
}

export async function trackEventServer(input: {
  event_name: AnalyticsEventName;
  path: string;
  referrer?: string | null;
  meta?: Record<string, unknown> | null;
}) {
  const parsed = analyticsIngestSchema.safeParse(input);
  if (!parsed.success) return;

  const sid = await getOrCreateSessionId();
  const supabaseAuth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (user) {
    await ensurePublicUser(user.id, user.email);
  }

  const h = await headers();
  const ref = parsed.data.referrer ?? h.get("referer") ?? null;

  const admin = createSupabaseAdminClient();
  await admin.from("analytics_events").insert({
    event_name: parsed.data.event_name,
    user_id: user?.id ?? null,
    session_id: sid,
    path: parsed.data.path,
    referrer: ref,
    meta: parsed.data.meta ?? {},
  });
}


