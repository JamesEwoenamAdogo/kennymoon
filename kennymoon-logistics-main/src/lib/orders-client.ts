import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { OrderStatus, PickupLocation, GoodsType, ShippingMode } from "@/lib/admin";

type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"];

const sel = (s: string): string => s;

export interface OrderRow {
  id: string;
  customer_id: string;
  tracking_number: string;
  description: string;
  goods_type: GoodsType;
  shipping_mode: ShippingMode;
  pickup_location: PickupLocation;
  internal_code: string | null;
  status: OrderStatus;
  warehouse_city: string | null;
  estimated_delivery_date: string | null;
  photo_url: string | null;
  weight_kg: number | null;
  cbm: number | null;
  created_at: string;
}

export interface CustomerLite {
  id: string;
  full_name: string | null;
  business_name: string | null;
  km_code: string | null;
  phone: string | null;
  city: string | null;
  created_at: string;
}

export interface OrderFilters {
  customerId?: string;
  tracking?: string;
  status?: OrderStatus | "all";
  from?: string;
  to?: string;
}

export async function fetchOrders(filters: OrderFilters = {}) {
  let q = supabase
    .from("orders")
    .select(sel("*"))
    .order("created_at", { ascending: false })
    .limit(1000);

  if (filters.customerId) q = q.eq("customer_id", filters.customerId);
  if (filters.status && filters.status !== "all") q = q.eq("status", filters.status);
  if (filters.tracking?.trim()) q = q.ilike("tracking_number", `%${filters.tracking.trim()}%`);
  if (filters.from) q = q.gte("created_at", `${filters.from}T00:00:00Z`);
  if (filters.to) q = q.lte("created_at", `${filters.to}T23:59:59Z`);

  const { data, error } = await q.returns<OrderRow[]>();
  if (error) throw error;
  return data ?? [];
}

/** The signed-in customer's own orders — same `orders` records the admin portal reads. */
export async function fetchMyOrders() {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error("Please sign in again.");
  const { data, error } = await supabase
    .from("orders")
    .select(sel("*"))
    .eq("customer_id", userId)
    .order("created_at", { ascending: false })
    .returns<OrderRow[]>();
  if (error) throw error;
  return data ?? [];
}

export async function fetchCustomerMap() {
  const { data, error } = await supabase
    .from("profiles")
    .select(sel("id, full_name, business_name, km_code, phone, city, created_at"))
    .returns<CustomerLite[]>();
  if (error) throw error;
  return new Map((data ?? []).map((c) => [c.id, c]));
}

/** Applies a status to many orders and writes one audit row per order under a shared batch id. */
export async function bulkSetStatus(params: {
  orders: Pick<OrderRow, "id" | "status">[];
  newStatus: OrderStatus;
  estimatedDeliveryDate?: string | null;
  warehouseCity?: string | null;
  actorId: string;
  triggeredBy?: string;
}) {
  const batchId = crypto.randomUUID();
  const ids = params.orders.map((o) => o.id);
  if (ids.length === 0) return { batchId, updated: 0 };

  const patch: OrderUpdate = { status: params.newStatus };
  if (params.estimatedDeliveryDate) patch.estimated_delivery_date = params.estimatedDeliveryDate;
  if (params.warehouseCity) patch.warehouse_city = params.warehouseCity;

  const { error } = await supabase.from("orders").update(patch).in("id", ids);
  if (error) throw error;

  const events = params.orders.map((o) => ({
    order_id: o.id,
    old_status: o.status,
    new_status: params.newStatus,
    triggered_by: params.triggeredBy ?? "admin",
    actor_id: params.actorId,
    batch_id: batchId,
  }));
  const { error: eventError } = await supabase.from("status_events").insert(events);
  if (eventError) throw eventError;

  return { batchId, updated: ids.length };
}

export interface MoveResult {
  id: string;
  tracking_number: string;
  ok: boolean;
  error?: string;
}

/** Moves each order one at a time so the caller can report success or failure per order. */
export async function moveOrdersDetailed(params: {
  orders: Pick<OrderRow, "id" | "status" | "tracking_number">[];
  newStatus: OrderStatus;
  actorId: string;
  triggeredBy?: string;
}): Promise<{ batchId: string; results: MoveResult[] }> {
  const batchId = crypto.randomUUID();
  const results: MoveResult[] = [];

  for (const order of params.orders) {
    const patch: OrderUpdate = { status: params.newStatus };
    const { error } = await supabase.from("orders").update(patch).eq("id", order.id);
    if (error) {
      results.push({
        id: order.id,
        tracking_number: order.tracking_number,
        ok: false,
        error: error.message,
      });
      continue;
    }

    const { error: eventError } = await supabase.from("status_events").insert({
      order_id: order.id,
      old_status: order.status,
      new_status: params.newStatus,
      triggered_by: params.triggeredBy ?? "admin",
      actor_id: params.actorId,
      batch_id: batchId,
    });

    results.push({
      id: order.id,
      tracking_number: order.tracking_number,
      ok: true,
      ...(eventError ? { error: `Moved, but history note failed: ${eventError.message}` } : {}),
    });
  }

  return { batchId, results };
}

export interface ImportRow {
  tracking_number: string;
  warehouse_city?: string | null;
  photo_url?: string | null;
}

/**
 * Records every tracking number on the warehouse arrivals list (nothing is ever rejected),
 * then flips any order a customer already logged with that number into "In warehouse".
 * Numbers no customer has logged yet simply wait on the arrivals list until they do.
 */
export async function runWarehouseImport(params: {
  fileName: string;
  rows: ImportRow[];
  actorId: string;
}) {
  const trimmed = params.rows
    .map((r) => ({ ...r, tracking_number: String(r.tracking_number ?? "").trim() }))
    .filter((r) => r.tracking_number.length > 0);

  const byKey = new Map<string, ImportRow>();
  for (const row of trimmed) byKey.set(row.tracking_number.toUpperCase(), row);
  const rows = [...byKey.values()];
  const numbers = rows.map((r) => r.tracking_number);

  if (rows.length === 0) {
    return { rows: 0, stored: 0, matched: 0, movedToWarehouse: 0, awaitingCustomer: [] as string[] };
  }

  // 1. Every scanned number lands on the arrivals list.
  const { error: arrivalError } = await supabase.from("warehouse_arrivals").upsert(
    rows.map((r) => ({
      tracking_number: r.tracking_number,
      warehouse_city: r.warehouse_city ?? null,
      photo_url: r.photo_url ?? null,
      imported_by: params.actorId,
    })),
    { onConflict: "tracking_key" },
  );
  if (arrivalError) throw arrivalError;

  // 2. Attach to customer-logged orders where they exist.
  const { data: matches, error } = await supabase
    .from("orders")
    .select(sel("id, tracking_number, status"))
    .in("tracking_number", numbers)
    .returns<Pick<OrderRow, "id" | "tracking_number" | "status">[]>();
  if (error) throw error;

  const matched = matches ?? [];
  const matchedKeys = new Set(matched.map((m) => m.tracking_number.trim().toUpperCase()));
  const awaitingCustomer = numbers.filter((n) => !matchedKeys.has(n.toUpperCase()));

  const batchId = crypto.randomUUID();
  let updated = 0;

  for (const order of matched) {
    const row = byKey.get(order.tracking_number.trim().toUpperCase());
    const patch: OrderUpdate = {};
    if (order.status === "unavailable") patch.status = "in_warehouse";
    if (row?.warehouse_city) patch.warehouse_city = row.warehouse_city;
    if (row?.photo_url) patch.photo_url = row.photo_url;
    if (Object.keys(patch).length === 0) continue;

    const { error: updateError } = await supabase.from("orders").update(patch).eq("id", order.id);
    if (updateError) throw updateError;

    if (patch.status) {
      updated += 1;
      await supabase.from("status_events").insert({
        order_id: order.id,
        old_status: order.status,
        new_status: "in_warehouse",
        triggered_by: "system_import",
        actor_id: params.actorId,
        batch_id: batchId,
      });
    }
  }

  const { error: logError } = await supabase.from("warehouse_imports").insert({
    imported_by: params.actorId,
    file_name: params.fileName,
    row_count: rows.length,
    matched_count: rows.length,
    unmatched_count: 0,
    unmatched_tracking_numbers: awaitingCustomer,
  });
  if (logError) throw logError;

  return {
    rows: rows.length,
    stored: rows.length,
    matched: matched.length,
    movedToWarehouse: updated,
    awaitingCustomer,
  };
}

