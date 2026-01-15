-- Allow authenticated users to check if their own email is in complimentary_accounts
CREATE POLICY "Users can check their own email in complimentary accounts"
ON public.complimentary_accounts
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND LOWER(email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
);