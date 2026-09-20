CREATE TABLE public.otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  otp_code text NOT NULL,
  purpose text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  expires_at timestamptz NOT NULL,
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX otps_email_purpose_idx ON public.otps (lower(email), purpose, created_at DESC);

GRANT ALL ON public.otps TO service_role;

ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can read otps" ON public.otps
  FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()));