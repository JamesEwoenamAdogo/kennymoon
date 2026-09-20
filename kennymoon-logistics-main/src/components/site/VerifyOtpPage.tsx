import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { OtpInput } from "@/components/site/OtpInput";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { verifySignupCode, verifyStaffInvite } from "@/lib/otp.functions";

interface VerifyOtpPageProps {
  purpose: "signup" | "admin_invite";
}

/** Shared 6-box verification screen for new customers and invited staff. */
export function VerifyOtpPage({ purpose }: VerifyOtpPageProps) {
  const navigate = useNavigate();
  const verifySignup = useServerFn(verifySignupCode);
  const verifyInvite = useServerFn(verifyStaffInvite);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("email");
    const stored = window.sessionStorage.getItem("km-verify-email");
    setEmail((fromUrl ?? stored ?? "").toLowerCase());
  }, []);

  const submit = async () => {
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter the email address your code was sent to.");
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setError("Enter all 6 digits of your code.");
      return;
    }
    setBusy(true);
    const result =
      purpose === "signup"
        ? await verifySignup({ data: { email, code } })
        : await verifyInvite({ data: { email, code } });
    if (!result.ok) {
      setBusy(false);
      setError(result.message);
      return;
    }
    await supabase.auth.setSession({
      access_token: result.accessToken,
      refresh_token: result.refreshToken,
    });
    window.sessionStorage.removeItem("km-verify-email");
    toast.success("Verified. Welcome to Kennymoon.");
    navigate({ to: purpose === "signup" ? "/dashboard" : "/admin", replace: true });
  };

  return (
    <section className="bg-forest">
      <div className="mx-auto w-full max-w-lg px-4 py-14 sm:px-6 lg:py-20">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-lift sm:p-8">
          <p className="eyebrow text-primary">
            {purpose === "signup" ? "Email verification" : "Admin activation"}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">Enter your 6-digit code</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {email ? (
              <>
                We emailed a 6-digit code to <span className="font-semibold">{email}</span>. It
                expires in 10 minutes.
              </>
            ) : (
              "Enter the email your code was sent to, then the 6-digit code."
            )}
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            {!email && (
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 w-full max-w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            )}

            <OtpInput value={code} onChange={setCode} disabled={busy} />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              size="lg"
              variant="leaf"
              className="w-full text-sm"
              disabled={busy}
            >
              {busy && <Loader2 className="animate-spin" aria-hidden="true" />}
              Verify and continue
            </Button>
          </form>

          <p className="mt-4 text-xs text-muted-foreground">
            No code yet? Check spam, then request a new one from the{" "}
            {purpose === "signup" ? "sign-up" : "staff"} page. One new code per minute.
          </p>
        </div>
      </div>
    </section>
  );
}
