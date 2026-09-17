CREATE TABLE public.bucket_list (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id integer NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  added_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

GRANT SELECT, INSERT, DELETE ON public.bucket_list TO authenticated;
GRANT ALL ON public.bucket_list TO service_role;

ALTER TABLE public.bucket_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bucket list"
ON public.bucket_list FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own bucket list"
ON public.bucket_list FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own bucket list"
ON public.bucket_list FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX bucket_list_user_id_idx ON public.bucket_list(user_id);