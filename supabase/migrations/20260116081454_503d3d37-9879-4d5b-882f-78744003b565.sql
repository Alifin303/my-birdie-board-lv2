-- Allow admins to insert subscriptions (for complimentary access)
CREATE POLICY "Admins can insert subscriptions"
ON public.customer_subscriptions
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update subscriptions (for revoking complimentary access)
CREATE POLICY "Admins can update subscriptions"
ON public.customer_subscriptions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete subscriptions (for cleanup)
CREATE POLICY "Admins can delete subscriptions"
ON public.customer_subscriptions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));