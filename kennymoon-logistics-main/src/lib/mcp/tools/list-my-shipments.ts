import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_my_shipments",
  title: "List my shipments",
  description:
    "List the signed-in customer's Kennymoon shipments with waybill, mode, status, weight and ETA.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(20).describe("Maximum rows to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("shipments")
      .select("waybill, mode, status, origin, pickup_city, description, weight_kg, cbm, eta, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    return error
      ? { content: [{ type: "text", text: error.message }], isError: true }
      : {
          content: [{ type: "text", text: JSON.stringify(data ?? []) }],
          structuredContent: { shipments: data ?? [] },
        };
  },
});
