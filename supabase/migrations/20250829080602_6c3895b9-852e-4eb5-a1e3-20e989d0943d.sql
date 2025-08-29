-- Update the recalculate_all_handicaps function to use proper WHS calculation with course rating and slope
CREATE OR REPLACE FUNCTION public.recalculate_all_handicaps()
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
    user_rec RECORD;
    round_rec RECORD;
    score_differentials NUMERIC[];
    calculated_handicap NUMERIC;
    differentials_to_use INTEGER;
    best_differentials NUMERIC[];
    average_differential NUMERIC;
    adjusted_score NUMERIC;
    course_rating NUMERIC;
    slope_rating NUMERIC;
BEGIN
    -- Loop through all users in profiles table
    FOR user_rec IN SELECT id FROM public.profiles
    LOOP
        -- Reset array for each user
        score_differentials := ARRAY[]::NUMERIC[];
        
        -- Get all rounds for the user with course and tee data, ordered by date
        FOR round_rec IN 
            SELECT 
                r.gross_score, 
                r.holes_played,
                r.tee_id,
                ct.rating,
                ct.slope
            FROM public.rounds r
            LEFT JOIN public.courses c ON r.course_id = c.id
            LEFT JOIN public.course_tees ct ON c.id = ct.course_id AND r.tee_id = ct.tee_id
            WHERE r.user_id = user_rec.id 
            ORDER BY r.date DESC
        LOOP
            -- Use default values if course/tee data is missing
            course_rating := COALESCE(round_rec.rating, 72.0);
            slope_rating := COALESCE(round_rec.slope, 113);
            
            -- Adjust score for 9-hole rounds (WHS: double and add 1)
            IF COALESCE(round_rec.holes_played, 18) = 9 THEN
                adjusted_score := round_rec.gross_score * 2 + 1;
            ELSE
                adjusted_score := round_rec.gross_score;
            END IF;
            
            -- Calculate score differential using WHS formula: (Adjusted Gross Score - Course Rating) × (113 ÷ Slope Rating)
            score_differentials := array_append(score_differentials, 
                (adjusted_score - course_rating) * (113.0 / slope_rating));
        END LOOP;

        -- Only update if user has rounds
        IF array_length(score_differentials, 1) > 0 THEN
            -- Sort score differentials (lowest to highest)
            SELECT array_agg(differential ORDER BY differential) 
            INTO score_differentials 
            FROM unnest(score_differentials) AS differential;
            
            -- Determine how many differentials to use based on WHS rules
            CASE 
                WHEN array_length(score_differentials, 1) >= 20 THEN differentials_to_use := 8;
                WHEN array_length(score_differentials, 1) >= 15 THEN differentials_to_use := 6;
                WHEN array_length(score_differentials, 1) >= 10 THEN differentials_to_use := 4;
                WHEN array_length(score_differentials, 1) >= 5 THEN differentials_to_use := 3;
                ELSE differentials_to_use := 1;
            END CASE;
            
            -- Get the best differentials
            SELECT array_agg(differential) 
            INTO best_differentials 
            FROM (
                SELECT differential 
                FROM unnest(score_differentials) AS differential 
                ORDER BY differential 
                LIMIT differentials_to_use
            ) AS best;
            
            -- Calculate average of best differentials
            SELECT AVG(differential) INTO average_differential FROM unnest(best_differentials) AS differential;
            
            -- Calculate handicap index (average differential × 0.96)
            calculated_handicap := average_differential * 0.96;
            
            -- Cap the handicap at 54 and minimum at -5
            calculated_handicap := LEAST(54, GREATEST(-5, calculated_handicap));
            
            -- Update the user's handicap
            UPDATE public.profiles 
            SET 
                handicap = calculated_handicap,
                updated_at = now()
            WHERE id = user_rec.id;
        END IF;
    END LOOP;
END;
$function$;