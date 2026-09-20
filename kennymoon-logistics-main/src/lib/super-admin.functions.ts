import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** The account that always holds Super Admin access on this project. */
export const ROOT_SUPER_ADMIN_EMAIL = "opeyemipapilo@gmail.com";

const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
});

/**
 * Promote any existing account to Super Admin by email.
 * The database function itself re-checks that the caller is a Super Admin.
 */
export const promoteToSuperAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => emailSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: result, error } = await context.supabase.rpc("promote_to_super_admin", {
      _email: data.email,
    });
    if (error) return { ok: false as const, message: error.message };
    const payload = (result ?? {}) as { ok?: boolean; message?: string };
    return {
      ok: payload.ok === true,
      message: payload.message ?? "Nothing changed.",
    };
  });

/**
 * Startup seed: make sure the root Super Admin account exists and holds the
 * role. If the auth user is missing we create it and send an invite email so
 * the owner sets their own password — no password is ever written in code.
 * Safe to call repeatedly; it never changes an existing account's credentials.
 */
export const ensureRootSuperAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  let user = (list?.users ?? []).find(
    (u) => (u.email ?? "").toLowerCase() === ROOT_SUPER_ADMIN_EMAIL,
  );
  let invited = false;

  if (!user) {
    const { data: invite, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      ROOT_SUPER_ADMIN_EMAIL,
    );
    if (error || !invite?.user) {
      return { ok: false as const, message: error?.message ?? "Could not create the owner account." };
    }
    user = invite.user;
    invited = true;
  }

  await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: user.id, role: "super_admin" }, { onConflict: "user_id,role" });

  return { ok: true as const, invited };
});
