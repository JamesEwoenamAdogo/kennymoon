REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_operate(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_warehouse(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.orders_before_write() FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_operate(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_warehouse(uuid) TO authenticated;