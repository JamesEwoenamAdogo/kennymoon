import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_parcel_prealert",
  title: "Pre-alert a parcel",
  description:
    "Create a parcel pre-alert for the signed-in customer so Kennymoon's China warehouse can match the incoming package.",
  inputSchema: {
    tracking_number: z
      .string()
      .trim()
      .min(3)
      .describe("The Chinese courier tracking number given by the seller."),
    description: z.string().trim().min(2).describe("What is inside the parcel."),
    seller: z.string().trim().min(1).optional().describe("Seller or store name."),
    quantity: z.number().int().min(1).default(1).describe("Number of cartons or items."),
    expected_weight_kg: z
      .number()
      .positive()
      .optional()
      .describe("Expected weight in kilograms, if known."),
    mode: z.enum(["sea", "air"]).default("sea").describe("Preferred freight mode."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("parcels")
      .insert({ ...input, user_id: ctx.getUserId()! })
      .select();
    return error
      ? { content: [{ type: "text", text: error.message }], isError: true }
      : {
          content: [{ type: "text", text: JSON.stringify(data) }],
          structuredContent: { parcel: data?.[0] ?? null },
        };
  },
});
