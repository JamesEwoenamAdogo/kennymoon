ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS km_code text;

CREATE OR REPLACE FUNCTION public.generate_km_code()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE candidate text;
BEGIN
  LOOP
    candidate := 'KM-' || lpad((floor(random() * 900000) + 100000)::text, 6, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE km_code = candidate);
  END LOOP;
  RETURN candidate;
END; $$;
REVOKE EXECUTE ON FUNCTION public.generate_km_code() FROM anon, authenticated, PUBLIC;

UPDATE public.profiles SET km_code = public.generate_km_code() WHERE km_code IS NULL;

ALTER TABLE public.profiles ALTER COLUMN km_code SET DEFAULT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_km_code_key ON public.profiles (upper(km_code));

CREATE OR REPLACE FUNCTION public.set_km_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.km_code IS NULL THEN
    NEW.km_code := public.generate_km_code();
  END IF;
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.set_km_code() FROM anon, authenticated, PUBLIC;

DROP TRIGGER IF EXISTS profiles_set_km_code ON public.profiles;
CREATE TRIGGER profiles_set_km_code BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_km_code();