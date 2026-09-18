/**
 * World Handicap System (WHS) core rules — shared by the dashboard,
 * the handicap card and the handicap calculation breakdown.
 *
 * Key rules implemented here:
 *  - Scoring record = the MOST RECENT 20 acceptable scores only.
 *  - Handicap Index = average of the lowest N differentials in that record,
 *    where N (and any adjustment) comes from the WHS allocation table.
 *  - No 0.96 multiplier (that is the old pre-2020 USGA/CONGU method).
 */

export const MAX_SCORING_RECORD = 20;

export interface WhsSelection {
  /** How many of the lowest differentials are used */
  count: number;
  /** Adjustment applied to the average (in strokes) */
  adjustment: number;
}

/** WHS allocation table: number of differentials used, given the size of the scoring record. */
export const getWhsSelection = (roundsInRecord: number): WhsSelection | null => {
  const n = roundsInRecord;
  if (n < 3) return null;
  if (n === 3) return { count: 1, adjustment: -2 };
  if (n === 4) return { count: 1, adjustment: -1 };
  if (n === 5) return { count: 1, adjustment: 0 };
  if (n === 6) return { count: 2, adjustment: -1 };
  if (n <= 8) return { count: 2, adjustment: 0 };
  if (n <= 11) return { count: 3, adjustment: 0 };
  if (n <= 14) return { count: 4, adjustment: 0 };
  if (n <= 16) return { count: 5, adjustment: 0 };
  if (n <= 18) return { count: 6, adjustment: 0 };
  if (n === 19) return { count: 7, adjustment: 0 };
  return { count: 8, adjustment: 0 };
};

/** WHS score differential: (Adjusted Gross Score - Course Rating - PCC) x 113 / Slope */
export const scoreDifferential = (
  adjustedGrossScore: number,
  courseRating: number,
  slopeRating: number,
  pcc = 0
): number => (adjustedGrossScore - courseRating - pcc) * (113 / (slopeRating || 113));

/** Clamp to the WHS limits (max 54.0, plus handicaps allowed). */
export const capIndex = (value: number): number => Math.min(54, Math.max(-5, value));

export interface HandicapRoundInput {
  id: number;
  date: string;
  grossScore: number;
  holesPlayed: number;
  courseName: string;
  teeName: string;
  rating: number;
  slope: number;
}

export interface HandicapRoundEntry extends HandicapRoundInput {
  differential: number;
  /** Within the most recent 20 acceptable scores */
  inScoringRecord: boolean;
  /** One of the lowest differentials actually used in the index */
  counting: boolean;
}

export interface HandicapBreakdown {
  /** All rounds, newest first */
  entries: HandicapRoundEntry[];
  /** Rounds in the most recent 20 */
  scoringRecordSize: number;
  selection: WhsSelection | null;
  /** Average of the counting differentials (before adjustment) */
  average: number | null;
  index: number | null;
}

/**
 * Builds the full handicap breakdown from a player's rounds.
 * Rounds may be in any order; they are sorted newest first internally.
 */
export const buildHandicapBreakdown = (rounds: HandicapRoundInput[]): HandicapBreakdown => {
  const sorted = [...rounds].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const withDiff = sorted.map((round, i) => {
    // WHS 9-hole adjustment against 18-hole ratings: double the score and add 1
    const adjustedScore = round.holesPlayed === 9 ? round.grossScore * 2 + 1 : round.grossScore;
    const rating = round.holesPlayed === 9 && round.rating < 50 ? round.rating * 2 : round.rating;

    return {
      ...round,
      differential: scoreDifferential(adjustedScore, rating || 72, round.slope || 113),
      inScoringRecord: i < MAX_SCORING_RECORD,
      counting: false,
    } as HandicapRoundEntry;
  });

  const record = withDiff.filter((r) => r.inScoringRecord);
  const selection = getWhsSelection(record.length);

  if (!selection) {
    return {
      entries: withDiff,
      scoringRecordSize: record.length,
      selection: null,
      average: null,
      index: null,
    };
  }

  const best = [...record]
    .sort((a, b) => a.differential - b.differential)
    .slice(0, selection.count);

  const bestIds = new Set(best.map((r) => r.id));
  withDiff.forEach((r) => {
    r.counting = r.inScoringRecord && bestIds.has(r.id);
  });

  const average = best.reduce((sum, r) => sum + r.differential, 0) / best.length;
  const index = capIndex(average + selection.adjustment);

  return {
    entries: withDiff,
    scoringRecordSize: record.length,
    selection,
    average,
    index,
  };
};

/**
 * Replays a player's rounds chronologically and returns the handicap index
 * that would have been in force after each round (null until 3 rounds are in).
 * Keys the result by round id so it can be joined back onto the entries.
 */
export const buildHandicapProgression = (
  rounds: HandicapRoundInput[]
): Map<number, number | null> => {
  const chronological = [...rounds].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const result = new Map<number, number | null>();
  const record: number[] = []; // differentials, oldest first

  for (const round of chronological) {
    const adjustedScore = round.holesPlayed === 9 ? round.grossScore * 2 + 1 : round.grossScore;
    const rating = round.holesPlayed === 9 && round.rating < 50 ? round.rating * 2 : round.rating;
    record.push(scoreDifferential(adjustedScore, rating || 72, round.slope || 113));

    // Only the most recent 20 scores ever count towards the index
    const window = record.slice(-MAX_SCORING_RECORD);
    const selection = getWhsSelection(window.length);
    if (!selection) {
      result.set(round.id, null);
      continue;
    }
    const best = [...window].sort((a, b) => a - b).slice(0, selection.count);
    const average = best.reduce((sum, d) => sum + d, 0) / best.length;
    result.set(round.id, Number(capIndex(average + selection.adjustment).toFixed(1)));
  }

  return result;
};

export const formatIndex = (value: number): string =>
  value < 0 ? `+${Math.abs(value).toFixed(1)}` : value.toFixed(1);

export const formatDifferential = (value: number): string =>
  value < 0 ? `+${Math.abs(value).toFixed(1)}` : value.toFixed(1);
