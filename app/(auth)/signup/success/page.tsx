import { redirect } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SignupSuccessPage({
  searchParams,
}: {
  // Next.js 16: `searchParams` is a Promise in Server Components
  searchParams: Promise<{ email?: string; error?: string; sent?: string }>;
}) {
  const sp = await searchParams;
  const email = sp.email ? decodeURIComponent(sp.email) : "";
  const errorMessage = sp.error ? decodeURIComponent(sp.error) : null;
  const sent = sp.sent === "1";

  async function resend(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim();
    if (!email) redirect("/signup");

    const supabase = await createSupabaseServerClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const emailRedirectTo = siteUrl ? `${siteUrl}/callback` : undefined;

    // Resend signup confirmation email
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: emailRedirectTo ? { emailRedirectTo } : undefined,
    });

    if (error) {
      redirect(
        `/signup/success?email=${encodeURIComponent(email)}&error=${encodeURIComponent(error.message)}`,
      );
    }

    redirect(`/signup/success?email=${encodeURIComponent(email)}&sent=1`);
  }

  return (
    <div className="mx-auto w-full max-w-md px-[var(--spacing-pageX)] py-12">
      <Card>
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            We sent a confirmation link to finish creating your account.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {email ? (
            <p className="text-sm text-muted-foreground">
              Email: <span className="font-medium text-foreground">{email}</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              If you don’t see the email, check your spam/promotions folder.
            </p>
          )}

          {sent ? (
            <p className="text-sm text-muted-foreground">Confirmation email sent again.</p>
          ) : null}
          {errorMessage ? <p className="text-sm text-danger">{errorMessage}</p> : null}

          <form action={resend} className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <Input id="email" name="email" type="email" required autoComplete="email" defaultValue={email} />
            </div>
            <Button type="submit" className="w-full" variant="secondary">
              Resend confirmation email
            </Button>
          </form>

          <div className="pt-2 text-center text-sm text-muted-foreground">
            Once confirmed, you can{" "}
            <a className="text-foreground underline underline-offset-4" href="/login">
              sign in
            </a>
            .
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


