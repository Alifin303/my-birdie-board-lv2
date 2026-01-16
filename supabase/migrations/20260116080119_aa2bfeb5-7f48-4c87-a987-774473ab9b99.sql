-- Drop and recreate the function to ensure it's properly exposed to PostgREST
DROP FUNCTION IF EXISTS public.is_complimentary_email(text);

-- Create the function with explicit grants
CREATE OR REPLACE FUNCTION public.is_complimentary_email(check_email text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.complimentary_accounts
    WHERE LOWER(email) = LOWER(check_email)
  );
END;
$$;

-- Explicitly grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_complimentary_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_complimentary_email(text) TO anon;
GRANT EXECUTE ON FUNCTION public.is_complimentary_email(text) TO service_role;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';