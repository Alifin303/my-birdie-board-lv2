import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { courseDisplayName } from "@/lib/course-seo";
import { buildHandicapBreakdown, HandicapBreakdown, HandicapRoundInput } from "@/lib/whs";

const EMPTY: HandicapBreakdown = {
  entries: [],
  scoringRecordSize: 0,
  selection: null,
  average: null,
  index: null,
};

/**
 * Fetches all of a user's rounds with their tee rating/slope and returns the
 * full WHS breakdown, including which rounds count towards the index.
 */
export const useHandicapBreakdown = (userId?: string, enabled = true) => {
  return useQuery<HandicapBreakdown>({
    queryKey: ["handicap-breakdown", userId],
    enabled: Boolean(userId) && enabled,
    queryFn: async () => {
      const { data: rounds, error } = await supabase
        .from("rounds")
        .select(`id, date, gross_score, holes_played, course_id, tee_id, tee_name, courses:course_id(name)`)
        .eq("user_id", userId!)
        .order("date", { ascending: false });

      if (error) throw error;
      if (!rounds || rounds.length === 0) return EMPTY;

      const courseIds = Array.from(new Set(rounds.map((r) => r.course_id).filter(Boolean)));
      const { data: tees } = await supabase
        .from("course_tees")
        .select("course_id, tee_id, rating, slope")
        .in("course_id", courseIds);

      const teeMap = new Map<string, { rating: number | null; slope: number | null }>();
      (tees || []).forEach((t) => {
        teeMap.set(`${t.course_id}:${t.tee_id}`, { rating: t.rating, slope: t.slope });
      });

      const inputs: HandicapRoundInput[] = rounds
        .map((round) => {
          const tee = teeMap.get(`${round.course_id}:${round.tee_id}`);
          if (!tee || tee.rating == null || tee.slope == null) return null;
          return {
            id: round.id,
            date: round.date,
            grossScore: round.gross_score,
            holesPlayed: round.holes_played || 18,
            courseName: round.courses?.name ? courseDisplayName(round.courses.name) : "Unknown Course",
            teeName: round.tee_name || "Unknown Tee",
            rating: Number(tee.rating),
            slope: Number(tee.slope),
          } as HandicapRoundInput;
        })
        .filter(Boolean) as HandicapRoundInput[];

      return buildHandicapBreakdown(inputs);
    },
  });
};
