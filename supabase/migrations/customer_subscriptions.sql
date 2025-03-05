
-- Create a table to store customer subscription information
CREATE TABLE IF NOT EXISTS public.customer_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  customer_id TEXT NOT NULL,
  subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'created',
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  price_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create unique constraint on user_id
CREATE UNIQUE INDEX IF NOT EXISTS customer_subscriptions_user_id_idx ON public.customer_subscriptions (user_id);

-- Enable RLS
ALTER TABLE public.customer_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for selecting own records
CREATE POLICY "Users can view their own subscription data"
  ON public.customer_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for inserting records
CREATE POLICY "Users can insert their own subscription data"
  ON public.customer_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy for updating own records
CREATE POLICY "Users can update their own subscription data"
  ON public.customer_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add a trigger to the table to update the updated_at column
CREATE TRIGGER update_customer_subscriptions_updated_at
  BEFORE UPDATE ON public.customer_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
