-- Create table for complimentary accounts
CREATE TABLE public.complimentary_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL UNIQUE,
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.complimentary_accounts ENABLE ROW LEVEL SECURITY;

-- Only admins can view complimentary accounts
CREATE POLICY "Admins can view complimentary accounts"
ON public.complimentary_accounts
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Only admins can insert complimentary accounts
CREATE POLICY "Admins can insert complimentary accounts"
ON public.complimentary_accounts
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Only admins can delete complimentary accounts
CREATE POLICY "Admins can delete complimentary accounts"
ON public.complimentary_accounts
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Insert existing complimentary emails
INSERT INTO public.complimentary_accounts (email, notes) VALUES
('alastair.finlayson93@gmail.com', 'Original complimentary account'),
('alastair_finlayson@hotmail.com', 'Original complimentary account'),
('ewelina@koendu.pl', 'Original complimentary account'),
('ewelina_was@hotmail.com', 'Original complimentary account'),
('oliagolf56@gmail.com', 'Original complimentary account'),
('driscoll_213@hotmail.com', 'Original complimentary account'),
('mark.nmg@secure.media', 'Original complimentary account');