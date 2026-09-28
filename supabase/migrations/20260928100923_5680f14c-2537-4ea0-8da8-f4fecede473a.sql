CREATE TABLE public.course_import_terms (
  id serial PRIMARY KEY,
  term text NOT NULL UNIQUE,
  region text NOT NULL,
  sort_order integer NOT NULL,
  searched_at timestamptz,
  results_found integer
);
GRANT SELECT ON public.course_import_terms TO authenticated;
GRANT ALL ON public.course_import_terms TO service_role;
GRANT USAGE ON SEQUENCE public.course_import_terms_id_seq TO service_role;
ALTER TABLE public.course_import_terms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view import terms" ON public.course_import_terms FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.course_import_candidates (
  api_course_id text PRIMARY KEY,
  status text NOT NULL DEFAULT 'pending',
  reason text,
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);
GRANT SELECT ON public.course_import_candidates TO authenticated;
GRANT ALL ON public.course_import_candidates TO service_role;
ALTER TABLE public.course_import_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view import candidates" ON public.course_import_candidates FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.course_import_usage (
  day date PRIMARY KEY,
  requests integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.course_import_usage TO authenticated;
GRANT ALL ON public.course_import_usage TO service_role;
ALTER TABLE public.course_import_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view import usage" ON public.course_import_usage FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.course_import_state (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  lock_until timestamptz,
  paused_reason text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.course_import_state TO authenticated;
GRANT ALL ON public.course_import_state TO service_role;
ALTER TABLE public.course_import_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view import state" ON public.course_import_state FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.course_import_state (id) VALUES (1);

-- Atomic single-flight lease
CREATE OR REPLACE FUNCTION public.acquire_course_import_lock(_seconds integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ok boolean;
BEGIN
  UPDATE course_import_state SET lock_until = now() + make_interval(secs => _seconds), updated_at = now()
  WHERE id = 1 AND (lock_until IS NULL OR lock_until < now())
  RETURNING true INTO ok;
  RETURN COALESCE(ok, false);
END $$;
REVOKE EXECUTE ON FUNCTION public.acquire_course_import_lock(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.acquire_course_import_lock(integer) TO service_role;

CREATE OR REPLACE FUNCTION public.add_course_import_usage(_n integer)
RETURNS integer LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO course_import_usage (day, requests) VALUES (current_date, _n)
  ON CONFLICT (day) DO UPDATE SET requests = course_import_usage.requests + _n
  RETURNING requests;
$$;
REVOKE EXECUTE ON FUNCTION public.add_course_import_usage(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.add_course_import_usage(integer) TO service_role;

INSERT INTO public.course_import_terms (term, region, sort_order)
SELECT t, 'UK & Ireland', ord FROM unnest(ARRAY[
'London','Surrey','Kent','Sussex','Essex','Hertfordshire','Berkshire','Buckinghamshire','Hampshire','Dorset','Devon','Cornwall','Somerset','Wiltshire','Gloucestershire','Oxfordshire','Bristol','Bath','Cheltenham','Reading','Guildford','Brighton','Southampton','Portsmouth','Bournemouth','Exeter','Plymouth','Norfolk','Suffolk','Cambridge','Norwich','Ipswich','Northampton','Bedford','Milton Keynes','Luton','Birmingham','Coventry','Warwick','Leicester','Nottingham','Derby','Lincoln','Stafford','Stoke','Worcester','Hereford','Shrewsbury','Wolverhampton','Telford','Manchester','Liverpool','Chester','Cheshire','Lancashire','Preston','Blackpool','Southport','Bolton','Wigan','Stockport','Leeds','Bradford','Sheffield','York','Harrogate','Hull','Doncaster','Huddersfield','Halifax','Wakefield','Scarborough','Newcastle','Sunderland','Durham','Middlesbrough','Northumberland','Carlisle','Cumbria','Kendal','Isle of Wight','Jersey','Guernsey','Isle of Man','Cardiff','Swansea','Newport','Wrexham','Anglesey','Conwy','Pembrokeshire','Carmarthen','Aberystwyth','Brecon','Llandudno','Edinburgh','Glasgow','Aberdeen','Dundee','Inverness','St Andrews','Fife','Ayrshire','Troon','Perth','Stirling','East Lothian','North Berwick','Gullane','Carnoustie','Moray','Dumfries','Borders','Highland','Belfast','Antrim','Down','Derry','Portrush','Newcastle County Down','Armagh','Fermanagh','Tyrone','Dublin','Cork','Galway','Limerick','Kerry','Killarney','Waterford','Wexford','Kilkenny','Wicklow','Kildare','Meath','Louth','Sligo','Donegal','Mayo','Clare','Tipperary','Offaly','Westmeath','Golf Club','Links','Park','Manor','Hall','Castle','Heath','Downs','Valley','Hill','Wood','Abbey','Priory','Lodge','Country Club'
]) WITH ORDINALITY AS x(t, ord)
ON CONFLICT (term) DO NOTHING;

INSERT INTO public.course_import_terms (term, region, sort_order)
SELECT t, 'Worldwide', 1000 + ord FROM unnest(ARRAY[
'Algarve','Portugal','Lisbon','Spain','Marbella','Malaga','Costa del Sol','Mallorca','Tenerife','Valencia','Barcelona','Madrid','France','Paris','Normandy','Bordeaux','Nice','Germany','Munich','Berlin','Hamburg','Netherlands','Amsterdam','Belgium','Brussels','Denmark','Copenhagen','Sweden','Stockholm','Gothenburg','Norway','Oslo','Finland','Italy','Rome','Milan','Tuscany','Switzerland','Austria','Czech','Prague','Poland','Turkey','Belek','Cyprus','Greece','Dubai','Abu Dhabi','Qatar','Morocco','Egypt','South Africa','Cape Town','Johannesburg','Durban','George','Kenya','Mauritius','India','Thailand','Bangkok','Phuket','Hua Hin','Vietnam','Malaysia','Singapore','Indonesia','Bali','Philippines','Japan','Tokyo','South Korea','China','Hong Kong','Australia','Sydney','Melbourne','Brisbane','Perth Australia','Adelaide','Gold Coast','New Zealand','Auckland','Queenstown','Canada','Toronto','Vancouver','Montreal','Calgary','Ontario','British Columbia','Florida','Orlando','Miami','Naples','Tampa','Jacksonville','California','San Diego','Los Angeles','Palm Springs','San Francisco','Arizona','Scottsdale','Phoenix','Tucson','Las Vegas','Texas','Dallas','Houston','Austin','San Antonio','Georgia','Atlanta','South Carolina','Myrtle Beach','Hilton Head','North Carolina','Pinehurst','Virginia','New York','New Jersey','Pennsylvania','Ohio','Michigan','Illinois','Chicago','Wisconsin','Minnesota','Colorado','Denver','Utah','Oregon','Washington','Hawaii','Massachusetts','Boston','Connecticut','Maryland','Tennessee','Nashville','Kentucky','Alabama','Louisiana','Missouri','Indiana','Iowa','Kansas','Oklahoma','Nevada','New Mexico','Idaho','Montana','Mexico','Cancun','Los Cabos','Dominican Republic','Punta Cana','Jamaica','Barbados','Bahamas','Puerto Rico','Argentina','Brazil','Chile','Colombia'
]) WITH ORDINALITY AS x(t, ord)
ON CONFLICT (term) DO NOTHING;