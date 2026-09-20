import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const roleSchema = z.enum(["super_admin", "operations", "warehouse", "support"]);

async function assertSuperAdmin(supabase: {
  rpc: (fn: "has_role", args: { _user_id: string; _role: "super_admin" }) => Promise<{ data: unknown }>;
}, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" });
  if (data !== true) throw new Error("Only a Super Admin can manage staff accounts.");
}

/** Staff list with emails (emails require the admin API). Super Admin only. */
export const listStaff = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: roles, error } = await supabaseAdmin
      .from("user_roles")
      .select("id, user_id, role, created_at")
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);

    const { data: users } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const emailById = new Map((users?.users ?? []).map((u) => [u.id, u.email ?? ""]));

    return (roles ?? []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      role: r.role,
      createdAt: r.created_at,
      email: emailById.get(r.user_id) ?? "unknown",
    }));
  });

/** Grant an admin role to an existing account (by email). Super Admin only. */
export const grantStaffRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ email: z.string().trim().toLowerCase().email(), role: roleSchema }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: users } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const user = (users?.users ?? []).find((u) => (u.email ?? "").toLowerCase() === data.email);
    if (!user) {
      return {
        ok: false as const,
        message: "No account with that email yet. Ask them to sign up first, then grant the role.",
      };
    }

    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: user.id, role: data.role }, { onConflict: "user_id,role" });
    if (error) return { ok: false as const, message: error.message };

    return { ok: true as const, message: `${data.email} is now ${data.role.replace("_", " ")}.` };
  });

/** Revoke a role row. Super Admin only. */
export const revokeStaffRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role")
      .eq("id", data.id)
      .maybeSingle();

    if (row?.role === "super_admin") {
      const { count } = await supabaseAdmin
        .from("user_roles")
        .select("id", { count: "exact", head: true })
        .eq("role", "super_admin");
      if ((count ?? 0) <= 1) {
        return { ok: false as const, message: "You cannot remove the last Super Admin." };
      }
    }

    const { error } = await supabaseAdmin.from("user_roles").delete().eq("id", data.id);
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const, message: "Role removed." };
  });

/** Customer directory with emails. Any staff role. */
export const listCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: staff } = await context.supabase.rpc("is_staff", { _user_id: context.userId });
    if (staff !== true) throw new Error("Staff access required.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, business_name, phone, city, km_code, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const { data: counts } = await supabaseAdmin.from("orders").select("customer_id");
    const orderCount = new Map<string, number>();
    for (const row of counts ?? []) {
      orderCount.set(row.customer_id, (orderCount.get(row.customer_id) ?? 0) + 1);
    }

    const { data: users } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const emailById = new Map((users?.users ?? []).map((u) => [u.id, u.email ?? ""]));

    return (profiles ?? []).map((p) => ({
      id: p.id,
      fullName: p.full_name,
      businessName: p.business_name,
      phone: p.phone,
      city: p.city,
      kmCode: p.km_code,
      createdAt: p.created_at,
      email: emailById.get(p.id) ?? "",
      orders: orderCount.get(p.id) ?? 0,
    }));
  });

const customerSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().trim().min(2).max(120),
  businessName: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(7).max(32),
  city: z.string().trim().min(2).max(60),
});

async function assertStaff(
  supabase: { rpc: (fn: "is_staff", args: { _user_id: string }) => Promise<{ data: unknown }> },
  userId: string,
) {
  const { data } = await supabase.rpc("is_staff", { _user_id: userId });
  if (data !== true) throw new Error("Staff access required.");
}

/** Edit a customer's directory record. Staff only. */
export const updateCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => customerSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: data.fullName,
        business_name: data.businessName,
        phone: data.phone,
        city: data.city,
      })
      .eq("id", data.id);
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const, message: "Customer updated." };
  });

/** Create a customer account from the portal (no email sent). Staff only. */
export const createCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        email: z.string().trim().toLowerCase().email(),
        fullName: z.string().trim().min(2).max(120),
        businessName: z.string().trim().min(2).max(160),
        phone: z.string().trim().min(7).max(32),
        city: z.string().trim().min(2).max(60),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existing = (list?.users ?? []).find((u) => (u.email ?? "").toLowerCase() === data.email);
    if (existing) return { ok: false as const, message: "That email already has an account." };

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      email_confirm: true,
      user_metadata: {
        full_name: data.fullName,
        business_name: data.businessName,
        phone: data.phone,
        city: data.city,
      },
    });
    if (error || !created.user) {
      return { ok: false as const, message: error?.message ?? "Could not create the account." };
    }

    await supabaseAdmin.from("profiles").upsert(
      {
        id: created.user.id,
        full_name: data.fullName,
        business_name: data.businessName,
        phone: data.phone,
        city: data.city,
      },
      { onConflict: "id" },
    );

    return { ok: true as const, message: `${data.email} added.` };
  });

/** Delete a customer account and its records. Super Admin only. */
export const deleteCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.id);
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const, message: "Customer removed." };
  });

/** Every order belonging to one customer, for the admin customer detail view. */
export const customerOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("orders")
      .select("id, tracking_number, description, status, shipping_mode, pickup_location, created_at")
      .eq("customer_id", data.id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
