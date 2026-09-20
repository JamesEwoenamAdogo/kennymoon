-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  city text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, city)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone', NEW.raw_user_meta_data->>'city')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- shipments
CREATE TABLE public.shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  waybill text NOT NULL UNIQUE,
  description text NOT NULL,
  mode text NOT NULL DEFAULT 'sea',
  weight_kg numeric,
  cbm numeric,
  origin text NOT NULL DEFAULT 'Guangzhou, China',
  pickup_city text NOT NULL DEFAULT 'Lagos',
  status text NOT NULL DEFAULT 'received',
  eta date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipments TO authenticated;
GRANT ALL ON public.shipments TO service_role;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own shipments" ON public.shipments FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.shipment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  stage text NOT NULL,
  note text,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.shipment_events TO authenticated;
GRANT ALL ON public.shipment_events TO service_role;
ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own shipment events" ON public.shipment_events FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.shipments s WHERE s.id = shipment_id AND s.user_id = auth.uid()));

-- public waybill lookup
CREATE OR REPLACE FUNCTION public.track_shipment(_waybill text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'waybill', s.waybill,
    'description', s.description,
    'mode', s.mode,
    'weight_kg', s.weight_kg,
    'cbm', s.cbm,
    'origin', s.origin,
    'pickup_city', s.pickup_city,
    'status', s.status,
    'eta', s.eta,
    'created_at', s.created_at,
    'events', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('stage', e.stage, 'note', e.note, 'occurred_at', e.occurred_at) ORDER BY e.occurred_at)
      FROM public.shipment_events e WHERE e.shipment_id = s.id
    ), '[]'::jsonb)
  )
  FROM public.shipments s
  WHERE upper(trim(s.waybill)) = upper(trim(_waybill))
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.track_shipment(text) TO anon, authenticated;

-- parcels (pre-alerts)
CREATE TABLE public.parcels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tracking_number text NOT NULL,
  seller text,
  description text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  expected_weight_kg numeric,
  mode text NOT NULL DEFAULT 'sea',
  status text NOT NULL DEFAULT 'expected',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parcels TO authenticated;
GRANT ALL ON public.parcels TO service_role;
ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own parcels" ON public.parcels FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- rmb transactions
CREATE TABLE public.rmb_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_rmb numeric NOT NULL,
  rate numeric NOT NULL,
  amount_ngn numeric NOT NULL,
  purpose text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rmb_transactions TO authenticated;
GRANT ALL ON public.rmb_transactions TO service_role;
ALTER TABLE public.rmb_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own rmb" ON public.rmb_transactions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- procurement requests
CREATE TABLE public.procurement_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  product_url text,
  quantity integer NOT NULL DEFAULT 1,
  budget_ngn numeric,
  notes text,
  status text NOT NULL DEFAULT 'submitted',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.procurement_requests TO authenticated;
GRANT ALL ON public.procurement_requests TO service_role;
ALTER TABLE public.procurement_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own procurement" ON public.procurement_requests FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- leads
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  item_type text,
  weight_kg numeric,
  mode text,
  pickup_city text,
  message text,
  source text NOT NULL DEFAULT 'website',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.leads TO anon, authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit a lead" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);

-- demo shipments so public tracking works immediately
INSERT INTO public.shipments (id, waybill, description, mode, weight_kg, cbm, origin, pickup_city, status, eta, created_at)
VALUES
 ('11111111-1111-4111-8111-111111111111', 'KM-2026-004821', '12 cartons of ladies'' footwear', 'sea', 340, 2.4, 'Guangzhou, China', 'Lagos', 'shipped', '2026-09-18', now() - interval '31 days'),
 ('22222222-2222-4222-8222-222222222222', 'KM-2026-005107', '4 cartons of phone accessories', 'air', 46, 0.3, 'Yiwu, China', 'Onitsha', 'ready_for_pickup', '2026-08-09', now() - interval '11 days'),
 ('33333333-3333-4333-8333-333333333333', 'KM-2026-005338', '2 pallets of hair extensions', 'sea', 118, 1.1, 'Yiwu, China', 'Kano', 'consolidated', '2026-10-02', now() - interval '6 days');

INSERT INTO public.shipment_events (shipment_id, stage, note, occurred_at) VALUES
 ('11111111-1111-4111-8111-111111111111', 'purchased', 'Order confirmed with seller in Guangzhou.', now() - interval '31 days'),
 ('11111111-1111-4111-8111-111111111111', 'received', 'All 12 cartons received and weighed at our Guangzhou warehouse.', now() - interval '27 days'),
 ('11111111-1111-4111-8111-111111111111', 'consolidated', 'Consolidated into container KMU-4471 and sealed.', now() - interval '22 days'),
 ('11111111-1111-4111-8111-111111111111', 'shipped', 'Sailed from Nansha Port. Sea transit 40-60 days.', now() - interval '20 days'),
 ('22222222-2222-4222-8222-222222222222', 'purchased', 'Payment made to seller on your behalf.', now() - interval '11 days'),
 ('22222222-2222-4222-8222-222222222222', 'received', 'Received at Yiwu warehouse, 46kg confirmed.', now() - interval '9 days'),
 ('22222222-2222-4222-8222-222222222222', 'consolidated', 'Packed for air freight.', now() - interval '8 days'),
 ('22222222-2222-4222-8222-222222222222', 'shipped', 'Flew out of Shanghai Pudong.', now() - interval '5 days'),
 ('22222222-2222-4222-8222-222222222222', 'ready_for_pickup', 'Cleared customs. Ready at our Onitsha office, Ochanja.', now() - interval '1 days'),
 ('33333333-3333-4333-8333-333333333333', 'purchased', 'Seller confirmed stock in Yiwu.', now() - interval '6 days'),
 ('33333333-3333-4333-8333-333333333333', 'received', '2 pallets received, 118kg / 1.1cbm.', now() - interval '4 days'),
 ('33333333-3333-4333-8333-333333333333', 'consolidated', 'Awaiting next sailing, loading this week.', now() - interval '1 days');