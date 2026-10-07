CREATE TABLE public.course_import_points (
  id bigserial PRIMARY KEY,
  lat numeric(6,1) NOT NULL,
  lng numeric(6,1) NOT NULL,
  searched_at timestamptz,
  results_found integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lat, lng)
);
GRANT ALL ON public.course_import_points TO service_role;
GRANT SELECT ON public.course_import_points TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.course_import_points_id_seq TO service_role;
ALTER TABLE public.course_import_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view import points" ON public.course_import_points
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.course_import_points (lat, lng)
SELECT DISTINCT round((latitude / 0.2)::numeric) * 0.2, round((longitude / 0.2)::numeric) * 0.2
FROM public.courses WHERE latitude IS NOT NULL AND longitude IS NOT NULL
ON CONFLICT DO NOTHING;