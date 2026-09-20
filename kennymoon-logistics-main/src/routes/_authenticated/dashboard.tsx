import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Banknote,
  BadgePercent,
  Boxes,
  Calculator,
  ClipboardCheck,
  Copy,
  LogOut,
  Newspaper,
  Package,
  PackageOpen,
  PackagePlus,
  ShieldCheck,
  PackageSearch,
  Trash2,
  Users,
  Warehouse,
} from "lucide-react";
import { useState } from "react";

import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useStaffRoles } from "@/hooks/useStaffRoles";
import { STATUS_ORDER, STATUS_SHORT, STATUS_TONE, type OrderStatus } from "@/lib/admin";
import { fetchMyOrders } from "@/lib/orders-client";
import { RMB_RATE, STAGE_LABELS, WAREHOUSE, naira } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My Dashboard | Kennymoon Int'l Ltd" },
      {
        name: "description",
        content:
          "Your Kennymoon dashboard: pre-alerted parcels, live shipments and RMB transactions in one place.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

type PanelKey = "prealert" | "recipients" | "warehouse" | "coupons" | null;

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [panel, setPanel] = useState<PanelKey>(null);
  const [copied, setCopied] = useState(false);
  const staff = useStaffRoles();

  const profile = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone, city, km_code")
        .eq("id", auth.user?.id ?? "")
        .maybeSingle();
      return { email: auth.user?.email ?? "", id: auth.user?.id ?? "", ...data };
    },
  });

  const parcels = useQuery({
    queryKey: ["parcels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parcels")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const shipments = useQuery({
    queryKey: ["shipments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const rmb = useQuery({
    queryKey: ["rmb"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rmb_transactions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });




  const recipients = useQuery({
    queryKey: ["recipients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const requests = useQuery({
    queryKey: ["shipping_requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipping_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  /** Same `orders` records the admin portal reads, scoped to this signed-in customer. */
  const myOrders = useQuery({
    queryKey: ["my-orders"],
    queryFn: fetchMyOrders,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const addParcel = useMutation({
    mutationFn: async (form: FormData) => {
      const { data: auth } = await supabase.auth.getUser();
      const raw = Object.fromEntries(form.entries()) as Record<string, string>;
      const { error } = await supabase.from("parcels").insert({
        user_id: auth.user!.id,
        tracking_number: raw["tracking_number"]!.trim().slice(0, 80),
        seller: raw["seller"]?.trim().slice(0, 120) || null,
        description: raw["description"]!.trim().slice(0, 300),
        quantity: Number(raw["quantity"]) || 1,
        expected_weight_kg: raw["expected_weight_kg"] ? Number(raw["expected_weight_kg"]) : null,
        mode: raw["mode"] ?? "sea",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setPanel(null);
      void queryClient.invalidateQueries({ queryKey: ["parcels"] });
    },
  });

  const addRecipient = useMutation({
    mutationFn: async (form: FormData) => {
      const { data: auth } = await supabase.auth.getUser();
      const raw = Object.fromEntries(form.entries()) as Record<string, string>;
      const { error } = await supabase.from("recipients").insert({
        user_id: auth.user!.id,
        full_name: raw["full_name"]!.trim().slice(0, 120),
        phone: raw["phone"]!.trim().slice(0, 24),
        city: raw["city"]?.trim().slice(0, 60) || null,
        address: raw["address"]?.trim().slice(0, 300) || null,
      });
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["recipients"] }),
  });

  const removeRecipient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("recipients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["recipients"] }),
  });

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const kmCode = profile.data?.km_code ?? "…";
  const firstName = profile.data?.full_name?.split(" ")[0] ?? "there";

  const orderRows = myOrders.data ?? [];
  const stageCount = (status: OrderStatus) =>
    orderRows.filter((o) => o.status === status).length;

  const copyCode = async () => {
    await navigator.clipboard.writeText(kmCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const functions: {
    icon: typeof Package;
    label: string;
    to?: string;
    onClick?: () => void;
  }[] = [
    { icon: PackagePlus, label: "Forecast package", onClick: () => setPanel("prealert") },
    { icon: PackageOpen, label: "My goods & payments", to: "/orders" },
    { icon: PackageSearch, label: "Package query", to: "/track" },
    { icon: Boxes, label: "Consolidation order", to: "/services/$slug" },
    { icon: ClipboardCheck, label: "Claim a package", to: "/contact" },
    { icon: Banknote, label: "Financial records", to: "/services/$slug" },
    { icon: Calculator, label: "Freight trial (rates)", to: "/quote" },
    { icon: Warehouse, label: "Receiving warehouse", onClick: () => setPanel("warehouse") },
    { icon: BadgePercent, label: "My coupons", onClick: () => setPanel("coupons") },
  ];

  const services = [
    { icon: Users, label: "Recipient management", onClick: () => setPanel("recipients") },
    { icon: Newspaper, label: "News & updates", to: "/faq" as const },
  ];

  return (
    <>
      {/* Member header */}
      <section className="bg-forest text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-12 sm:px-6">
          <div className="flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-full bg-primary-foreground/10 text-xl font-extrabold text-gold">
              {firstName.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <p className="eyebrow text-gold">Member</p>
              <h1 className="mt-1 text-2xl sm:text-3xl">Welcome, {firstName}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-primary-foreground/80">
                <button
                  type="button"
                  onClick={() => void copyCode()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/10 px-3 py-1 font-bold text-gold transition-colors hover:bg-primary-foreground/20"
                >
                  <Copy className="size-3.5" aria-hidden="true" />
                  ID: {kmCode}
                  {copied && <span className="text-primary-foreground/70">copied</span>}
                </button>
                <span className="rounded-full bg-leaf-gradient px-3 py-1 text-xs font-bold">
                  Regular member
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button variant="hero" onClick={() => setPanel("prealert")}>
              <PackagePlus aria-hidden="true" />
              Forecast package
            </Button>
            {(staff.data?.roles.length ?? 0) > 0 && (
              <Button asChild variant="onDark">
                <Link to="/admin">
                  <ShieldCheck aria-hidden="true" />
                  Admin portal
                </Link>
              </Button>
            )}
            <Button variant="onDark" onClick={() => void signOut()}>
              <LogOut aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {/* Quick cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setPanel("warehouse")}
            className="card-hover rounded-3xl bg-leaf-gradient p-6 text-left text-primary-foreground"
          >
            <p className="text-base font-extrabold">Your exclusive shipping address</p>
            <p className="mt-1 text-sm text-primary-foreground/85">
              Guangzhou & Yiwu warehouse details with your {kmCode} label.
            </p>
          </button>
          <Link
            to="/quote"
            className="card-hover block rounded-3xl bg-gold-gradient p-6 text-left text-primary"
          >
            <p className="text-base font-extrabold">Payment & freight estimate</p>
            <p className="mt-1 text-sm text-primary/80">
              Today's RMB rate is ₦{RMB_RATE} to ¥1 — check what your cargo will cost.
            </p>
          </Link>
        </div>

        {/* Order pipeline — the same records staff see in the admin portal */}
        <section className="mt-6 rounded-3xl border border-border bg-card p-5">
          <h2 className="text-lg font-extrabold">My order pipeline</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {STATUS_ORDER.map((s, i) => (
              <Reveal key={s} delay={i * 40}>
                <div className="rounded-2xl border border-border bg-background p-3 text-center">
                  <dd className="text-xl font-extrabold tabular-nums text-primary">
                    {stageCount(s)}
                  </dd>
                  <dt className="mt-1 text-[11px] leading-tight text-muted-foreground">
                    {STATUS_SHORT[s]}
                  </dt>
                </div>
              </Reveal>
            ))}
          </dl>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Button asChild size="sm" variant="leaf">
              <Link to="/track">Track my Waybill</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/orders">My goods & payments</Link>
            </Button>
          </div>
          <div className="mt-4 space-y-2">
            {myOrders.isLoading && (
              <p className="text-sm text-muted-foreground">Loading your orders…</p>
            )}
            {!myOrders.isLoading && orderRows.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No orders logged yet. Log a supplier tracking number under “My goods &amp; payments”.
              </p>
            )}
            {orderRows.map((o) => (
              <div
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background p-3"
              >
                <div className="min-w-0">
                  <p className="font-mono text-sm font-bold">{o.tracking_number}</p>
                  <p className="truncate text-xs text-muted-foreground">{o.description}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_TONE[o.status]}`}>
                  {STATUS_SHORT[o.status]}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Functions */}
        <section className="mt-6 rounded-3xl border border-border bg-card p-6">
          <h2 className="text-lg font-extrabold">Functions</h2>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
            {functions.map((f) =>
              f.to ? (
                <Link
                  key={f.label}
                  to={f.to === "/services/$slug" ? "/services" : f.to}
                  className="card-hover flex flex-col items-center gap-1.5 rounded-xl border border-border bg-background px-2 py-2.5 text-center"
                >
                  <span className="grid size-8 place-items-center rounded-lg bg-secondary text-primary">
                    <f.icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-[11px] font-bold leading-tight">{f.label}</span>
                </Link>
              ) : (
                <button
                  key={f.label}
                  type="button"
                  onClick={f.onClick}
                  className="card-hover flex flex-col items-center gap-1.5 rounded-xl border border-border bg-background px-2 py-2.5 text-center"
                >
                  <span className="grid size-8 place-items-center rounded-lg bg-secondary text-primary">
                    <f.icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-[11px] font-bold leading-tight">{f.label}</span>
                </button>
              ),
            )}
          </div>
        </section>

        {/* Services */}
        <section className="mt-6 rounded-3xl border border-border bg-card p-6">
          <h2 className="text-lg font-extrabold">Services</h2>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
            {services.map((s) =>
              s.to ? (
                <Link
                  key={s.label}
                  to={s.to}
                  className="card-hover flex flex-col items-center gap-1.5 rounded-xl border border-border bg-background px-2 py-2.5 text-center"
                >
                  <span className="grid size-8 place-items-center rounded-lg bg-secondary text-primary">
                    <s.icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-[11px] font-bold leading-tight">{s.label}</span>
                </Link>
              ) : (
                <button
                  key={s.label}
                  type="button"
                  onClick={s.onClick}
                  className="card-hover flex flex-col items-center gap-1.5 rounded-xl border border-border bg-background px-2 py-2.5 text-center"
                >
                  <span className="grid size-8 place-items-center rounded-lg bg-secondary text-primary">
                    <s.icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-[11px] font-bold leading-tight">{s.label}</span>
                </button>
              ),
            )}
          </div>
        </section>

        {/* Panels */}
        {panel === "prealert" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addParcel.mutate(new FormData(e.currentTarget));
            }}
            className="mt-8 rounded-3xl border border-leaf/40 bg-card p-6 shadow-soft"
          >
            <h2 className="text-lg font-extrabold">Forecast a package</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tell us what's coming so we can match it to you the moment it lands in China.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="pa-tracking">Seller's tracking number</Label>
                <Input id="pa-tracking" name="tracking_number" required className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="pa-seller">Seller / shop name</Label>
                <Input id="pa-seller" name="seller" className="mt-1.5" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="pa-desc">What's inside?</Label>
                <Input id="pa-desc" name="description" required className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="pa-qty">Cartons</Label>
                <Input
                  id="pa-qty"
                  name="quantity"
                  type="number"
                  min={1}
                  defaultValue={1}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="pa-weight">Expected weight (kg)</Label>
                <Input id="pa-weight" name="expected_weight_kg" type="number" min={0} className="mt-1.5" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="pa-mode">Mode</Label>
                <select
                  id="pa-mode"
                  name="mode"
                  defaultValue="sea"
                  className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="sea">Sea freight</option>
                  <option value="air">Air freight</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex gap-2.5">
              <Button type="submit" variant="leaf" disabled={addParcel.isPending}>
                Save forecast
              </Button>
              <Button type="button" variant="outline" onClick={() => setPanel(null)}>
                Close
              </Button>
            </div>
            {addParcel.isError && (
              <p className="mt-3 text-sm text-destructive">
                We couldn't save that. Please check the fields and try again.
              </p>
            )}
          </form>
        )}

        {panel === "warehouse" && (
          <section className="mt-8 rounded-3xl border border-leaf/40 bg-card p-6 shadow-soft">
            <h2 className="text-lg font-extrabold">Your receiving warehouse</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background p-4 text-sm">
                <p className="font-bold text-primary">Guangzhou (main hub)</p>
                <p className="mt-2 text-muted-foreground">{WAREHOUSE.street}</p>
                <p className="text-muted-foreground">
                  {WAREHOUSE.area} · {WAREHOUSE.postCode}
                </p>
                <p className="mt-2">Warehouse line: {WAREHOUSE.mobile}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4 text-sm">
                <p className="font-bold text-primary">Yiwu (small goods)</p>
                <p className="mt-2 text-muted-foreground">{WAREHOUSE.yiwu.street}</p>
                <p className="text-muted-foreground">
                  {WAREHOUSE.yiwu.area} · {WAREHOUSE.yiwu.postCode}
                </p>
                <p className="mt-2">Warehouse line: {WAREHOUSE.yiwu.mobile}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Always write <span className="font-extrabold text-primary">{kmCode}</span> in the
              seller's comment field and on every carton.
            </p>
            <Button variant="outline" className="mt-5" onClick={() => setPanel(null)}>
              Close
            </Button>
          </section>
        )}

        {panel === "coupons" && (
          <section className="mt-8 rounded-3xl border border-border bg-card p-6">
            <h2 className="text-lg font-extrabold">My coupons</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You have no coupons at the moment. Ask our team about volume discounts once you ship
              more than 300kg in a quarter.
            </p>
            <Button variant="outline" className="mt-5" onClick={() => setPanel(null)}>
              Close
            </Button>
          </section>
        )}

        {panel === "recipients" && (
          <section className="mt-8 rounded-3xl border border-leaf/40 bg-card p-6 shadow-soft">
            <h2 className="text-lg font-extrabold">Recipient management</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Save the people allowed to collect your goods on your behalf.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                addRecipient.mutate(new FormData(form), { onSuccess: () => form.reset() });
              }}
              className="mt-5 grid gap-4 sm:grid-cols-2"
            >
              <div>
                <Label htmlFor="rc-name">Full name</Label>
                <Input id="rc-name" name="full_name" required className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="rc-phone">Phone</Label>
                <Input id="rc-phone" name="phone" required className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="rc-city">City</Label>
                <Input id="rc-city" name="city" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="rc-address">Address</Label>
                <Input id="rc-address" name="address" className="mt-1.5" />
              </div>
              <div className="flex gap-2.5 sm:col-span-2">
                <Button type="submit" variant="leaf" disabled={addRecipient.isPending}>
                  Save recipient
                </Button>
                <Button type="button" variant="outline" onClick={() => setPanel(null)}>
                  Close
                </Button>
              </div>
            </form>

            <div className="mt-6 space-y-2.5">
              {recipients.data?.length ? (
                recipients.data.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background p-4"
                  >
                    <div>
                      <p className="text-sm font-bold">{r.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.phone}
                        {r.city ? ` · ${r.city}` : ""}
                        {r.address ? ` · ${r.address}` : ""}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${r.full_name}`}
                      onClick={() => removeRecipient.mutate(r.id)}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No saved recipients yet.</p>
              )}
            </div>
          </section>
        )}

        {/* Records */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Module title="Packages (forecast)" empty="No forecasts yet. Use “Forecast package” above.">
            {parcels.data?.map((p) => (
              <Row
                key={p.id}
                title={p.description}
                subtitle={`${p.tracking_number} · ${p.quantity} carton(s) · ${p.mode}`}
                badge={p.status}
              />
            ))}
          </Module>

          <Module
            title="Shipments"
            empty="No shipments linked to your account yet. Once we consolidate your cartons, your waybill appears here."
          >
            {shipments.data?.map((s) => (
              <Row
                key={s.id}
                title={s.description}
                subtitle={`${s.waybill} · ${s.pickup_city} · ${s.mode}`}
                badge={STAGE_LABELS[s.status] ?? s.status}
              />
            ))}
          </Module>

          <Module
            title="Financial records (RMB)"
            empty={`No RMB payments yet. Today's rate is ₦${RMB_RATE} to ¥1 — message us to settle a supplier.`}
          >
            {rmb.data?.map((t) => (
              <Row
                key={t.id}
                title={`¥${Number(t.amount_rmb).toLocaleString()} → ${naira(Number(t.amount_ngn))}`}
                subtitle={`Rate ₦${t.rate} · ${t.purpose ?? "Supplier payment"}`}
                badge={t.status}
              />
            ))}
          </Module>




          <Module
            title="Shipping requests"
            empty="No shipping requests yet. Submit one from any pickup city page."
          >
            {requests.data?.map((r) => (
              <Row
                key={r.id}
                title={r.item_details}
                subtitle={`${r.pickup_city} · ${r.mode}${r.weight_kg ? ` · ${r.weight_kg}kg` : ""}`}
                badge={r.status}
              />
            ))}
          </Module>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild size="sm" variant="leaf">
            <Link to="/contact">Ask our team</Link>
          </Button>
        </div>
      </div>
    </>
  );
}

function Module({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode;
}) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <section className="rounded-3xl border border-border bg-card p-6">
      <h2 className="text-lg font-extrabold">{title}</h2>
      <div className="mt-4 space-y-2.5">
        {hasChildren ? children : <p className="text-sm text-muted-foreground">{empty}</p>}
      </div>
    </section>
  );
}

function Row({
  title,
  subtitle,
  badge,
}: {
  title: string;
  subtitle: string;
  badge: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background p-4">
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary capitalize">
        {badge.replace(/_/g, " ")}
      </span>
    </div>
  );
}
