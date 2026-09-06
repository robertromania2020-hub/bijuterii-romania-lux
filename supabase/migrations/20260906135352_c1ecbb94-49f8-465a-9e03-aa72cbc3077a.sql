REVOKE ALL ON FUNCTION public.apply_stripe_payment_event(text, text, text, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_stripe_payment_event(text, text, text, text, text, text) TO service_role;

REVOKE ALL ON FUNCTION public.bootstrap_admin_role() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;