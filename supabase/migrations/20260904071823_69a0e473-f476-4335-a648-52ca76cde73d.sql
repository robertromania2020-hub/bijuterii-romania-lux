CREATE OR REPLACE FUNCTION public.admin_users()
RETURNS TABLE(user_id uuid, email text, first_name text, last_name text, created_at timestamptz, roles text[])
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT u.id, u.email,
         COALESCE(p.first_name, ''), COALESCE(p.last_name, ''), u.created_at,
         COALESCE(array_agg(r.role::text) FILTER (WHERE r.role IS NOT NULL), '{}')
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.user_id = u.id
    LEFT JOIN public.user_roles r ON r.user_id = u.id
   WHERE public.has_role(auth.uid(), 'admin')
   GROUP BY u.id, u.email, p.first_name, p.last_name, u.created_at
   ORDER BY u.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.set_user_role(p_user_id uuid, p_role app_role, p_grant boolean)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Nu ai permisiunea de a gestiona roluri.' USING HINT = 'APP';
  END IF;
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilizator invalid.' USING HINT = 'APP';
  END IF;

  IF p_grant THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (p_user_id, p_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    IF p_role = 'admin' AND p_user_id = auth.uid() THEN
      RAISE EXCEPTION 'Nu îți poți revoca propriul rol de administrator.' USING HINT = 'APP';
    END IF;
    IF p_role = 'admin'
       AND (SELECT count(*) FROM public.user_roles WHERE role = 'admin') <= 1 THEN
      RAISE EXCEPTION 'Trebuie să existe cel puțin un administrator.' USING HINT = 'APP';
    END IF;
    DELETE FROM public.user_roles WHERE user_id = p_user_id AND role = p_role;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_users() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_users() TO authenticated;
REVOKE ALL ON FUNCTION public.set_user_role(uuid, app_role, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_user_role(uuid, app_role, boolean) TO authenticated;