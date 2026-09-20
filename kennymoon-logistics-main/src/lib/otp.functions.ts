import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

const emailSchema = z.string().trim().toLowerCase().email().max(255);

const signupSchema = z.object({
  email: emailSchema,
  fullName: z.string().trim().min(3).max(120),
  businessName: z.string().trim().min(10).max(160),
  phone: z.string().trim().min(7).max(40),
  city: z.string().trim().min(2).max(60),
});

const verifySchema = z.object({
  email: emailSchema,
  code: z.string().trim().regex(/^\d{6}$/),
});

const roleSchema = z.enum(["super_admin", "operations", "warehouse", "support"]);

/** Mints a browser session for a confirmed email. */
async function mintSession(email: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: link } = await supabaseAdmin.auth.admin.generateLink({ type: "magiclink", email });
  const token = link?.properties?.email_otp;
  if (!token) return null;

  const client = createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
  const { data } = await client.auth.verifyOtp({ email, token, type: "email" });
  return data.session ?? null;
}

/** Step 1 of signup / login: email a 6-digit code and stash the typed details. */
export const requestSignupCode = createServerFn({ method: "POST" })
  .inputValidator((data) => signupSchema.parse(data))
  .handler(async ({ data }) => {
    const { issueCode } = await import("@/lib/otp-codes.server");
    const result = await issueCode(data.email, "signup", {
      full_name: data.fullName,
      business_name: data.businessName,
      phone: data.phone,
      city: data.city,
    });
    return result;
  });

/** Step 2 of signup / login: verify the code, create/confirm the account, open the dashboard. */
export const verifySignupCode = createServerFn({ method: "POST" })
  .inputValidator((data) => verifySchema.parse(data))
  .handler(async ({ data }) => {
    const { consumeCode } = await import("@/lib/otp-codes.server");
    const check = await consumeCode(data.email, "signup", data.code);
    if (!check.ok) return { ok: false as const, message: check.message! };

    const meta = (check.metadata ?? {}) as Record<string, string>;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    let user = (list?.users ?? []).find((u) => (u.email ?? "").toLowerCase() === data.email);

    if (!user) {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        email_confirm: true,
        user_metadata: meta,
      });
      if (error || !created.user) {
        return { ok: false as const, message: "We couldn't create your account. Please try again." };
      }
      user = created.user;
    }

    await supabaseAdmin.from("profiles").upsert(
      {
        id: user.id,
        full_name: meta["full_name"] ?? null,
        business_name: meta["business_name"] ?? null,
        phone: meta["phone"] ?? null,
        city: meta["city"] ?? null,
      },
      { onConflict: "id" },
    );

    const session = await mintSession(data.email);
    if (!session) {
      return { ok: false as const, message: "We couldn't start your session. Please try again." };
    }
    return {
      ok: true as const,
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
    };
  });

/** A Super Admin invites a staff member: emails them a 6-digit activation code. */
export const inviteStaffWithCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ email: emailSchema, role: roleSchema }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("is_super_admin", {
      _user_id: context.userId,
    });
    if (isAdmin !== true) return { ok: false as const, message: "Super Admin access required." };

    const { issueCode } = await import("@/lib/otp-codes.server");
    const result = await issueCode(data.email, "admin_invite", { role: data.role });
    if (!result.ok) return { ok: false as const, message: result.message! };
    return {
      ok: true as const,
      message: `Invite code emailed to ${data.email}. They activate it at /verify-staff.`,
    };
  });

/** The invited staff member enters their code: account + role are created, session returned. */
export const verifyStaffInvite = createServerFn({ method: "POST" })
  .inputValidator((data) => verifySchema.parse(data))
  .handler(async ({ data }) => {
    const { consumeCode } = await import("@/lib/otp-codes.server");
    const check = await consumeCode(data.email, "admin_invite", data.code);
    if (!check.ok) return { ok: false as const, message: check.message! };

    const role = ((check.metadata ?? {})["role"] as string) ?? "support";
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    let user = (list?.users ?? []).find((u) => (u.email ?? "").toLowerCase() === data.email);
    if (!user) {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        email_confirm: true,
      });
      if (error || !created.user) {
        return { ok: false as const, message: "We couldn't create that staff account." };
      }
      user = created.user;
    }

    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .upsert(
        { user_id: user.id, role: role as Database["public"]["Enums"]["app_role"] },
        { onConflict: "user_id,role" },
      );
    if (roleError) return { ok: false as const, message: roleError.message };

    const session = await mintSession(data.email);
    if (!session) {
      return { ok: false as const, message: "We couldn't start your session. Please try again." };
    }
    return {
      ok: true as const,
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
    };
  });
