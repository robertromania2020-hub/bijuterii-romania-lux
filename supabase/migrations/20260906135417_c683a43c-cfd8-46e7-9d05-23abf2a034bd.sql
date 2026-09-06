REVOKE ALL ON FUNCTION public.adjust_stock(text, text, integer, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_customers() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_users() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_order_status(text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_user_role(uuid, app_role, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.place_order(jsonb, jsonb, jsonb, text, text, text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.adjust_stock(text, text, integer, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_customers() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_users() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_order_status(text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_user_role(uuid, app_role, boolean) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb, jsonb, jsonb, text, text, text) TO authenticated, service_role;