import type { Database } from "@/integrations/supabase/types";

export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type GoodsType = Database["public"]["Enums"]["goods_type"];
export type ShippingMode = Database["public"]["Enums"]["shipping_mode"];
export type PickupLocation = Database["public"]["Enums"]["pickup_location"];
export type AppRole = Database["public"]["Enums"]["app_role"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];

export const STATUS_ORDER: OrderStatus[] = [
  "unavailable",
  "in_warehouse",
  "in_transit",
  "arrived",
  "payment_pending",
  "payment_submitted",
  "payment_confirmed",
  "completed",
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  unavailable: "Not Yet in Warehouse",
  in_warehouse: "In warehouse",
  in_transit: "In transit",
  arrived: "Arrived",
  payment_pending: "Payment pending",
  payment_submitted: "Payment submitted",
  payment_confirmed: "Payment confirmed",
  completed: "Completed",
};

export const STATUS_SHORT: Record<OrderStatus, string> = {
  unavailable: "Not Yet in Warehouse",
  in_warehouse: "In warehouse",
  in_transit: "In transit",
  arrived: "Arrived",
  payment_pending: "Payment pending",
  payment_submitted: "Receipt submitted",
  payment_confirmed: "Paid",
  completed: "Completed",
};

export const STATUS_TONE: Record<OrderStatus, string> = {
  unavailable: "bg-muted text-muted-foreground",
  in_warehouse: "bg-leaf/15 text-forest",
  in_transit: "bg-primary/15 text-primary",
  arrived: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  payment_pending: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  payment_submitted: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  payment_confirmed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  completed: "bg-forest/10 text-forest",
};

/** The next status an admin may move an order to (enforces the pipeline sequence). */
export function nextStatus(status: OrderStatus): OrderStatus | null {
  const index = STATUS_ORDER.indexOf(status);
  if (index < 0 || index === STATUS_ORDER.length - 1) return null;
  return STATUS_ORDER[index + 1] ?? null;
}

/** Statuses operations staff are allowed to bulk-apply (payment steps are customer/payment driven). */
export const BULK_ALLOWED_TARGETS: OrderStatus[] = [
  "in_warehouse",
  "in_transit",
  "arrived",
  "completed",
];

export const GOODS_TYPE_LABEL: Record<GoodsType, string> = {
  normal: "Normal cargo",
  special_hk: "Special goods (Hong Kong)",
  express: "Express",
};

export const MODE_LABEL: Record<ShippingMode, string> = {
  air: "Air",
  sea: "Sea",
};

export const PICKUP_LABEL: Record<PickupLocation, string> = {
  lagos_ajao: "Lagos — Ajao Estate",
  lagos_tradefair: "Lagos — Trade Fair",
  onitsha: "Onitsha",
  kano: "Kano",
};

export const AIR_PICKUPS: PickupLocation[] = ["lagos_ajao", "lagos_tradefair"];

export const ROLE_LABEL: Record<AppRole, string> = {
  super_admin: "Super Admin",
  operations: "Operations",
  warehouse: "Warehouse Staff",
  support: "Support / Read-only",
};

export const ROLE_DESCRIPTION: Record<AppRole, string> = {
  super_admin: "Full access, manages staff accounts, rates and FX.",
  operations: "Search orders, run bulk status actions, review payments.",
  warehouse: "Spreadsheet imports and attaching warehouse photos only.",
  support: "View orders and customers. Cannot change anything.",
};

export const ADMIN_ROLES: AppRole[] = ["super_admin", "operations", "warehouse", "support"];

export function canOperate(roles: AppRole[]) {
  return roles.includes("super_admin") || roles.includes("operations");
}
export function canWarehouse(roles: AppRole[]) {
  return canOperate(roles) || roles.includes("warehouse");
}
export function isSuperAdmin(roles: AppRole[]) {
  return roles.includes("super_admin");
}

export const ngn = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

export const usd = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export const shortDate = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const shortDateTime = (value: string | null | undefined) =>
  value
    ? new Date(value).toLocaleString("en-NG", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export const KENNYMOON_BANK = {
  bank: "Zenith Bank Plc",
  accountName: "Kennymoon Int'l Ltd",
  accountNumber: "1015482093",
};
