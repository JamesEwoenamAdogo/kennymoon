import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
/** Lagos has two release points, so the enquiry form asks for the exact one. */
const PICKUP_OPTIONS = [
  "Lagos — Ajao Estate",
  "Lagos — Trade Fair",
  "Onitsha",
  "Kano",
];

const baseShape = {
  name: z.string().trim().min(2, "Please tell us your name").max(80),
  phone: z.string().trim().min(7, "A working phone number, please").max(24),
  email: z.string().trim().email("That email doesn't look right").max(160),
  item_type: z.string().trim().min(2, "Tell us what you're shipping").max(120),
  weight_kg: z.string().trim().min(1, "Approximate weight, please").max(12),
  mode: z.string().min(1, "Choose a shipping mode"),
  pickup_city: z.string().min(1, "Choose a pickup city"),
};

type Values = Record<string, string>;

const initial: Values = {
  name: "",
  phone: "",
  email: "",
  item_type: "",
  weight_kg: "",
  mode: "sea",
  pickup_city: "Lagos — Ajao Estate",
  message: "",
};

export function LeadForm({
  source = "website",
  heading = "Send us a message",
  blurb = "Give us the details and we'll come back with a firm answer — usually the same day.",
  withMessage = true,
}: {
  source?: string;
  heading?: string;
  blurb?: string;
  withMessage?: boolean;
}) {
  const [values, setValues] = useState<Values>(initial);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const schema = useMemo(
    () => z.object({ ...baseShape, message: z.string().trim().max(1000).optional() }),
    [],
  );

  const parsed = schema.safeParse(values);
  const errors: Record<string, string> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!errors[key]) errors[key] = issue.message;
    }
  }
  const isValid = parsed.success;

  const set = (key: string) => (value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));
  const blur = (key: string) => () => setTouched((prev) => ({ ...prev, [key]: true }));
  const errorFor = (key: string) => (touched[key] ? errors[key] : undefined);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!parsed.success) throw new Error("invalid");
      const v = parsed.data;
      const { error } = await supabase.from("leads").insert({
        name: v.name,
        phone: v.phone,
        email: v.email,
        item_type: v.item_type,
        weight_kg: v.weight_kg ? Number(v.weight_kg) : null,
        mode: v.mode,
        pickup_city: v.pickup_city,
        message: v.message || null,
        source,
      });
      if (error) throw error;
      return true;
    },
  });

  if (mutation.isSuccess) {
    return (
      <div className="rounded-3xl border border-leaf/40 bg-card p-8 text-center shadow-soft">
        <CheckCircle2 className="mx-auto size-10 text-leaf" aria-hidden="true" />
        <h3 className="mt-4 text-xl font-extrabold">We've got it, thank you.</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          One of our people will call or WhatsApp you shortly with a firm price. If it's urgent,
          message us directly on WhatsApp and mention the enquiry you just sent.
        </p>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(Object.fromEntries(Object.keys(values).map((k) => [k, true])));
        if (!isValid) return;
        mutation.mutate();
      }}
      className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8"
    >
      <h3 className="text-xl font-extrabold">{heading}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{blurb}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        All fields are required except the last one.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <Label htmlFor="lead-name">Your name *</Label>
          <Input
            id="lead-name"
            name="name"
            required
            autoComplete="name"
            className="mt-1.5"
            value={values["name"] ?? ""}
            onChange={(e) => set("name")(e.target.value)}
            onBlur={blur("name")}
            aria-invalid={Boolean(errorFor("name"))}
          />
          {errorFor("name") && <p className="mt-1 text-xs text-destructive">{errorFor("name")}</p>}
        </div>
        <div className="min-w-0">
          <Label htmlFor="lead-phone">Phone / WhatsApp *</Label>
          <Input
            id="lead-phone"
            name="phone"
            required
            autoComplete="tel"
            className="mt-1.5"
            value={values["phone"] ?? ""}
            onChange={(e) => set("phone")(e.target.value)}
            onBlur={blur("phone")}
            aria-invalid={Boolean(errorFor("phone"))}
          />
          {errorFor("phone") && <p className="mt-1 text-xs text-destructive">{errorFor("phone")}</p>}
        </div>
        <div className="min-w-0">
          <Label htmlFor="lead-email">Email *</Label>
          <Input
            id="lead-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1.5"
            value={values["email"] ?? ""}
            onChange={(e) => set("email")(e.target.value)}
            onBlur={blur("email")}
            aria-invalid={Boolean(errorFor("email"))}
          />
          {errorFor("email") && <p className="mt-1 text-xs text-destructive">{errorFor("email")}</p>}
        </div>
        <div className="min-w-0">
          <Label htmlFor="lead-item">What are you shipping? *</Label>
          <Input
            id="lead-item"
            name="item_type"
            required
            placeholder="e.g. 8 cartons of shoes"
            className="mt-1.5"
            value={values["item_type"] ?? ""}
            onChange={(e) => set("item_type")(e.target.value)}
            onBlur={blur("item_type")}
            aria-invalid={Boolean(errorFor("item_type"))}
          />
          {errorFor("item_type") && (
            <p className="mt-1 text-xs text-destructive">{errorFor("item_type")}</p>
          )}
        </div>
        <div className="min-w-0">
          <Label htmlFor="lead-weight">Approx. weight (kg) *</Label>
          <Input
            id="lead-weight"
            name="weight_kg"
            type="number"
            min={0}
            required
            className="mt-1.5"
            value={values["weight_kg"] ?? ""}
            onChange={(e) => set("weight_kg")(e.target.value)}
            onBlur={blur("weight_kg")}
            aria-invalid={Boolean(errorFor("weight_kg"))}
          />
          {errorFor("weight_kg") && (
            <p className="mt-1 text-xs text-destructive">{errorFor("weight_kg")}</p>
          )}
        </div>
        <div className="min-w-0">
          <Label htmlFor="lead-mode">Preferred mode *</Label>
          <select
            id="lead-mode"
            name="mode"
            required
            value={values["mode"] ?? "sea"}
            onChange={(e) => set("mode")(e.target.value)}
            className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <option value="sea">Sea freight (40–60 days)</option>
            <option value="air">Air freight (7–12 days)</option>
            <option value="unsure">Not sure yet</option>
          </select>
        </div>
        <div className={`min-w-0 ${withMessage ? "" : "sm:col-span-2"}`}>
          <Label htmlFor="lead-city">Pickup city *</Label>
          <select
            id="lead-city"
            name="pickup_city"
            required
            value={values["pickup_city"] ?? "Lagos — Ajao Estate"}
            onChange={(e) => set("pickup_city")(e.target.value)}
            className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {PICKUP_OPTIONS.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
        {withMessage && (
          <div className="min-w-0 sm:col-span-2">
            <Label htmlFor="lead-message">Anything else we should know? (optional)</Label>
            <Textarea
              id="lead-message"
              name="message"
              rows={4}
              className="mt-1.5"
              value={values["message"] ?? ""}
              onChange={(e) => set("message")(e.target.value)}
              onBlur={blur("message")}
              aria-invalid={Boolean(errorFor("message"))}
            />
            {errorFor("message") && (
              <p className="mt-1 text-xs text-destructive">{errorFor("message")}</p>
            )}
          </div>
        )}
      </div>

      {mutation.isError && (
        <p className="mt-4 text-sm text-destructive">
          We couldn't send that. Please try again, or message us on WhatsApp.
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        variant="leaf"
        disabled={!isValid || mutation.isPending}
        className="mt-6 w-full sm:w-auto"
      >
        {mutation.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
        Send my enquiry
      </Button>
      {!isValid && (
        <p className="mt-2 text-xs text-muted-foreground">
          Fill in every field above to enable this button.
        </p>
      )}
    </form>
  );
}
