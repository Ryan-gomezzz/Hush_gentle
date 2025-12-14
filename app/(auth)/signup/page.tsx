import { redirect } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SignupPage({
  searchParams,
}: {
  // Next.js 16: `searchParams` is a Promise in Server Components
  searchParams: Promise<{ error?: string; email?: string }>;
}) {
  const sp = await searchParams;
  const errorMessage = sp.error ? decodeURIComponent(sp.error) : null;
  const emailPrefill = sp.email ? decodeURIComponent(sp.email) : "";

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  async function signup(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const supabase = await createSupabaseServerClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const emailRedirectTo = siteUrl ? `${siteUrl}/callback` : undefined;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
      },
    });

    if (error) {
      redirect(`/signup?email=${encodeURIComponent(email)}&error=${encodeURIComponent(error.message)}`);
    }

    // If email confirmation is enabled in Supabase, `session` will be null here.
    if (data.session) redirect("/");
    redirect(`/signup/success?email=${encodeURIComponent(email)}`);
  }

  return (
    <div className="mx-auto w-full max-w-md px-[var(--spacing-pageX)] py-12">
      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            A calm space for your everyday care.
          </p>
        </CardHeader>
        <CardContent>
          <form action={signup} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                defaultValue={emailPrefill}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
              />
            </div>
            {errorMessage ? (
              <p className="text-sm text-danger">{errorMessage}</p>
            ) : null}
            <Button type="submit" className="w-full">
              Create account
            </Button>
          </form>
          <div className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a className="text-foreground underline underline-offset-4" href="/login">
              Sign in
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


