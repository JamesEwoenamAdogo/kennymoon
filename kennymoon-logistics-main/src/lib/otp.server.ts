/**
 * Server-only helper that issues a real Supabase one-time code and delivers it
 * with Resend (through the Lovable connector gateway) as a 6-digit code —
 * never a magic link.
 */

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

export interface IssueCodeResult {
  ok: boolean;
  message?: string;
}

interface IssueOptions {
  /** Only sign in accounts that already exist (staff + KM-code login). */
  existingOnly?: boolean;
  /** Profile details captured at sign-up for brand-new accounts. */
  metadata?: Record<string, string>;
}

export async function issueAndSendCode(
  rawEmail: string,
  options: IssueOptions = {},
): Promise<IssueCodeResult> {
  const email = rawEmail.trim().toLowerCase();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const existing = (list?.users ?? []).find((u) => (u.email ?? "").toLowerCase() === email);

  if (!existing) {
    if (options.existingOnly) {
      return { ok: false, message: "We couldn't find an account with that email." };
    }
    const { error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: options.metadata ?? {},
    });
    if (createError) {
      return { ok: false, message: "We couldn't create that account. Please try again." };
    }
  }

  const { data: link, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  const code = link?.properties?.email_otp;
  if (linkError || !code) {
    return { ok: false, message: "We couldn't generate your code. Please try again." };
  }

  const lovableKey = process.env["LOVABLE_API_KEY"];
  const resendKey = process.env["RESEND_API_KEY"];

  /** Last resort: let the backend mail its own one-time code. */
  const fallback = async (): Promise<IssueCodeResult> => {
    const { createClient } = await import("@supabase/supabase-js");
    const publicClient = createClient(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_PUBLISHABLE_KEY"]!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { error } = await publicClient.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    if (error) return { ok: false, message: "We couldn't email your code. Please try again." };
    return { ok: true };
  };

  if (!lovableKey || !resendKey) return fallback();

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#ffffff;padding:24px">
      <div style="max-width:520px;margin:0 auto;border:1px solid #e6e9e6;border-radius:16px;padding:28px">
        <p style="margin:0;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#6b7280">Kennymoon Int'l Ltd</p>
        <h1 style="margin:10px 0 6px;font-size:22px;color:#12351f">Your 6-digit code</h1>
        <p style="margin:0 0 20px;font-size:14px;color:#4b5563">Enter this code on the Kennymoon site to finish signing in. It expires in 10 minutes.</p>
        <p style="margin:0;font-size:34px;font-weight:800;letter-spacing:.34em;color:#12351f">${code}</p>
        <p style="margin:22px 0 0;font-size:12px;color:#6b7280">If you did not request this code, you can ignore this email.</p>
      </div>
    </div>`;

  const response = await fetch(`${GATEWAY_URL}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": resendKey,
    },
    body: JSON.stringify({
      from: "Kennymoon Int'l <onboarding@resend.dev>",
      to: [email],
      subject: `${code} is your Kennymoon code`,
      html,
      text: `Your Kennymoon 6-digit code is ${code}. It expires in 10 minutes.`,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`Resend send failed [${response.status}]: ${body}`);
    return fallback();
  }


  return { ok: true };
}
