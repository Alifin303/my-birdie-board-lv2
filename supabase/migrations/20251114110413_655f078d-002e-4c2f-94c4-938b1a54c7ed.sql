-- Add admin access policy for customer_subscriptions table
CREATE POLICY "Admins can view all subscriptions"
ON public.customer_subscriptions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));