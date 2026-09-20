import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  name: z.string().trim().min(2, "Please tell us your name").max(80),
  email: z.string().trim().email("That email doesn't look right").max(160),
  phone: z.string().trim().min(7, "A working phone number, please").max(24),
  item_details: z
    .string()
    .trim()
    .min(5, "Describe what you want to ship")
    .max(1000),
  mode: z.string().min(1).max(20),
  weight_kg: z.string().trim().min(1, "Approximate weight, please").max(12),

});

export function ShippingRequestForm({ pickupCity }: { pickupCity: string }) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: async (form: FormData) => {
      const raw = Object.fromEntries(form.entries()) as Record<string, string>;
      const parsed = schema.safeParse(raw);
      if (!parsed.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
          fieldErrors[String(issue.path[0])] = issue.message;
        }
        setErrors(fieldErrors);
        throw new Error("invalid");
      }
      setErrors({});
      const v = parsed.data;
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("shipping_requests").insert({
        user_id: auth.user?.id ?? null,
        name: v.name,
        email: v.email,
        phone: v.phone,
        pickup_city: pickupCity,
        item_details: v.item_details,
        mode: v.mode,
        weight_kg: v.weight_kg ? Number(v.weight_kg) : null,
      });
      if (error) throw error;
      return true;
    },
  });

  if (mutation.isSuccess) {
    return (
      <div className="rounded-3xl border border-leaf/40 bg-card p-8 text-center shadow-soft">
        <CheckCircle2 className="mx-auto size-10 text-leaf" aria-hidden="true" />
        <h3 className="mt-4 text-xl font-extrabold">
          We have received your shipping request.
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          One of our team members will call you within the next 3 hours.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate(new FormData(e.currentTarget));
      }}
      className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8"
    >
      <h3 className="text-xl font-extrabold">Submit your {pickupCity} shipping request</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Leave your details and what you want to ship. Our {pickupCity} team calls you back within 3
        hours.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="sr-name">Your name</Label>
          <Input id="sr-name" name="name" required className="mt-1.5" autoComplete="name" />
          {errors["name"] && <p className="mt-1 text-xs text-destructive">{errors["name"]}</p>}
        </div>
        <div>
          <Label htmlFor="sr-phone">Phone number</Label>
          <Input id="sr-phone" name="phone" required className="mt-1.5" autoComplete="tel" />
          {errors["phone"] && <p className="mt-1 text-xs text-destructive">{errors["phone"]}</p>}
        </div>
        <div>
          <Label htmlFor="sr-email">Email address</Label>
          <Input
            id="sr-email"
            name="email"
            type="email"
            required
            className="mt-1.5"
            autoComplete="email"
          />
          {errors["email"] && <p className="mt-1 text-xs text-destructive">{errors["email"]}</p>}
        </div>
        <div>
          <Label htmlFor="sr-mode">Preferred mode</Label>
          <select
            id="sr-mode"
            name="mode"
            required
            defaultValue="sea"
            className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <option value="sea">Sea freight (40–60 days)</option>
            <option value="air">Air freight (7–12 days)</option>
            <option value="unsure">Not sure yet</option>
          </select>
        </div>
        <div>
          <Label htmlFor="sr-weight">Approx. weight (kg)</Label>
          <Input
            id="sr-weight"
            name="weight_kg"
            type="number"
            min={0}
            required
            className="mt-1.5"
          />
          {errors["weight_kg"] && (
            <p className="mt-1 text-xs text-destructive">{errors["weight_kg"]}</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="sr-details">What do you want to ship?</Label>
          <Textarea
            id="sr-details"
            name="item_details"
            rows={4}
            required
            placeholder="e.g. 12 cartons of children's shoes from Guangzhou, plus 2 cartons of phone accessories"
            className="mt-1.5"
          />
          {errors["item_details"] && (
            <p className="mt-1 text-xs text-destructive">{errors["item_details"]}</p>
          )}
        </div>

      </div>

      {mutation.isError && Object.keys(errors).length === 0 && (
        <p className="mt-4 text-sm text-destructive">
          We couldn't send that. Please check your details and try again.
        </p>
      )}

      <Button type="submit" size="lg" variant="leaf" className="mt-6 w-full sm:w-auto">
        {mutation.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
        Submit shipping request
      </Button>
    </form>
  );
}
