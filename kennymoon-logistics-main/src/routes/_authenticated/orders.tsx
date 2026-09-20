import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Camera, PackagePlus, Wallet } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  AIR_PICKUPS,
  GOODS_TYPE_LABEL,
  KENNYMOON_BANK,
  MODE_LABEL,
  PICKUP_LABEL,
  STATUS_SHORT,
  STATUS_TONE,
  shortDate,
  type GoodsType,
  type PickupLocation,
  type ShippingMode,
} from "@/lib/admin";
import { fetchOrders, type OrderRow } from "@/lib/orders-client";
import { whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/orders")({
  component: MyOrders,
});

function MyOrders() {
  const queryClient = useQueryClient();
  const [tracking, setTracking] = useState("");
  const [description, setDescription] = useState("");
  const [goodsType, setGoodsType] = useState<GoodsType>("normal");
  const [mode, setMode] = useState<ShippingMode>("sea");
  const [pickup, setPickup] = useState<PickupLocation>("lagos_tradefair");
  const [weight, setWeight] = useState("");
  const [cbm, setCbm] = useState("");
  const [active, setActive] = useState<OrderRow | null>(null);
  const [step, setStep] = useState<"receive" | "pay">("receive");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);

  const orders = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => fetchOrders(),
    refetchInterval: 15000,
  });

  const logOrder = useMutation({
    mutationFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) throw new Error("Please sign in again.");
      if (mode === "air" && !AIR_PICKUPS.includes(pickup)) {
        throw new Error("Air freight is available for Lagos pickup only.");
      }
      const { data, error } = await supabase
        .from("orders")
        .insert({
          customer_id: userId,
          tracking_number: tracking.trim(),
          description: description.trim(),
          goods_type: goodsType,
          shipping_mode: mode,
          pickup_location: pickup,
          weight_kg: weight ? Number(weight) : null,
          cbm: cbm ? Number(cbm) : null,
        })
        .select("id")
        .single();
      if (error) throw error;

      await supabase.from("status_events").insert({
        order_id: data.id,
        new_status: "unavailable",
        triggered_by: "customer",
        actor_id: userId,
      });
    },
    onSuccess: () => {
      toast.success("Goods logged. We will update you the moment they reach our warehouse.");
      setTracking("");
      setDescription("");
      setWeight("");
      setCbm("");
      void queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const startReceive = useMutation({
    mutationFn: async (order: OrderRow) => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      const { error } = await supabase
        .from("orders")
        .update({ status: "payment_pending" })
        .eq("id", order.id);
      if (error) throw error;
      await supabase.from("status_events").insert({
        order_id: order.id,
        old_status: order.status,
        new_status: "payment_pending",
        triggered_by: "customer",
        actor_id: userId ?? null,
      });
    },
    onSuccess: () => {
      setStep("pay");
      void queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const submitPayment = useMutation({
    mutationFn: async (order: OrderRow) => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) throw new Error("Please sign in again.");

      let receiptPath: string | null = null;
      if (receipt) {
        const path = `${userId}/${order.id}-${Date.now()}-${receipt.name.replace(/\s+/g, "-")}`;
        const { error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(path, receipt, { upsert: false });
        if (uploadError) throw uploadError;
        receiptPath = path;
      }

      const { error } = await supabase.from("payments").insert({
        order_id: order.id,
        method: "manual_transfer",
        amount: amount ? Number(amount) : null,
        reference: reference.trim() || null,
        receipt_url: receiptPath,
      });
      if (error) throw error;

      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: "payment_submitted" })
        .eq("id", order.id);
      if (orderError) throw orderError;

      await supabase.from("status_events").insert({
        order_id: order.id,
        old_status: "payment_pending",
        new_status: "payment_submitted",
        triggered_by: "customer",
        actor_id: userId,
      });
    },
    onSuccess: () => {
      toast.success("Thank you. Our team will confirm your payment shortly.");
      setActive(null);
      setAmount("");
      setReference("");
      setReceipt(null);
      void queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rows = orders.data ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">My goods</h1>
          <p className="text-sm text-muted-foreground">
            Log every tracking number your supplier gives you and follow it from China to pickup.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </header>

      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <PackagePlus className="size-4 text-leaf" aria-hidden="true" />
          <CardTitle className="text-base">Log new goods</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            onSubmit={(e) => {
              e.preventDefault();
              logOrder.mutate();
            }}
          >
            <div>
              <Label htmlFor="tn">Supplier tracking number</Label>
              <Input
                id="tn"
                required
                placeholder="e.g. SF1029384756CN"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-1">
              <Label htmlFor="desc">What are the goods?</Label>
              <Textarea
                id="desc"
                required
                rows={1}
                placeholder="e.g. clothes, wigs, phone accessories"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="goods">Goods type</Label>
              <select
                id="goods"
                value={goodsType}
                onChange={(e) => setGoodsType(e.target.value as GoodsType)}
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {(Object.keys(GOODS_TYPE_LABEL) as GoodsType[]).map((key) => (
                  <option key={key} value={key}>
                    {GOODS_TYPE_LABEL[key]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="mode">Shipping mode</Label>
              <select
                id="mode"
                value={mode}
                onChange={(e) => {
                  const next = e.target.value as ShippingMode;
                  setMode(next);
                  if (next === "air" && !AIR_PICKUPS.includes(pickup)) setPickup("lagos_tradefair");
                }}
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="sea">{MODE_LABEL.sea}</option>
                <option value="air">{MODE_LABEL.air} (Lagos only)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="pickup">Pickup location</Label>
              <select
                id="pickup"
                value={pickup}
                onChange={(e) => setPickup(e.target.value as PickupLocation)}
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {(Object.keys(PICKUP_LABEL) as PickupLocation[])
                  .filter((key) => mode === "sea" || AIR_PICKUPS.includes(key))
                  .map((key) => (
                    <option key={key} value={key}>
                      {PICKUP_LABEL[key]}
                    </option>
                  ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="kg">Weight (kg)</Label>
                <Input id="kg" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="cbm">CBM</Label>
                <Input id="cbm" inputMode="decimal" value={cbm} onChange={(e) => setCbm(e.target.value)} className="mt-1" />
              </div>
            </div>
            <div className="flex items-end lg:col-span-3">
              <Button type="submit" disabled={logOrder.isPending}>
                {logOrder.isPending ? "Saving…" : "Log goods"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {orders.isLoading && <p className="text-sm text-muted-foreground">Loading your goods…</p>}
        {!orders.isLoading && rows.length === 0 && (
          <p className="text-sm text-muted-foreground">Nothing logged yet.</p>
        )}
        {rows.map((order) => (
          <div
            key={order.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <div className="min-w-[200px]">
              <p className="font-mono text-sm font-bold">{order.tracking_number}</p>
              <p className="text-sm text-muted-foreground">{order.description}</p>
              <p className="text-xs text-muted-foreground">
                {MODE_LABEL[order.shipping_mode]} · {PICKUP_LABEL[order.pickup_location]} · logged{" "}
                {shortDate(order.created_at)}
                {order.internal_code ? ` · ${order.internal_code}` : ""}
              </p>
            </div>
            <div className="text-right">
              <Badge className={`${STATUS_TONE[order.status]} border-0`}>
                {STATUS_SHORT[order.status]}
              </Badge>
              {order.status === "in_warehouse" && order.warehouse_city && (
                <p className="mt-1 text-xs text-muted-foreground">{order.warehouse_city}</p>
              )}
              {order.status === "in_transit" && order.estimated_delivery_date && (
                <p className="mt-1 text-xs text-muted-foreground">
                  ETA {shortDate(order.estimated_delivery_date)}
                </p>
              )}
              {order.status === "arrived" && (
                <Button
                  size="sm"
                  variant="leaf"
                  className="mt-2"
                  onClick={() => {
                    setActive(order);
                    setStep("receive");
                  }}
                >
                  Receive goods
                </Button>
              )}
              {order.status === "payment_pending" && (
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setActive(order);
                    setStep("pay");
                  }}
                >
                  Proceed to pay
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={active !== null} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-md">
          {active && step === "receive" && (
            <>
              <DialogHeader>
                <DialogTitle>Receive {active.tracking_number}</DialogTitle>
                <DialogDescription>
                  Your goods have arrived. Request a photo first if you want to see them, then pay to
                  release for pickup.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Button asChild variant="outline" className="w-full">
                  <a
                    href={whatsappLink(
                      `Hello Kennymoon, please send a photo of my goods. Tracking number: ${active.tracking_number}`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Camera className="mr-2 size-4" aria-hidden="true" /> Request a photo on WhatsApp
                  </a>
                </Button>
                <Button
                  className="w-full"
                  disabled={startReceive.isPending}
                  onClick={() => startReceive.mutate(active)}
                >
                  <Wallet className="mr-2 size-4" aria-hidden="true" /> Proceed to pay
                </Button>
              </div>
            </>
          )}

          {active && step === "pay" && (
            <>
              <DialogHeader>
                <DialogTitle>Pay for {active.tracking_number}</DialogTitle>
                <DialogDescription>
                  Manual transfer to the account below, then upload your receipt.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="rounded-xl bg-muted p-3 text-sm">
                  <p className="font-bold">{KENNYMOON_BANK.accountName}</p>
                  <p>{KENNYMOON_BANK.bank}</p>
                  <p className="font-mono">{KENNYMOON_BANK.accountNumber}</p>
                </div>
                <div>
                  <Label htmlFor="amt">Amount paid (₦)</Label>
                  <Input id="amt" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="ref">Transfer reference</Label>
                  <Input id="ref" required value={reference} onChange={(e) => setReference(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="rcpt">Upload receipt</Label>
                  <Input
                    id="rcpt"
                    type="file"
                    required
                    accept="image/*,application/pdf"
                    className="mt-1"
                    onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
                  />
                </div>
                <Button
                  className="w-full"
                  disabled={
                    submitPayment.isPending ||
                    !amount.trim() ||
                    !reference.trim() ||
                    !receipt
                  }
                  onClick={() => submitPayment.mutate(active)}
                >

                  {submitPayment.isPending ? "Submitting…" : "I have made payment"}
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <a
                    href={whatsappLink(
                      `Hello Kennymoon, I have paid for order ${active.tracking_number}. Sending proof of payment now.`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Send proof on WhatsApp instead
                  </a>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
