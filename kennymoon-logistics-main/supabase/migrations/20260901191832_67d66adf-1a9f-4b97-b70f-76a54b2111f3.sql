-- ENUMS
CREATE TYPE public.app_role AS ENUM ('super_admin','operations','warehouse','support');
CREATE TYPE public.goods_type AS ENUM ('normal','special_hk','express');
CREATE TYPE public.shipping_mode AS ENUM ('air','sea');
CREATE TYPE public.pickup_location AS ENUM ('lagos_ajao','lagos_tradefair','onitsha','kano');
CREATE TYPE public.order_status AS ENUM ('unavailable','in_warehouse','in_transit','arrived','payment_pending','payment_submitted','payment_confirmed','completed');
CREATE TYPE public.payment_method AS ENUM ('manual_transfer','card_online');
CREATE TYPE public.payment_status AS ENUM ('pending','confirmed','rejected');

-- ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id)
$$;

-- can change order status / handle payments
CREATE OR REPLACE FUNCTION public.can_operate(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('super_admin','operations'))
$$;

-- can run imports / attach photos
CREATE OR REPLACE FUNCTION public.can_warehouse(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('super_admin','operations','warehouse'))
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "super admin manages roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- PROFILES: business name
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_name text;
CREATE POLICY "staff can read profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- ORDERS
CREATE SEQUENCE IF NOT EXISTS public.ajao_code_seq START 28001;

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tracking_number text NOT NULL,
  description text NOT NULL,
  goods_type public.goods_type NOT NULL DEFAULT 'normal',
  shipping_mode public.shipping_mode NOT NULL DEFAULT 'sea',
  pickup_location public.pickup_location NOT NULL DEFAULT 'lagos_tradefair',
  internal_code text,
  status public.order_status NOT NULL DEFAULT 'unavailable',
  warehouse_city text,
  estimated_delivery_date date,
  photo_url text,
  weight_kg numeric,
  cbm numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX orders_tracking_idx ON public.orders (tracking_number);
CREATE INDEX orders_customer_idx ON public.orders (customer_id);
CREATE INDEX orders_status_idx ON public.orders (status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers read own orders" ON public.orders FOR SELECT TO authenticated USING (customer_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "customers log own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());
CREATE POLICY "customers update own orders" ON public.orders FOR UPDATE TO authenticated USING (customer_id = auth.uid()) WITH CHECK (customer_id = auth.uid());
CREATE POLICY "operations update orders" ON public.orders FOR UPDATE TO authenticated USING (public.can_operate(auth.uid())) WITH CHECK (public.can_operate(auth.uid()));
CREATE POLICY "warehouse update orders" ON public.orders FOR UPDATE TO authenticated USING (public.can_warehouse(auth.uid())) WITH CHECK (public.can_warehouse(auth.uid()));
CREATE POLICY "super admin deletes orders" ON public.orders FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- air is Lagos only + internal code generation
CREATE OR REPLACE FUNCTION public.orders_before_write()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.shipping_mode = 'air' AND NEW.pickup_location NOT IN ('lagos_ajao','lagos_tradefair') THEN
    RAISE EXCEPTION 'Air freight is available for Lagos pickup only';
  END IF;
  IF NEW.internal_code IS NULL AND NEW.pickup_location = 'lagos_ajao' THEN
    NEW.internal_code := 'KM' || nextval('public.ajao_code_seq')::text;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER orders_validate BEFORE INSERT OR UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.orders_before_write();

-- STATUS EVENTS
CREATE TABLE public.status_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  old_status public.order_status,
  new_status public.order_status NOT NULL,
  triggered_by text NOT NULL DEFAULT 'system',
  actor_id uuid,
  batch_id uuid,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX status_events_order_idx ON public.status_events (order_id);
GRANT SELECT, INSERT ON public.status_events TO authenticated;
GRANT ALL ON public.status_events TO service_role;
ALTER TABLE public.status_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own or staff status events" ON public.status_events FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.customer_id = auth.uid()));
CREATE POLICY "insert status events" ON public.status_events FOR INSERT TO authenticated
  WITH CHECK (public.can_warehouse(auth.uid()) OR EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.customer_id = auth.uid()));

-- WAREHOUSE IMPORTS
CREATE TABLE public.warehouse_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  imported_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  row_count integer NOT NULL DEFAULT 0,
  matched_count integer NOT NULL DEFAULT 0,
  unmatched_count integer NOT NULL DEFAULT 0,
  unmatched_tracking_numbers text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.warehouse_imports TO authenticated;
GRANT ALL ON public.warehouse_imports TO service_role;
ALTER TABLE public.warehouse_imports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read imports" ON public.warehouse_imports FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "warehouse creates imports" ON public.warehouse_imports FOR INSERT TO authenticated WITH CHECK (public.can_warehouse(auth.uid()) AND imported_by = auth.uid());

-- PAYMENTS
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  method public.payment_method NOT NULL DEFAULT 'manual_transfer',
  amount numeric,
  receipt_url text,
  reference text,
  status public.payment_status NOT NULL DEFAULT 'pending',
  admin_note text,
  confirmed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX payments_order_idx ON public.payments (order_id);
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own or staff payments" ON public.payments FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.customer_id = auth.uid()));
CREATE POLICY "customers submit payments" ON public.payments FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.customer_id = auth.uid()));
CREATE POLICY "operations review payments" ON public.payments FOR UPDATE TO authenticated
  USING (public.can_operate(auth.uid())) WITH CHECK (public.can_operate(auth.uid()));
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RATE CARD
CREATE TABLE public.rate_card (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mode public.shipping_mode NOT NULL,
  tier text NOT NULL,
  label text NOT NULL,
  rate numeric NOT NULL,
  currency text NOT NULL,
  unit text NOT NULL DEFAULT 'kg',
  min_cbm numeric,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mode, tier)
);
GRANT SELECT ON public.rate_card TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rate_card TO authenticated;
GRANT ALL ON public.rate_card TO service_role;
ALTER TABLE public.rate_card ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rates are public" ON public.rate_card FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "super admin edits rates" ON public.rate_card FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER update_rate_card_updated_at BEFORE UPDATE ON public.rate_card
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.rate_card (mode, tier, label, rate, currency, unit, min_cbm, sort_order) VALUES
  ('air','normal','Normal cargo (air)',8.6,'USD','kg',NULL,1),
  ('air','special_hk','Special goods — Hong Kong (air)',11.5,'USD','kg',NULL,2),
  ('air','express','Express (air)',13,'USD','kg',NULL,3),
  ('sea','onitsha','Onitsha',555000,'NGN','cbm',NULL,4),
  ('sea','lagos_tradefair','Lagos — Trade Fair',526000,'NGN','cbm',NULL,5),
  ('sea','lagos_ajao_small','Lagos — Ajao Estate (0.1–0.49 CBM)',478000,'NGN','cbm',0.1,6),
  ('sea','lagos_ajao_large','Lagos — Ajao Estate (0.5 CBM and above)',470000,'NGN','cbm',0.1,7),
  ('sea','kano','Kano',670000,'NGN','cbm',NULL,8);

-- FX RATE
CREATE TABLE public.fx_rate (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usd_to_ngn numeric NOT NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fx_rate TO anon;
GRANT SELECT, INSERT, UPDATE ON public.fx_rate TO authenticated;
GRANT ALL ON public.fx_rate TO service_role;
ALTER TABLE public.fx_rate ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fx is public" ON public.fx_rate FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "super admin edits fx" ON public.fx_rate FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER update_fx_rate_updated_at BEFORE UPDATE ON public.fx_rate
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.fx_rate (usd_to_ngn) VALUES (1650);
