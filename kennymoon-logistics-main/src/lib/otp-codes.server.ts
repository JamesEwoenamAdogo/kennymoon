/**
 * Server-only 6-digit email code store + Resend delivery.
 * Codes live in public.otps, expire after 10 minutes, one active code per
 * email + purpose, and are invalidated as soon as they are used.
 */

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const FROM = "Kennymoon INT'L LTD <support@kennymoonintl.com>";
const FALLBACK_FROM = "Kennymoon INT'L LTD <onboarding@resend.dev>";

export type OtpPurpose = "signup" | "admin_invite";

export interface SendResult {
  ok: boolean;
  message?: string;
}

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

function sixDigits(): string {
  return String(Math.floor(Math.random() * 900000) + 100000);
}

function shell(heading: string, intro: string, code: string) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#ffffff;padding:24px">
    <div style="max-width:520px;margin:0 auto;border:1px solid #e6e9e6;border-radius:16px;padding:28px">
      <p style="margin:0;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#6b7280">Kennymoon Int'l Ltd</p>
      <h1 style="margin:10px 0 6px;font-size:22px;color:#12351f">${heading}</h1>
      <p style="margin:0 0 20px;font-size:14px;color:#4b5563">${intro}</p>
      <p style="margin:0;font-size:34px;font-weight:800;letter-spacing:.34em;color:#12351f">${code}</p>
      <p style="margin:22px 0 0;font-size:12px;color:#6b7280">This code expires in 10 minutes. If you did not request it, ignore this email.</p>
    </div>
  </div>`;
}

async function deliver(email: string, purpose: OtpPurpose, code: string): Promise<SendResult> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const resendKey = process.env["RESEND_API_KEY"];
  if (!lovableKey || !resendKey) {
    return { ok: false, message: "Email sending is not configured yet." };
  }

  const subject =
    purpose === "signup"
      ? `Verify your Kennymoon Account - OTP: ${code}`
      : "You've been invited as Admin at Kennymoon";
  const html =
    purpose === "signup"
      ? shell(
          "Your verification code",
          `Your verification code is: <strong>${code}</strong>. It expires in 10 minutes.`,
          code,
        )
      : shell(
          "You've been invited as an Admin",
          `You have been invited. Your verification code is: <strong>${code}</strong>. Enter it to activate your admin access.`,
          code,
        );

  const post = (from: string) =>
    fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": resendKey,
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject,
        html,
        text: `Your Kennymoon verification code is ${code}. It expires in 10 minutes.`,
      }),
    });

  let response = await post(FROM);
  if (!response.ok) {
    const body = await response.text();
    console.error(`Resend send failed [${response.status}]: ${body}`);
    // The branded sending domain may still be pending verification.
    response = await post(FALLBACK_FROM);
    if (!response.ok) {
      const second = await response.text();
      console.error(`Resend fallback send failed [${response.status}]: ${second}`);
      return {
        ok: false,
        message: "We couldn't email your code. Please try again in a moment.",
      };
    }
  }
  return { ok: true };
}

/** Creates (or re-sends) a code for this email + purpose and emails it. */
export async function issueCode(
  rawEmail: string,
  purpose: OtpPurpose,
  metadata: Record<string, unknown> = {},
): Promise<SendResult> {
  const email = rawEmail.trim().toLowerCase();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: latest } = await supabaseAdmin
    .from("otps")
    .select("created_at")
    .eq("email", email)
    .eq("purpose", purpose)
    .eq("is_verified", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latest && Date.now() - new Date(latest.created_at).getTime() < RESEND_COOLDOWN_MS) {
    const wait = Math.ceil(
      (RESEND_COOLDOWN_MS - (Date.now() - new Date(latest.created_at).getTime())) / 1000,
    );
    return { ok: false, message: `Please wait ${wait}s before requesting another code.` };
  }

  // One active code per email + purpose.
  await supabaseAdmin.from("otps").delete().eq("email", email).eq("purpose", purpose);

  const code = sixDigits();
  const { error } = await supabaseAdmin.from("otps").insert({
    email,
    otp_code: code,
    purpose,
    metadata: metadata as never,
    expires_at: new Date(Date.now() + CODE_TTL_MS).toISOString(),
  });
  if (error) return { ok: false, message: "We couldn't create your code. Please try again." };

  const sent = await deliver(email, purpose, code);
  if (!sent.ok) {
    await supabaseAdmin.from("otps").delete().eq("email", email).eq("purpose", purpose);
  }
  return sent;
}

export interface VerifyResult {
  ok: boolean;
  message?: string;
  metadata?: Record<string, unknown>;
}

/** Checks a code, then invalidates it. */
export async function consumeCode(
  rawEmail: string,
  purpose: OtpPurpose,
  rawCode: string,
): Promise<VerifyResult> {
  const email = rawEmail.trim().toLowerCase();
  const code = rawCode.trim();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: row } = await supabaseAdmin
    .from("otps")
    .select("id, otp_code, expires_at, is_verified")
    .eq("email", email)
    .eq("purpose", purpose)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!row || row.is_verified) {
    return { ok: false, message: "We couldn't find an active code. Please request a new one." };
  }
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await supabaseAdmin.from("otps").delete().eq("id", row.id);
    return { ok: false, message: "That code has expired. Please request a new one." };
  }
  if (row.otp_code !== code) {
    return { ok: false, message: "That code is not correct. Please check and try again." };
  }

  const { data: full } = await supabaseAdmin
    .from("otps")
    .select("metadata")
    .eq("id", row.id)
    .maybeSingle();

  await supabaseAdmin.from("otps").update({ is_verified: true }).eq("id", row.id);
  await supabaseAdmin.from("otps").delete().eq("id", row.id);

  return { ok: true, metadata: (full?.metadata as Record<string, unknown>) ?? {} };
}
