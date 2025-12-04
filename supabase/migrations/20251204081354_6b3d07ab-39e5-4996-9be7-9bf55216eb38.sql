-- Fix: Add SECURITY DEFINER to bypass RLS when updating all rounds
CREATE OR REPLACE FUNCTION public.recalculate_all_stableford_scores()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
    round_rec RECORD;
    hole_rec RECORD;
    tee_rec RECORD;
    gross_stableford INTEGER;
    net_stableford INTEGER;
    hole_strokes INTEGER;
    hole_par INTEGER;
    hole_handicap INTEGER;
    course_handicap INTEGER;
    handicap_strokes INTEGER;
    gross_points INTEGER;
    net_points INTEGER;
    user_handicap NUMERIC;
    parsed_hole_scores JSONB;
BEGIN
    -- Loop through all rounds that have hole_scores
    FOR round_rec IN 
        SELECT r.id, r.user_id, r.tee_id, r.course_id, r.hole_scores
        FROM public.rounds r
        WHERE r.hole_scores IS NOT NULL
    LOOP
        gross_stableford := 0;
        net_stableford := 0;
        course_handicap := 0;
        
        -- Parse hole_scores - handle both string and jsonb formats
        BEGIN
            IF jsonb_typeof(round_rec.hole_scores) = 'string' THEN
                -- It's stored as a JSON string, need to parse it
                parsed_hole_scores := (round_rec.hole_scores #>> '{}')::jsonb;
            ELSE
                parsed_hole_scores := round_rec.hole_scores;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- Skip this round if we can't parse the hole scores
            CONTINUE;
        END;
        
        -- Get user's handicap at the time (or current if not stored)
        SELECT COALESCE(r.handicap_at_posting, p.handicap, 0)
        INTO user_handicap
        FROM public.rounds r
        LEFT JOIN public.profiles p ON p.id = r.user_id
        WHERE r.id = round_rec.id;
        
        -- Get tee data for course handicap calculation
        SELECT rating, slope, par INTO tee_rec
        FROM public.course_tees
        WHERE course_id = round_rec.course_id 
          AND tee_id = round_rec.tee_id
        LIMIT 1;
        
        -- Calculate course handicap using WHS formula
        IF tee_rec.slope IS NOT NULL AND tee_rec.rating IS NOT NULL AND tee_rec.par IS NOT NULL THEN
            course_handicap := ROUND(user_handicap * (tee_rec.slope::NUMERIC / 113) + (tee_rec.rating - tee_rec.par));
            course_handicap := GREATEST(0, course_handicap);
        END IF;
        
        -- Loop through each hole score in the JSON array
        FOR hole_rec IN SELECT * FROM jsonb_array_elements(parsed_hole_scores)
        LOOP
            hole_strokes := COALESCE((hole_rec.value->>'strokes')::INTEGER, 0);
            hole_par := COALESCE((hole_rec.value->>'par')::INTEGER, 4);
            hole_handicap := COALESCE((hole_rec.value->>'handicap')::INTEGER, (hole_rec.value->>'hole')::INTEGER);
            
            -- Skip if no strokes recorded
            IF hole_strokes = 0 THEN
                CONTINUE;
            END IF;
            
            -- Calculate gross Stableford points
            gross_points := CASE
                WHEN hole_strokes <= hole_par - 2 THEN 4  -- Eagle or better
                WHEN hole_strokes = hole_par - 1 THEN 3   -- Birdie
                WHEN hole_strokes = hole_par THEN 2       -- Par
                WHEN hole_strokes = hole_par + 1 THEN 1   -- Bogey
                ELSE 0                                     -- Double bogey or worse
            END;
            gross_stableford := gross_stableford + gross_points;
            
            -- Calculate handicap strokes for this hole
            IF hole_handicap <= course_handicap THEN
                IF course_handicap > 18 AND hole_handicap <= (course_handicap - 18) THEN
                    handicap_strokes := 2;  -- Gets 2 strokes on this hole
                ELSE
                    handicap_strokes := 1;  -- Gets 1 stroke on this hole
                END IF;
            ELSE
                handicap_strokes := 0;
            END IF;
            
            -- Calculate net Stableford points (strokes minus handicap strokes)
            net_points := CASE
                WHEN (hole_strokes - handicap_strokes) <= hole_par - 2 THEN 4
                WHEN (hole_strokes - handicap_strokes) = hole_par - 1 THEN 3
                WHEN (hole_strokes - handicap_strokes) = hole_par THEN 2
                WHEN (hole_strokes - handicap_strokes) = hole_par + 1 THEN 1
                ELSE 0
            END;
            net_stableford := net_stableford + net_points;
        END LOOP;
        
        -- Update the round with calculated Stableford scores
        UPDATE public.rounds
        SET stableford_gross = gross_stableford,
            stableford_net = net_stableford,
            updated_at = now()
        WHERE id = round_rec.id;
    END LOOP;
END;
$function$;