import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useStaffRoles } from "@/hooks/useStaffRoles";
import { canWarehouse, shortDateTime } from "@/lib/admin";
import { runWarehouseImport, type ImportRow } from "@/lib/orders-client";

export const Route = createFileRoute("/_authenticated/admin/imports")({
  component: AdminImports,
});

async function parseSheet(file: File): Promise<ImportRow[]> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  return json
    .map((row) => {
      const keys = Object.keys(row);
      const find = (name: string) =>
        keys.find((k) => k.trim().toLowerCase().replace(/\s+/g, "_") === name);
      const trackingKey = find("tracking_number") ?? keys[0];
      const cityKey = find("warehouse_city");
      const photoKey = find("photo_url");
      return {
        tracking_number: String(trackingKey ? row[trackingKey] ?? "" : "").trim(),
        warehouse_city: cityKey ? String(row[cityKey] ?? "").trim() || null : null,
        photo_url: photoKey ? String(row[photoKey] ?? "").trim() || null : null,
      };
    })
    .filter((r) => r.tracking_number.length > 0);
}

/** The arrivals.csv template staff export, populate and re-import. */
function downloadTemplate() {
  const csv = [
    "tracking_number,warehouse_city,photo_url",
    "SF1029384756CN,Yiwu,https://example.com/photos/SF1029384756CN.jpg",
    "7825930012885,Guangzhou,",
    "YT-88293011-NG,,https://example.com/photos/YT-88293011-NG.jpg",
    "",
  ].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "arrivals.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function AdminImports() {

  const { roles, userId } = useStaffRoles();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [defaultCity, setDefaultCity] = useState("Guangzhou, China");
  const [result, setResult] = useState<Awaited<ReturnType<typeof runWarehouseImport>> | null>(null);

  const history = useQuery({
    queryKey: ["warehouse-imports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("warehouse_imports")
        .select("id, file_name, row_count, matched_count, unmatched_count, unmatched_tracking_numbers, created_at")
        .order("created_at", { ascending: false })
        .limit(15);
      if (error) throw error;
      return data ?? [];
    },
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!userId) throw new Error("Not signed in");
      const rows = await parseSheet(file);
      if (rows.length === 0) {
        throw new Error("No tracking numbers found. Expected a 'tracking_number' column.");
      }
      const withCity = rows.map((row) => ({
        ...row,
        warehouse_city: row.warehouse_city ?? defaultCity ?? null,
      }));
      return runWarehouseImport({ fileName: file.name, rows: withCity, actorId: userId });
    },
    onSuccess: (summary) => {
      setResult(summary);
      toast.success(
        `${summary.rows} tracking number(s) received into the warehouse · ${summary.matched} already logged by a customer`,
      );
      void queryClient.invalidateQueries({ queryKey: ["warehouse-imports"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
      if (inputRef.current) inputRef.current.value = "";
    },
    onError: (error: Error) => toast.error(error.message),

  });

  if (!canWarehouse(roles)) {
    return <p className="text-sm text-muted-foreground">Your role cannot run warehouse imports.</p>;
  }

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-2xl font-extrabold">Warehouse import</h2>
        <p className="text-sm text-muted-foreground">
          Upload the daily arrivals sheet (.csv or .xlsx). Every tracking number is accepted and
          held as <strong>In warehouse</strong>. Numbers a customer already logged move forward on
          their dashboard right away; the rest wait until that customer enters the same number under
          “Track My Waybill”.
        </p>

      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload a sheet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
            Expected columns: <strong>tracking_number</strong> (required),{" "}
            <strong>warehouse_city</strong> (optional), <strong>photo_url</strong> (optional). The
            first column is used if no header matches.
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="city">Default warehouse city</Label>
              <Input
                id="city"
                value={defaultCity}
                onChange={(e) => setDefaultCity(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="file">Arrivals sheet</Label>
              <Input
                id="file"
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="mt-1"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) importMutation.mutate(file);
                }}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled={importMutation.isPending} onClick={() => inputRef.current?.click()}>
              <Upload className="mr-2 size-4" aria-hidden="true" />
              {importMutation.isPending ? "Importing…" : "Choose file"}
            </Button>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="mr-2 size-4" aria-hidden="true" />
              Download arrivals.csv template
            </Button>
          </div>

        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Import summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-muted p-3">
                <p className="text-2xl font-extrabold">{result.rows}</p>
                <p className="text-xs text-muted-foreground">tracking numbers received</p>
              </div>
              <div className="rounded-xl bg-leaf/15 p-3">
                <p className="text-2xl font-extrabold">{result.matched}</p>
                <p className="text-xs text-muted-foreground">
                  already logged by a customer ({result.movedToWarehouse} moved to In warehouse)
                </p>
              </div>
              <div className="rounded-xl bg-sky-500/15 p-3">
                <p className="text-2xl font-extrabold">{result.awaitingCustomer.length}</p>
                <p className="text-xs text-muted-foreground">
                  in warehouse, waiting for a customer to claim
                </p>
              </div>
            </div>
            {result.awaitingCustomer.length > 0 && (
              <div>
                <p className="font-semibold">Waiting to be claimed</p>
                <p className="text-xs text-muted-foreground">
                  These goods are in the warehouse. They appear on a customer dashboard as soon as
                  that customer enters the same number under “Track My Waybill”.
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {result.awaitingCustomer.map((number) => (
                    <span key={number} className="rounded-full bg-muted px-2 py-0.5 font-mono text-xs">
                      {number}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}


      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <FileSpreadsheet className="size-4 text-leaf" aria-hidden="true" />
          <CardTitle className="text-base">Import history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {(history.data ?? []).length === 0 && (
            <p className="text-muted-foreground">No imports logged yet.</p>
          )}
          {(history.data ?? []).map((row) => (
            <div key={row.id} className="border-b border-border/60 pb-3 last:border-0 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold">{row.file_name}</span>
                <span className="text-xs text-muted-foreground">{shortDateTime(row.created_at)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {row.row_count} received · {(row.unmatched_tracking_numbers ?? []).length} waiting to
                be claimed by a customer
              </p>
              {(row.unmatched_tracking_numbers ?? []).length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {(row.unmatched_tracking_numbers ?? []).slice(0, 20).map((number) => (

                    <span key={number} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                      {number}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
