import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getUserOrRedirect(redirectTo = "/login") {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(redirectTo);
  return user;
}

export async function requireAdminOrRedirect() {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    throw new Error("Missing ADMIN_EMAIL env var");
  }
  const user = await getUserOrRedirect("/login");
  const email = user.email ?? "";
  if (email.toLowerCase() !== adminEmail.toLowerCase()) {
    redirect("/");
  }
  return user;
}


