-- Helper: is the current caller a Super Admin?
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'::app_role
  )
$$;

-- Promote an existing account to Super Admin by email. Callable only by a Super Admin.
CREATE OR REPLACE FUNCTION public.promote_to_super_admin(_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE target uuid;
BEGIN
  IF NOT public.is_super_admin(auth.uid()) THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Only a Super Admin can promote accounts.');
  END IF;

  SELECT id INTO target FROM auth.users WHERE lower(email) = lower(trim(_email)) LIMIT 1;
  IF target IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'message', 'No account with that email yet.');
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (target, 'super_admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN jsonb_build_object('ok', true, 'user_id', target, 'message', 'Promoted to Super Admin.');
END;
$$;

REVOKE ALL ON FUNCTION public.promote_to_super_admin(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.promote_to_super_admin(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated, service_role;

-- Super Admin override: full read/write on every application table.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'fx_rate','leads','orders','parcels','payments','procurement_requests','profiles',
    'rate_card','recipients','rmb_transactions','shipment_events','shipments',
    'shipping_requests','status_events','user_roles','warehouse_imports'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "super admin full access" ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY "super admin full access" ON public.%I AS PERMISSIVE FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()))',
      t
    );
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
  END LOOP;
END;
$$;