INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'super_admin'::public.app_role
FROM auth.users u
WHERE lower(u.email) IN ('kennymoon2002@gmail.com','opeebenezer473@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;