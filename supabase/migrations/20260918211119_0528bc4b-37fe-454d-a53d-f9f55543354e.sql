CREATE OR REPLACE FUNCTION public.recalculate_all_handicaps()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    user_rec RECORD;
    round_rec RECORD;
    score_differentials NUMERIC[];
    calculated_handicap NUMERIC;
    differentials_to_use INTEGER;
    adjustment NUMERIC;
    best_differentials NUMERIC[];
    average_differential NUMERIC;
    adjusted_score NUMERIC;
    course_rating NUMERIC;
    slope_rating NUMERIC;
    holes_played INTEGER;
    record_size INTEGER;
BEGIN
    FOR user_rec IN SELECT id FROM public.profiles
    LOOP
        score_differentials := ARRAY[]::NUMERIC[];

        -- Most recent 20 rounds only (WHS scoring record)
        FOR round_rec IN
            SELECT
                r.gross_score,
                r.holes_played,
                ct.rating,
                ct.slope
            FROM public.rounds r
            LEFT JOIN public.course_tees ct ON r.course_id = ct.course_id AND r.tee_id = ct.tee_id
            WHERE r.user_id = user_rec.id
            ORDER BY r.date DESC
            LIMIT 20
        LOOP
            course_rating := COALESCE(round_rec.rating, 72.0);
            slope_rating := COALESCE(round_rec.slope, 113);
            holes_played := COALESCE(round_rec.holes_played, 18);

            IF holes_played = 9 THEN
                adjusted_score := round_rec.gross_score * 2 + 1;
                IF course_rating < 50 THEN
                    course_rating := course_rating * 2;
                END IF;
            ELSE
                adjusted_score := round_rec.gross_score;
            END IF;

            score_differentials := array_append(score_differentials,
                (adjusted_score - course_rating) * (113.0 / slope_rating));
        END LOOP;

        record_size := COALESCE(array_length(score_differentials, 1), 0);

        IF record_size >= 3 THEN
            adjustment := 0;
            CASE
                WHEN record_size = 3 THEN differentials_to_use := 1; adjustment := -2;
                WHEN record_size = 4 THEN differentials_to_use := 1; adjustment := -1;
                WHEN record_size = 5 THEN differentials_to_use := 1;
                WHEN record_size = 6 THEN differentials_to_use := 2; adjustment := -1;
                WHEN record_size <= 8 THEN differentials_to_use := 2;
                WHEN record_size <= 11 THEN differentials_to_use := 3;
                WHEN record_size <= 14 THEN differentials_to_use := 4;
                WHEN record_size <= 16 THEN differentials_to_use := 5;
                WHEN record_size <= 18 THEN differentials_to_use := 6;
                WHEN record_size = 19 THEN differentials_to_use := 7;
                ELSE differentials_to_use := 8;
            END CASE;

            SELECT array_agg(differential)
            INTO best_differentials
            FROM (
                SELECT differential
                FROM unnest(score_differentials) AS differential
                ORDER BY differential
                LIMIT differentials_to_use
            ) AS best;

            SELECT AVG(differential) INTO average_differential FROM unnest(best_differentials) AS differential;

            calculated_handicap := average_differential + adjustment;
            calculated_handicap := LEAST(54, GREATEST(-5, calculated_handicap));

            UPDATE public.profiles
            SET handicap = calculated_handicap,
                updated_at = now()
            WHERE id = user_rec.id;
        END IF;
    END LOOP;
END;
$function$;