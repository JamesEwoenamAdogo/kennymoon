import { createServerFn } from "@tanstack/react-start";

/**
 * Live market USD → NGN rate for air freight pricing. Falls back to the rate
 * a Super Admin saved in the portal when the market feed is unreachable.
 */
export const getUsdToNgn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD", {
      headers: { Accept: "application/json" },
    });
    if (response.ok) {
      const body = (await response.json()) as { rates?: Record<string, number> };
      const rate = Number(body.rates?.["NGN"] ?? 0);
      if (rate > 0) return { rate, source: "market" as const };
    }
  } catch (error) {
    console.error("FX feed unavailable", error);
  }

  const { createClient } = await import("@supabase/supabase-js");
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const client = createClient(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });

  const { data } = await client
    .from("fx_rate")
    .select("usd_to_ngn")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return { rate: Number(data?.usd_to_ngn ?? 0) || null, source: "saved" as const };
});
