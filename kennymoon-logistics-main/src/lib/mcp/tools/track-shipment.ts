import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "track_shipment",
  title: "Track a shipment",
  description:
    "Look up a Kennymoon shipment by its waybill number and return its current status plus its journey events.",
  inputSchema: {
    waybill: z.string().trim().min(3).describe("The waybill number, e.g. KM-2024-0142."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ waybill }) => {
    const supabase = supabaseAnon();
    const { data, error } = await supabase.rpc("track_shipment", { _waybill: waybill });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) {
      return {
        content: [{ type: "text", text: `No shipment found for waybill ${waybill}.` }],
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { result: data as unknown as Record<string, unknown> },
    };
  },
});
