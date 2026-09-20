import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

import { verifyStaffPassword } from "@/lib/staff-auth.functions";

export const Route = createFileRoute("/staff-login")({
  head: () => ({
    meta: [
      { title: "Staff Login | Kennymoon Admin Portal" },
      {
        name: "description",
        content:
          "Kennymoon staff sign in with a work email and password to open the admin portal.",
      },
      { property: "og:title", content: "Staff Login | Kennymoon Admin Portal" },
      {
        property: "og:description",
        content: "Sign in with your work email and password.",
      },
    ],
  }),
  component: StaffLogin,
});

function StaffLogin() {
  const navigate = useNavigate();
  const verifyPassword = useServerFn(verifyStaffPassword);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submitPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = await verifyPassword({ data: { email, password } });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: result.accessToken,
        refresh_token: result.refreshToken,
      });
      if (sessionError) {
        setError("We could not open your session. Please try again.");
        return;
      }
      navigate({ to: "/admin", replace: true });
    } catch {
      setError("We could not check that sign-in. Please try again.");
    } finally {
      setBusy(false);
    }
  };


  return (
    <section className="bg-forest">
      <div className="mx-auto flex max-w-xl flex-col justify-center px-4 py-16 sm:px-6 sm:py-24">
        <div className="rounded-3xl bg-card p-6 shadow-lift sm:p-8">
          <ShieldCheck className="size-9 text-primary" aria-hidden="true" />
          <h1 className="mt-3 text-2xl font-extrabold">Staff login</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Test mode: any work email with the password <span className="font-semibold">12345</span>{" "}
            opens the admin portal with full Super Admin access. No code is emailed.
          </p>

          <form onSubmit={submitPassword} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="staff-email">Work email</Label>
                <Input
                  id="staff-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  placeholder="you@kennymoonintl.com"
                />
              </div>
              <div>
                <Label htmlFor="staff-password">Password</Label>
                <Input
                  id="staff-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                  placeholder="12345"
                />
              </div>
              {error ? <p className="text-sm font-semibold text-destructive">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <KeyRound className="size-4" aria-hidden="true" />
                )}
                Continue
              </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
