-- Add admin update policy for courses table
CREATE POLICY "Admins can update any course"
ON public.courses
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));