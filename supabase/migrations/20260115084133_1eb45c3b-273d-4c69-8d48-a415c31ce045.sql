-- Drop the restrictive policy we just added
DROP POLICY IF EXISTS "Users can check their own email in complimentary accounts" ON public.complimentary_accounts;

-- Create a new policy that allows:
-- 1. Admins to see all complimentary accounts (for admin dashboard)
-- 2. Users to check if their own email is in the table (for subscription checks)
CREATE POLICY "Users can check their own email or admins can view all"
ON public.complimentary_accounts
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    auth.uid() IS NOT NULL 
    AND LOWER(email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
  )
);