UPDATE public.rounds
SET handicap_at_posting = CASE WHEN COALESCE(holes_played, 18) = 9
  THEN (gross_score - net_score) * 2
  ELSE (gross_score - net_score) END
WHERE handicap_at_posting IS NULL
  AND net_score IS NOT NULL
  AND gross_score IS NOT NULL;