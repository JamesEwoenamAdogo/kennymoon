import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database } from "@/integrations/supabase/types";

const signUpSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  fullName: z.string().trim().min(3).max(120),
  businessName: z.string().trim().min(10).max(160),
  phone: z.string().trim().min(7).max(32),
  city: z.string().trim().min(2).max(60),
  password: z.string().min(8).max(72),
});

const kmSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(72),
  kmCode: z
    .string()
    .trim()
    .min(4)
    .max(24)
    .transform((v) => v.toUpperCase().replace(/\s+/g, "")),
});

/** A short-lived, session-less client used only to exchange credentials for tokens. */
function publicClient() {
  return createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

async function signInWithPassword(email: string, password: string) {
  const { data, error } = await publicClient().auth.signInWithPassword({ email, password });
  if (error || !data.session) return null;
  return data.session;
}

/** Sign up a new customer, or log an existing one in with their password. */
export const customerDirectSignIn = createServerFn({ method: "POST" })
  .inputValidator((data) => signUpSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    let user = (list?.users ?? []).find((u) => (u.email ?? "").toLowerCase() === data.email);
    const isNew = !user;

    if (!user) {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          full_name: data.fullName,
          business_name: data.businessName,
          phone: data.phone,
          city: data.city,
        },
      });
      if (error || !created.user) {
        return {
          ok: false as const,
          message: "We couldn't create your account. Please try again.",
        };
      }
      user = created.user;
    }

    const session = await signInWithPassword(data.email, data.password);
    if (!session) {
      return {
        ok: false as const,
        message: isNew
          ? "We couldn't start your session. Please try again."
          : "That email already has an account and the password doesn't match. Please log in below.",
      };
    }

    // Keep the customer directory in the admin portal in sync with what they typed.
    await supabaseAdmin.from("profiles").upsert(
      {
        id: user.id,
        full_name: data.fullName,
        business_name: data.businessName,
        phone: data.phone,
        city: data.city,
      },
      { onConflict: "id" },
    );

    return {
      ok: true as const,
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
    };
  });

/** Existing customers log in with email + KM registration number + password. */
export const customerKmSignIn = createServerFn({ method: "POST" })
  .inputValidator((data) => kmSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const normalized = data.kmCode.startsWith("KM-") ? data.kmCode : `KM-${data.kmCode}`;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("km_code", normalized)
      .maybeSingle();

    if (!profile) {
      return { ok: false as const, message: "We couldn't find that registration number." };
    }

    const { data: userResult } = await supabaseAdmin.auth.admin.getUserById(profile.id);
    const email = (userResult?.user?.email ?? "").toLowerCase();
    if (!email || email !== data.email) {
      return {
        ok: false as const,
        message: "That email doesn't match this registration number.",
      };
    }

    const session = await signInWithPassword(data.email, data.password);
    if (!session) {
      return { ok: false as const, message: "That password is incorrect. Please try again." };
    }

    return {
      ok: true as const,
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
    };
  });
