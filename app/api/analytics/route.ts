import { NextResponse } from "next/server";

import { analyticsIngestSchema } from "@/lib/validators";
import { trackEventServer } from "@/lib/analytics";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = analyticsIngestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await trackEventServer(parsed.data);

  return NextResponse.json({ ok: true });
}


