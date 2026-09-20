import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { CITY_HANDLING, RATES, RMB_RATE, WAREHOUSE } from "@/lib/site";

export default defineTool({
  name: "get_shipping_rates",
  title: "Get shipping rates and quote",
  description:
    "Return Kennymoon's current China-to-Nigeria sea and air freight rates, RMB rate, China warehouse address, and an optional Naira estimate for a given weight, mode and pickup city.",
  inputSchema: {
    mode: z.enum(["sea", "air"]).optional().describe("Freight mode to estimate."),
    weight_kg: z.number().positive().optional().describe("Chargeable weight in kilograms."),
    pickup_city: z
      .enum(["Lagos", "Onitsha", "Kano"])
      .optional()
      .describe("Nigerian pickup city for handling fees."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ mode, weight_kg, pickup_city }) => {
    const rates = {
      sea: { ...RATES.sea, currency: "NGN" },
      air: { ...RATES.air, currency: "NGN" },
      rmb_rate_ngn_per_yuan: RMB_RATE,
      city_handling_ngn: CITY_HANDLING,
      china_warehouse: WAREHOUSE,
    };

    let estimate: Record<string, number | string> | null = null;
    if (mode && weight_kg) {
      const rate = RATES[mode];
      const chargeable = Math.max(weight_kg, rate.minKg);
      const freight = chargeable * rate.perKg;
      const handling = pickup_city ? (CITY_HANDLING[pickup_city] ?? 0) : 0;
      estimate = {
        mode,
        chargeable_weight_kg: chargeable,
        freight_ngn: freight,
        handling_ngn: handling,
        total_ngn: freight + handling,
        transit: rate.transit,
      };
    }

    return {
      content: [{ type: "text", text: JSON.stringify({ rates, estimate }) }],
      structuredContent: { rates, estimate },
    };
  },
});
