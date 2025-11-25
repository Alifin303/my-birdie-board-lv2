-- Add Stableford scoring columns to rounds table
ALTER TABLE public.rounds
ADD COLUMN stableford_gross integer,
ADD COLUMN stableford_net integer;