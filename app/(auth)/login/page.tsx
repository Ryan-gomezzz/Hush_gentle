import { redirect } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  // Next.js 16: `searchParams` is a Promise in Server Components
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const sp = await searchParams;
  const errorMessage = sp.error ? decodeURIComponent(sp.error) : null;
  const infoMessage = sp.message ? decodeURIComponent(sp.message) : null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  async function login(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }
    redirect("/");
  }

  return (
    <div className="mx-auto w-full max-w-md px-[var(--spacing-pageX)] py-12">
      <Card>
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to continue your gentle routine.
          </p>
        </CardHeader>
        <CardContent>
          <form action={login} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
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
                autoComplete="current-password"
              />
            </div>
            {infoMessage ? (
              <p className="text-sm text-muted-foreground">{infoMessage}</p>
            ) : null}
            {errorMessage ? <p className="text-sm text-danger">{errorMessage}</p> : null}
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
          <div className="mt-5 text-center text-sm text-muted-foreground">
            New here?{" "}
            <a className="text-foreground underline underline-offset-4" href="/signup">
              Create an account
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


