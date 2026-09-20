import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  kmCode: z
    .string()
    .trim()
    .min(4)
    .max(24)
    .transform((v) => v.toUpperCase().replace(/\s+/g, "")),
});

const maskEmail = (email: string) => {
  const [user = "", domain = ""] = email.split("@");
  const head = user.slice(0, 2);
  return `${head}${"*".repeat(Math.max(user.length - 2, 1))}@${domain}`;
};

/**
 * Existing customers sign in with their Kennymoon registration code.
 * We resolve the code to the account email server-side (never exposed in full)
 * and send a one-time code to that email.
 */
export const startKmCodeSignIn = createServerFn({ method: "POST" })
  .inputValidator((data) => schema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const normalized = data.kmCode.startsWith("KM-") ? data.kmCode : `KM-${data.kmCode}`;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("km_code", normalized)
      .maybeSingle();

    if (!profile) {
      return { ok: false as const, message: "We couldn't find that registration number." };
    }

    const { data: userResult, error: userError } = await supabaseAdmin.auth.admin.getUserById(
      profile.id,
    );
    const email = userResult?.user?.email;
    if (userError || !email) {
      return {
        ok: false as const,
        message: "That account has no email on file. Please contact our team.",
      };
    }

    const { issueAndSendCode } = await import("@/lib/otp.server");
    const sent = await issueAndSendCode(email, { existingOnly: true });
    if (!sent.ok) {
      return {
        ok: false as const,
        message: sent.message ?? "We couldn't send your code. Please try again.",
      };
    }

    return { ok: true as const, email, maskedEmail: maskEmail(email) };
  });
