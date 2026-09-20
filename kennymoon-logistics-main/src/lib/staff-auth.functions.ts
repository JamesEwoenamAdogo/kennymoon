import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

const credentials = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(1).max(200),
});

/**
 * TEST MODE staff sign-in. Any email with any password opens the admin portal:
 * the account is created if missing and granted Super Admin. The typed password
 * is ignored — an internal test password is used to mint the session. Restore
 * the strict password + role check before going live.
 */
const TEST_MODE_PASSWORD = "kennymoon-test-mode-2026";

export const verifyStaffPassword = createServerFn({ method: "POST" })
  .inputValidator((data) => credentials.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    let user = (list?.users ?? []).find((u) => (u.email ?? "").toLowerCase() === data.email);

    if (!user) {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: TEST_MODE_PASSWORD,
        email_confirm: true,
      });
      if (error || !created.user) {
        return { ok: false as const, message: "We couldn't open that staff account." };
      }
      user = created.user;
    } else {
      await supabaseAdmin.auth.admin.updateUserById(user.id, { email_confirm: true });
    }

    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: user.id, role: "super_admin" }, { onConflict: "user_id,role" });

    const client = createClient<Database>(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_PUBLISHABLE_KEY"]!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    // Try the typed password first so real credentials keep working; if it does
    // not match, fall back to the internal test password (test mode never rejects).
    const { data: signIn } = await client.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    let session = signIn?.session ?? null;

    if (!session) {
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: TEST_MODE_PASSWORD,
        email_confirm: true,
      });
      const { data: fallback } = await client.auth.signInWithPassword({
        email: data.email,
        password: TEST_MODE_PASSWORD,
      });
      session = fallback?.session ?? null;
    }

    if (!session) {
      return { ok: false as const, message: "We couldn't start your session. Please try again." };
    }

    return {
      ok: true as const,
      roles: ["super_admin"],
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
    };
  });

/** Set or reset a staff member's password. Super Admin only. */
export const setStaffPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => credentials.parse(data))
  .handler(async ({ data, context }) => {
    const { data: isSuper } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (isSuper !== true) throw new Error("Only a Super Admin can set staff passwords.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: users } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const user = (users?.users ?? []).find((u) => (u.email ?? "").toLowerCase() === data.email);
    if (!user) {
      return { ok: false as const, message: "No account with that email yet." };
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: data.password,
      email_confirm: true,
    });
    if (error) return { ok: false as const, message: error.message };

    return { ok: true as const, message: `Password set for ${data.email}.` };
  });
