CREATE TABLE public.shipping_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  pickup_city text NOT NULL DEFAULT 'Onitsha',
  item_details text NOT NULL,
  mode text NOT NULL DEFAULT 'sea',
  weight_kg numeric,
  status text NOT NULL DEFAULT 'received',
  staff_notified boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.shipping_requests TO anon;
GRANT SELECT, INSERT ON public.shipping_requests TO authenticated;
GRANT ALL ON public.shipping_requests TO service_role;

ALTER TABLE public.shipping_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can submit a shipping request"
  ON public.shipping_requests FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "own shipping requests are visible"
  ON public.shipping_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.recipients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  city text,
  address text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipients TO authenticated;
GRANT ALL ON public.recipients TO service_role;

ALTER TABLE public.recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own recipients"
  ON public.recipients FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_shipping_requests_updated_at BEFORE UPDATE ON public.shipping_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recipients_updated_at BEFORE UPDATE ON public.recipients
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();