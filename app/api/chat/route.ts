import { NextResponse } from "next/server";
import { z } from "zod";

import { getChatbotProvider } from "@/lib/chatbot";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  message: z.string().min(1).max(2000),
  context: z
    .object({
      path: z.string().optional(),
      productSlug: z.string().optional(),
    })
    .optional(),
});

const CHAT_COOKIE = "hg_chat_sid";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabaseAuth = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  const admin = createSupabaseAdminClient();

  const cookiesIn = req.headers.get("cookie") ?? "";
  const existing = cookiesIn
    .split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith(`${CHAT_COOKIE}=`))
    ?.split("=")[1];
  const sessionId = existing || crypto.randomUUID();

  // Find or create chatbot session
  const { data: existingSession } = await admin
    .from("chatbot_sessions")
    .select("id")
    .eq("session_id", sessionId)
    .maybeSingle();

  const sessionRow =
    existingSession ??
    (
      await admin
        .from("chatbot_sessions")
        .insert({
          session_id: sessionId,
          user_id: user?.id ?? null,
        })
        .select("id")
        .single()
    ).data;

  // Log user message
  await admin.from("chatbot_messages").insert({
    session_id: sessionRow.id,
    role: "user",
    content: parsed.data.message,
    meta: { context: parsed.data.context ?? {} },
  });

  // Lightweight context: top products (for gentle suggestions)
  const { data: products } = await admin
    .from("products")
    .select("name,slug,short_benefit")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .limit(8);

  const provider = getChatbotProvider();
  const reply = await provider.reply({
    message: parsed.data.message,
    products: products ?? [],
  });

  // Log assistant message
  await admin.from("chatbot_messages").insert({
    session_id: sessionRow.id,
    role: "assistant",
    content: reply,
    meta: { provider: provider.providerName },
  });

  const res = NextResponse.json({ reply });
  if (!existing) {
    res.cookies.set(CHAT_COOKIE, sessionId, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return res;
}


