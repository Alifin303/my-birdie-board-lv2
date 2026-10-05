-- Admins can view all bucket list entries (needed for the admin Users tab)
CREATE POLICY "Admins can view all bucket list entries"
ON public.bucket_list
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));