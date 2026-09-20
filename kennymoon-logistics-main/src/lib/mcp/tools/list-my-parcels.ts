import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_my_parcels",
  title: "List my pre-alerted parcels",
  description:
    "List the signed-in customer's pre-alerted parcels waiting at or heading to the Kennymoon China warehouse.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(20).describe("Maximum rows to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("parcels")
      .select("tracking_number, description, seller, quantity, expected_weight_kg, mode, status, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    return error
      ? { content: [{ type: "text", text: error.message }], isError: true }
      : {
          content: [{ type: "text", text: JSON.stringify(data ?? []) }],
          structuredContent: { parcels: data ?? [] },
        };
  },
});
