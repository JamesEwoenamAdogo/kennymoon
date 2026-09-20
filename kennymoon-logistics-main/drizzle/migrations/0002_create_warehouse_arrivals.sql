CREATE TABLE public.warehouse_arrivals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number text NOT NULL,
  tracking_key text GENERATED ALWAYS AS (upper(btrim(tracking_number))) STORED,
  warehouse_city text,
  photo_url text,
  imported_by uuid,
  claimed_by uuid,
  claimed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX warehouse_arrivals_key_uniq ON public.warehouse_arrivals (tracking_key);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.warehouse_arrivals TO authenticated;
GRANT ALL ON public.warehouse_arrivals TO service_role;

ALTER TABLE public.warehouse_arrivals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users can look up arrivals"
  ON public.warehouse_arrivals FOR SELECT TO authenticated USING (true);

CREATE POLICY "warehouse staff can add arrivals"
  ON public.warehouse_arrivals FOR INSERT TO authenticated
  WITH CHECK (public.can_warehouse(auth.uid()));

CREATE POLICY "arrivals can be updated by staff or claimed by owner"
  ON public.warehouse_arrivals FOR UPDATE TO authenticated
  USING (public.can_warehouse(auth.uid()) OR claimed_by IS NULL OR claimed_by = auth.uid())
  WITH CHECK (public.can_warehouse(auth.uid()) OR claimed_by = auth.uid());

CREATE POLICY "staff can remove arrivals"
  ON public.warehouse_arrivals FOR DELETE TO authenticated
  USING (public.can_warehouse(auth.uid()));

CREATE TRIGGER update_warehouse_arrivals_updated_at
  BEFORE UPDATE ON public.warehouse_arrivals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
