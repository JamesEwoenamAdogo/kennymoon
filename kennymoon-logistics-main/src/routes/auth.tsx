import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { OrbitVisual } from "@/components/site/OrbitVisual";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { customerDirectSignIn, customerKmSignIn } from "@/lib/customer-auth.functions";
import { PICKUP_CITIES } from "@/lib/site";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign Up or Log In | Kennymoon Customer Dashboard" },
      {
        name: "description",
        content:
          "Create a free Kennymoon account in seconds and get a dashboard for your parcels, shipments and RMB transactions.",
      },
      { property: "og:title", content: "Sign Up or Log In | Kennymoon Int'l Ltd" },
      {
        property: "og:description",
        content: "Instant access to your Kennymoon shipping dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const directSignIn = useServerFn(customerDirectSignIn);
  const kmSignInFn = useServerFn(customerKmSignIn);
  const [mode, setMode] = useState<"email" | "code">("email");
  const [kmCode, setKmCode] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Lagos");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  const openDashboard = async (accessToken: string, refreshToken: string) => {
    await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    navigate({ to: "/dashboard", replace: true });
  };

  const submitDetails = async () => {
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (fullName.trim().length < 3) {
      setError("Please enter your full name.");
      return;
    }
    if (businessName.trim().length < 10) {
      setError("Business name is required and must be at least 10 characters.");
      return;
    }
    if (phone.trim().length < 7) {
      setError("Please enter your phone / WhatsApp number.");
      return;
    }
    if (!city.trim()) {
      setError("Please choose your pickup city.");
      return;
    }
    if (password.length < 8) {
      setError("Please choose a password of at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Both passwords must match.");
      return;
    }
    setBusy(true);
    const result = await directSignIn({
      data: {
        email: email.trim(),
        fullName: fullName.trim(),
        businessName: businessName.trim(),
        phone: phone.trim(),
        city,
        password,
      },
    });
    if (!result.ok) {
      setBusy(false);
      setError(result.message ?? "We couldn't open your dashboard. Please try again.");
      return;
    }
    await openDashboard(result.accessToken, result.refreshToken);
  };

  const submitKm = async () => {
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail.trim())) {
      setError("Please enter the email address on your account.");
      return;
    }
    if (kmCode.trim().length < 4) {
      setError("Enter the registration number we issued you, e.g. KM-104382.");
      return;
    }
    if (loginPassword.length < 8) {
      setError("Please enter your password.");
      return;
    }
    setBusy(true);
    const result = await kmSignInFn({
      data: { kmCode, email: loginEmail.trim(), password: loginPassword },
    });
    if (!result.ok) {
      setBusy(false);
      setError(result.message);
      return;
    }
    await openDashboard(result.accessToken, result.refreshToken);
  };

  return (
    <section className="bg-forest">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
        <div className="text-primary-foreground">
          <p className="eyebrow text-gold">Free account</p>
          <h1 className="mt-3 text-3xl leading-tight sm:text-4xl">
            Your parcels, shipments and RMB — in one dashboard
          </h1>
          <p className="mt-4 text-primary-foreground/80">
            Fill in your details and your dashboard opens straight away. You get your KM warehouse
            code immediately.
          </p>
          <ul className="mt-6 space-y-2.5 text-sm text-primary-foreground/80">
            {[
              "Pre-alert packages before they reach our warehouse",
              "Follow every shipment stage without asking anyone",
              "See your RMB transaction history and rates",
              "Log a supplier tracking code and follow it to pickup",
            ].map((item) => (
              <li key={item} className="flex gap-2.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <OrbitVisual className="mt-10 hidden w-48 lg:block" />
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-lift sm:p-8">
          <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
            {(
              [
                ["email", "New / email"],
                ["code", "I have a KM code"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setMode(value);
                  
                  setError(null);
                }}
                className={
                  "rounded-full px-3 py-2 text-sm font-semibold transition-colors " +
                  (mode === value
                    ? "bg-card text-primary shadow-soft"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {label}
              </button>
            ))}
          </div>

          {mode === "code" ? (
            <form
              className="mt-6"
              onSubmit={(e) => {
                e.preventDefault();
                void submitKm();
              }}
            >
              <h2 className="text-xl font-extrabold">Log in to your KM account</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Existing customers: enter your email, the KM number we issued you and your password.
              </p>

              <div className="mt-6 grid gap-4">
                <div>
                  <Label htmlFor="auth-login-email">Email address</Label>
                  <Input
                    id="auth-login-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="mt-1.5 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="auth-km">KM number</Label>
                  <Input
                    id="auth-km"
                    required
                    value={kmCode}
                    onChange={(e) => setKmCode(e.target.value.toUpperCase())}
                    placeholder="KM-104382"
                    className="mt-1.5 h-11 font-semibold tracking-widest"
                  />
                </div>
                <div>
                  <Label htmlFor="auth-login-password">Password</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="auth-login-password"
                      type={showLoginPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="h-11 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((v) => !v)}
                      aria-label={showLoginPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground hover:text-foreground"
                    >
                      {showLoginPassword ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                      ) : (
                        <Eye className="size-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
              <Button type="submit" size="lg" variant="leaf" className="mt-6 w-full" disabled={busy}>
                {busy && <Loader2 className="animate-spin" aria-hidden="true" />}
                Open my dashboard
              </Button>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                New here?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("email");
                    setError(null);
                  }}
                  className="font-semibold text-primary underline underline-offset-4"
                >
                  Create an account
                </button>
              </p>
            </form>
          ) : (
            <form
              className="mt-6"
              onSubmit={(e) => {
                e.preventDefault();
                void submitDetails();
              }}
            >
              <h2 className="text-xl font-extrabold">Create your account</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                All fields are required. Choose a password and your dashboard opens straight away.
              </p>

              <div className="mt-6 grid gap-4">
                <div>
                  <Label htmlFor="auth-email">Email address</Label>
                  <Input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="mt-1.5 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="auth-name">Full name</Label>
                  <Input
                    id="auth-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    required
                    className="mt-1.5 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="auth-business">Business name (min. 10 characters)</Label>
                  <Input
                    id="auth-business"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    autoComplete="organization"
                    required
                    minLength={10}
                    className="mt-1.5 h-11"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="auth-phone">Phone / WhatsApp</Label>
                    <Input
                      id="auth-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                      required
                      className="mt-1.5 h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="auth-city">Pickup city</Label>
                    <select
                      id="auth-city"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      {PICKUP_CITIES.map((c) => (
                        <option key={c.id} value={c.city}>
                          {c.city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="auth-password">Password (min. 8 characters)</Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="auth-password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" aria-hidden="true" />
                        ) : (
                          <Eye className="size-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="auth-password-confirm">Verify password</Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="auth-password-confirm"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-11 pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" aria-hidden="true" />
                        ) : (
                          <Eye className="size-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

              <Button type="submit" size="lg" variant="leaf" className="mt-6 w-full" disabled={busy}>
                {busy && <Loader2 className="animate-spin" aria-hidden="true" />}
                Create my account
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">
                By continuing you agree to let us contact you about your shipments.
              </p>
              <p className="mt-4 border-t border-border pt-4 text-center text-sm text-muted-foreground">
                I have a KM account,{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("code");
                    setError(null);
                  }}
                  className="font-semibold text-primary underline underline-offset-4"
                >
                  Login
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
