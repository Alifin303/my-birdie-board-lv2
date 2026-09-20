ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS country_code text;

CREATE INDEX IF NOT EXISTS courses_country_code_idx ON public.courses (country_code);