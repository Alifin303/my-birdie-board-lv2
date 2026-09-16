CREATE OR REPLACE FUNCTION public.get_public_courses()
RETURNS TABLE (
  id integer,
  name text,
  city text,
  state text,
  latitude numeric,
  longitude numeric,
  par integer,
  tee_count integer,
  rounds_count integer,
  average_score numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.name,
    c.city,
    c.state,
    c.latitude,
    c.longitude,
    t.par::integer,
    COALESCE(t.tee_count, 0)::integer,
    COALESCE(r.rounds_count, 0)::integer,
    r.average_score
  FROM public.courses c
  LEFT JOIN (
    SELECT course_id,
           ROUND(AVG(par))::integer AS par,
           COUNT(*)::integer AS tee_count
    FROM public.course_tees
    WHERE par IS NOT NULL
    GROUP BY course_id
  ) t ON t.course_id = c.id
  LEFT JOIN (
    SELECT course_id,
           COUNT(*)::integer AS rounds_count,
           ROUND(AVG(gross_score)::numeric, 1) AS average_score
    FROM public.rounds
    WHERE gross_score IS NOT NULL
    GROUP BY course_id
  ) r ON r.course_id = c.id
  ORDER BY c.name;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_courses() TO anon, authenticated, service_role;