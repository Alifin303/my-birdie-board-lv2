-- Create a security definer function to check if a user's email matches a complimentary account
CREATE OR REPLACE FUNCTION public.is_complimentary_email(check_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.complimentary_accounts
    WHERE LOWER(email) = LOWER(check_email)
  )
$$;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can check their own email or admins can view all" ON public.complimentary_accounts;

-- Create a simpler policy - admins can see all, regular users can only see their own email match
-- We'll use a function approach that doesn't query auth.users directly
CREATE POLICY "Admins can view all complimentary accounts"
ON public.complimentary_accounts
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- For regular users checking their own email, we'll handle this in application code
-- by passing the email from the authenticated session rather than querying auth.users in RLS