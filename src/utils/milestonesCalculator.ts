export type MilestoneType =
  | 'birdie'
  | 'eagle'
  | 'hole_in_one'
  | 'round'
  | 'course'
  | 'handicap'
  | 'score'
  | 'best_round'
  | 'stableford'
  | 'home_course'
  | 'course_best'
  | 'putts'
  | 'clean_card'
  | 'gir';

export interface Milestone {
  id: string;
  type: MilestoneType;
  title: string;
  description: string;
  date: string;
  value?: number;
}

export interface LockedMilestone {
  id: string;
  type: MilestoneType;
  title: string;
  hint: string;
  current: number;
  target: number;
}

export interface MilestoneProgress {
  unlocked: Milestone[];
  locked: LockedMilestone[];
  totalCount: number;
}

interface HoleScore {
  hole?: number;
  par: number;
  score?: number;
  strokes?: number;
  putts?: number;
  penalties?: number;
  gir?: boolean;
}

interface Round {
  id: number;
  date: string;
  gross_score: number;
  hole_scores?: HoleScore[] | string | null;
  holes_played?: number;
  course_id?: number;
  courses?: { id: number; name: string };
  stableford_gross?: number;
  handicap_at_posting?: number;
}

// Count-based ladders never run out: once the fixed tiers are exhausted they
// keep extending in fixed steps, so there is always a next trophy to chase.
interface Ladder {
  base: number[];
  step: number;
}

const BIRDIE_LADDER: Ladder = { base: [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 75, 100], step: 50 };
const EAGLE_LADDER: Ladder = { base: [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 75, 100], step: 25 };
const HOLE_IN_ONE_LADDER: Ladder = { base: [1, 5, 10, 15, 20, 25], step: 5 };
const ROUND_LADDER: Ladder = { base: [1, 5, 10, 25, 50, 100, 250, 500], step: 100 };
const COURSE_LADDER: Ladder = { base: [1, 5, 10, 25, 50, 100], step: 25 };

/** Tiers for a ladder, extended far enough to always sit ahead of `current`. */
function ladderTiers(ladder: Ladder, current: number): number[] {
  const tiers = [...ladder.base];
  let next = tiers[tiers.length - 1];
  while (next <= current + ladder.step) {
    next += ladder.step;
    tiers.push(next);
  }
  return tiers;
}

function isLadderTier(ladder: Ladder, value: number): boolean {
  return ladderTiers(ladder, value).includes(value);
}
const SCORE_MILESTONES = [120, 110, 100, 90, 80, 70];
const STABLEFORD_MILESTONES = [20, 25, 30, 32, 34, 36, 38, 40];
const HOME_COURSE_LADDER: Ladder = { base: [5, 10, 25, 50], step: 25 };
const PUTTS_MILESTONES = [30, 28, 26, 24];
const HANDICAP_MILESTONES = [20, 15, 10, 5];
const HANDICAP_DROP_MILESTONES = [5, 10];

function normaliseHoleScores(raw: Round['hole_scores']): HoleScore[] {
  if (!raw) return [];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return Array.isArray(raw) ? raw : [];
}

interface Counters {
  birdies: number;
  eagles: number;
  aces: number;
  rounds: number;
  courses: number;
  maxRoundsOneCourse: number;
  bestScore: number | null;
  bestStableford: number | null;
  bestGir: number | null;
  fewestPutts: number | null;
  hasCleanCard: boolean;
  firstHandicap: number | null;
  currentHandicap: number | null;
  lowestHandicap: number | null;
}

/**
 * Walks every round once, emitting unlocked milestones in chronological order
 * and collecting the counters used to describe still-locked milestones.
 */
function analyse(rounds: Round[]): { milestones: Milestone[]; counters: Counters } {
  const milestones: Milestone[] = [];
  const counters: Counters = {
    birdies: 0,
    eagles: 0,
    aces: 0,
    rounds: 0,
    courses: 0,
    maxRoundsOneCourse: 0,
    bestScore: null,
    bestStableford: null,
    bestGir: null,
    fewestPutts: null,
    hasCleanCard: false,
    firstHandicap: null,
    currentHandicap: null,
    lowestHandicap: null,
  };

  if (!rounds || !Array.isArray(rounds) || rounds.length === 0) {
    return { milestones, counters };
  }

  const sorted = [...rounds].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const coursesVisited = new Set<number>();
  const coursePlayCount = new Map<number, number>();
  const courseBest = new Map<number, number>();
  const scoresHit = new Set<number>();
  const stablefordHit = new Set<number>();
  const puttsHit = new Set<number>();
  const handicapHit = new Set<number>();
  const handicapDropHit = new Set<number>();

  sorted.forEach((round, index) => {
    const holes = normaliseHoleScores(round.hole_scores);
    const holesPlayed = round.holes_played || 18;
    const courseId = round.course_id || round.courses?.id;
    const courseName = round.courses?.name;

    // ---- Hole-level achievements -------------------------------------
    let roundPutts = 0;
    let hasPuttData = false;
    let roundPenalties = 0;
    let hasPenaltyData = false;
    let roundGir = 0;
    let hasGirData = false;

    holes.forEach((hole) => {
      const strokes = hole.strokes ?? hole.score;
      if (strokes && hole.par) {
        const diff = strokes - hole.par;

        if (strokes === 1) {
          counters.aces++;
          if (isLadderTier(HOLE_IN_ONE_LADDER, counters.aces)) {
            milestones.push({
              id: `hole-in-one-${counters.aces}`,
              type: 'hole_in_one',
              title: counters.aces === 1 ? 'First Hole-in-One!' : `${getOrdinal(counters.aces)} Hole-in-One`,
              description:
                counters.aces === 1 ? 'Scored your first ace!' : `Reached ${counters.aces} career aces`,
              date: round.date,
              value: counters.aces,
            });
          }
        }

        if (diff <= -2 && strokes !== 1) {
          counters.eagles++;
          if (isLadderTier(EAGLE_LADDER, counters.eagles)) {
            milestones.push({
              id: `eagle-${counters.eagles}`,
              type: 'eagle',
              title: counters.eagles === 1 ? 'First Eagle' : `${getOrdinal(counters.eagles)} Eagle`,
              description:
                counters.eagles === 1 ? 'Scored your first eagle!' : `Reached ${counters.eagles} career eagles`,
              date: round.date,
              value: counters.eagles,
            });
          }
        }

        if (diff === -1) {
          counters.birdies++;
          if (isLadderTier(BIRDIE_LADDER, counters.birdies)) {
            milestones.push({
              id: `birdie-${counters.birdies}`,
              type: 'birdie',
              title: counters.birdies === 1 ? 'First Birdie' : `${getOrdinal(counters.birdies)} Birdie`,
              description:
                counters.birdies === 1
                  ? 'Scored your first birdie!'
                  : `Reached ${counters.birdies} career birdies`,
              date: round.date,
              value: counters.birdies,
            });
          }
        }
      }

      if (typeof hole.putts === 'number') {
        hasPuttData = true;
        roundPutts += hole.putts;
      }
      if (typeof hole.penalties === 'number') {
        hasPenaltyData = true;
        roundPenalties += hole.penalties;
      }
      if (typeof hole.gir === 'boolean') {
        hasGirData = true;
        if (hole.gir) roundGir++;
      }
    });

    // ---- Rounds played -----------------------------------------------
    const roundNumber = index + 1;
    counters.rounds = roundNumber;
    if (isLadderTier(ROUND_LADDER, roundNumber)) {
      milestones.push({
        id: `round-${roundNumber}`,
        type: 'round',
        title: roundNumber === 1 ? 'First Round' : `${getOrdinal(roundNumber)} Round`,
        description: roundNumber === 1 ? 'Logged your first round!' : `Completed ${roundNumber} rounds`,
        date: round.date,
        value: roundNumber,
      });
    }

    // ---- Courses played ----------------------------------------------
    if (courseId) {
      if (!coursesVisited.has(courseId)) {
        coursesVisited.add(courseId);
        const courseCount = coursesVisited.size;
        if (isLadderTier(COURSE_LADDER, courseCount)) {
          milestones.push({
            id: `course-${courseCount}`,
            type: 'course',
            title: courseCount === 1 ? 'First Course' : `${getOrdinal(courseCount)} Course`,
            description:
              courseCount === 1 ? 'Played your first course!' : `Played ${courseCount} different courses`,
            date: round.date,
            value: courseCount,
          });
        }
      }

      // Home course: repeat visits to the same course
      const plays = (coursePlayCount.get(courseId) || 0) + 1;
      coursePlayCount.set(courseId, plays);
      counters.maxRoundsOneCourse = Math.max(counters.maxRoundsOneCourse, plays);
      if (isLadderTier(HOME_COURSE_LADDER, plays)) {
        milestones.push({
          id: `home-course-${courseId}-${plays}`,
          type: 'home_course',
          title: plays === 5 ? 'Home Course' : `Home Course Regular (${plays})`,
          description: courseName
            ? `Played ${plays} rounds at ${courseName}`
            : `Played the same course ${plays} times`,
          date: round.date,
          value: plays,
        });
      }

      // Course conquered: beat your own previous best at this course
      const previousBest = courseBest.get(courseId);
      if (previousBest === undefined) {
        courseBest.set(courseId, round.gross_score);
      } else if (round.gross_score < previousBest) {
        courseBest.set(courseId, round.gross_score);
        milestones.push({
          id: `course-best-${courseId}-${round.id}`,
          type: 'course_best',
          title: 'Course Conquered',
          description: courseName
            ? `Shot ${round.gross_score} at ${courseName} — beating your previous best of ${previousBest}`
            : `Beat your previous best at this course with ${round.gross_score}`,
          date: round.date,
          value: round.gross_score,
        });
      }
    }

    // ---- Score breakthroughs & personal bests (18 holes only) ---------
    if (holesPlayed === 18) {
      SCORE_MILESTONES.forEach((threshold) => {
        if (round.gross_score < threshold && !scoresHit.has(threshold)) {
          scoresHit.add(threshold);
          milestones.push({
            id: `score-${threshold}`,
            type: 'score',
            title: `Broke ${threshold}`,
            description: `Shot ${round.gross_score} - under ${threshold} for the first time!`,
            date: round.date,
            value: round.gross_score,
          });
        }
      });

      if (counters.bestScore === null) {
        counters.bestScore = round.gross_score;
      } else if (round.gross_score < counters.bestScore) {
        counters.bestScore = round.gross_score;
        milestones.push({
          id: `best-round-${round.gross_score}-${round.date}`,
          type: 'best_round',
          title: 'New Personal Best',
          description: `Shot ${round.gross_score} - your best round yet!`,
          date: round.date,
          value: round.gross_score,
        });
      }
    }

    // ---- Stableford ----------------------------------------------------
    if (round.stableford_gross) {
      STABLEFORD_MILESTONES.forEach((threshold) => {
        if (round.stableford_gross! >= threshold && !stablefordHit.has(threshold)) {
          stablefordHit.add(threshold);
          milestones.push({
            id: `stableford-${threshold}`,
            type: 'stableford',
            title: `${threshold} Stableford Points`,
            description: `Scored ${round.stableford_gross} points - reached ${threshold}+ for the first time!`,
            date: round.date,
            value: round.stableford_gross,
          });
        }
      });

      if (counters.bestStableford === null) {
        counters.bestStableford = round.stableford_gross;
      } else if (round.stableford_gross > counters.bestStableford) {
        counters.bestStableford = round.stableford_gross;
        milestones.push({
          id: `stableford-best-${round.id}`,
          type: 'stableford',
          title: 'Best Stableford Round',
          description: `${round.stableford_gross} points - your highest points total yet`,
          date: round.date,
          value: round.stableford_gross,
        });
      }
    }

    // ---- Putting -------------------------------------------------------
    if (hasPuttData && holesPlayed === 18 && roundPutts > 0) {
      if (counters.fewestPutts === null || roundPutts < counters.fewestPutts) {
        counters.fewestPutts = roundPutts;
      }
      PUTTS_MILESTONES.forEach((threshold) => {
        if (roundPutts < threshold && !puttsHit.has(threshold)) {
          puttsHit.add(threshold);
          milestones.push({
            id: `putts-${threshold}`,
            type: 'putts',
            title: `Under ${threshold} Putts`,
            description: `Took just ${roundPutts} putts - under ${threshold} for the first time!`,
            date: round.date,
            value: roundPutts,
          });
        }
      });
    }

    // ---- Clean card ----------------------------------------------------
    if (hasPenaltyData && roundPenalties === 0 && !counters.hasCleanCard) {
      counters.hasCleanCard = true;
      milestones.push({
        id: 'clean-card-first',
        type: 'clean_card',
        title: 'Clean Card',
        description: 'Completed a round without a single penalty stroke',
        date: round.date,
      });
    }

    // ---- Greens in regulation ------------------------------------------
    if (hasGirData && roundGir > 0) {
      if (counters.bestGir === null || roundGir > counters.bestGir) {
        counters.bestGir = roundGir;
        milestones.push({
          id: `gir-best-${round.id}`,
          type: 'gir',
          title: 'Best Greens in Regulation',
          description: `Hit ${roundGir} greens in regulation - a new personal best`,
          date: round.date,
          value: roundGir,
        });
      }
    }

    // ---- Handicap --------------------------------------------------------
    const handicap = round.handicap_at_posting;
    if (typeof handicap === 'number' && !Number.isNaN(handicap)) {
      counters.currentHandicap = handicap;

      if (counters.firstHandicap === null) {
        counters.firstHandicap = handicap;
        counters.lowestHandicap = handicap;
        milestones.push({
          id: `handicap-first-${round.date}`,
          type: 'handicap',
          title: 'First Handicap',
          description: `Starting handicap: ${handicap.toFixed(1)}`,
          date: round.date,
          value: handicap,
        });
      } else if (counters.lowestHandicap !== null && handicap < counters.lowestHandicap) {
        counters.lowestHandicap = handicap;
        milestones.push({
          id: `handicap-lowest-${round.date}-${handicap}`,
          type: 'handicap',
          title: 'Lowest Handicap Yet',
          description: `New personal-best handicap: ${handicap.toFixed(1)}`,
          date: round.date,
          value: handicap,
        });
      }

      HANDICAP_MILESTONES.forEach((threshold) => {
        if (handicap < threshold && !handicapHit.has(threshold)) {
          handicapHit.add(threshold);
          milestones.push({
            id: `handicap-under-${threshold}`,
            type: 'handicap',
            title: threshold === 10 ? 'Single Digits' : `Handicap Under ${threshold}`,
            description:
              threshold === 10
                ? `Handicap down to ${handicap.toFixed(1)} - officially a single-figure golfer`
                : `Handicap dropped below ${threshold} (${handicap.toFixed(1)})`,
            date: round.date,
            value: handicap,
          });
        }
      });

      if (counters.firstHandicap !== null) {
        const drop = counters.firstHandicap - handicap;
        HANDICAP_DROP_MILESTONES.forEach((threshold) => {
          if (drop >= threshold && !handicapDropHit.has(threshold)) {
            handicapDropHit.add(threshold);
            milestones.push({
              id: `handicap-drop-${threshold}`,
              type: 'handicap',
              title: `${threshold} Strokes Better`,
              description: `Improved by ${drop.toFixed(1)} shots since your first handicap`,
              date: round.date,
              value: handicap,
            });
          }
        });
      }
    }
  });

  counters.courses = coursesVisited.size;
  return { milestones, counters };
}

export function calculateMilestones(rounds: Round[]): Milestone[] {
  const { milestones } = analyse(rounds);
  return milestones.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getRecentMilestones(rounds: Round[], limit: number = 3): Milestone[] {
  return calculateMilestones(rounds).slice(0, limit);
}

export function getMilestonesByType(rounds: Round[]): Record<string, Milestone[]> {
  const allMilestones = calculateMilestones(rounds);
  const grouped: Record<string, Milestone[]> = {};
  MILESTONE_TYPES.forEach((type) => {
    grouped[type] = [];
  });

  allMilestones.forEach((m) => {
    if (grouped[m.type]) grouped[m.type].push(m);
  });

  return grouped;
}

export const MILESTONE_TYPES: MilestoneType[] = [
  'birdie',
  'eagle',
  'hole_in_one',
  'round',
  'course',
  'home_course',
  'course_best',
  'score',
  'best_round',
  'stableford',
  'putts',
  'clean_card',
  'gir',
  'handicap',
];

/**
 * Unlocked milestones plus the next locked target in each series,
 * so the trophy case can show what's still to come.
 */
export function getMilestoneProgress(
  rounds: Round[],
  profileHandicap?: number | null
): MilestoneProgress {
  const { milestones, counters } = analyse(rounds);
  const unlocked = [...milestones].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const unlockedIds = new Set(unlocked.map((m) => m.id));
  const locked: LockedMilestone[] = [];

  const handicap =
    typeof profileHandicap === 'number' && !Number.isNaN(profileHandicap)
      ? profileHandicap
      : counters.currentHandicap;

  const addCountSeries = (
    type: MilestoneType,
    tiers: number[],
    current: number,
    idFor: (t: number) => string,
    titleFor: (t: number) => string,
    noun: string
  ) => {
    const next = tiers.find((t) => current < t && !unlockedIds.has(idFor(t)));
    if (next === undefined) return;
    const remaining = next - current;
    locked.push({
      id: idFor(next),
      type,
      title: titleFor(next),
      hint: `${remaining} more ${remaining === 1 ? noun : `${noun}s`} to unlock`,
      current,
      target: next,
    });
  };

  addCountSeries('birdie', ladderTiers(BIRDIE_LADDER, counters.birdies), counters.birdies, (t) => `birdie-${t}`, (t) => (t === 1 ? 'First Birdie' : `${getOrdinal(t)} Birdie`), 'birdie');
  addCountSeries('eagle', ladderTiers(EAGLE_LADDER, counters.eagles), counters.eagles, (t) => `eagle-${t}`, (t) => (t === 1 ? 'First Eagle' : `${getOrdinal(t)} Eagle`), 'eagle');
  addCountSeries('hole_in_one', ladderTiers(HOLE_IN_ONE_LADDER, counters.aces), counters.aces, (t) => `hole-in-one-${t}`, (t) => (t === 1 ? 'First Hole-in-One!' : `${getOrdinal(t)} Hole-in-One`), 'ace');
  addCountSeries('round', ladderTiers(ROUND_LADDER, counters.rounds), counters.rounds, (t) => `round-${t}`, (t) => (t === 1 ? 'First Round' : `${getOrdinal(t)} Round`), 'round');
  addCountSeries('course', ladderTiers(COURSE_LADDER, counters.courses), counters.courses, (t) => `course-${t}`, (t) => (t === 1 ? 'First Course' : `${getOrdinal(t)} Course`), 'course');

  // Home course
  const nextHome = ladderTiers(HOME_COURSE_LADDER, counters.maxRoundsOneCourse).find((t) => counters.maxRoundsOneCourse < t);
  if (nextHome !== undefined) {
    const remaining = nextHome - counters.maxRoundsOneCourse;
    locked.push({
      id: `home-course-next-${nextHome}`,
      type: 'home_course',
      title: nextHome === 5 ? 'Home Course' : `Home Course Regular (${nextHome})`,
      hint: `${remaining} more ${remaining === 1 ? 'round' : 'rounds'} at one course to unlock`,
      current: counters.maxRoundsOneCourse,
      target: nextHome,
    });
  }

  // Course conquered
  if (!unlocked.some((m) => m.type === 'course_best')) {
    locked.push({
      id: 'course-best-next',
      type: 'course_best',
      title: 'Course Conquered',
      hint: 'Beat your own best score at a course you have played before',
      current: 0,
      target: 1,
    });
  }

  // Score breakthroughs
  const nextScore = [...SCORE_MILESTONES].find((t) => !unlockedIds.has(`score-${t}`));
  if (nextScore !== undefined) {
    locked.push({
      id: `score-${nextScore}`,
      type: 'score',
      title: `Break ${nextScore}`,
      hint:
        counters.bestScore !== null
          ? `Shoot under ${nextScore} — your best so far is ${counters.bestScore}`
          : `Log an 18-hole round under ${nextScore}`,
      current: 0,
      target: 1,
    });
  }

  // Stableford tiers
  const nextStableford = STABLEFORD_MILESTONES.find((t) => !unlockedIds.has(`stableford-${t}`));
  if (nextStableford !== undefined) {
    locked.push({
      id: `stableford-${nextStableford}`,
      type: 'stableford',
      title: `${nextStableford} Stableford Points`,
      hint:
        counters.bestStableford !== null
          ? `${Math.max(1, nextStableford - counters.bestStableford)} more points in a round to unlock`
          : `Score ${nextStableford} points in a round`,
      current: counters.bestStableford ?? 0,
      target: nextStableford,
    });
  }

  // Putting tiers
  const nextPutts = PUTTS_MILESTONES.find((t) => !unlockedIds.has(`putts-${t}`));
  if (nextPutts !== undefined) {
    locked.push({
      id: `putts-${nextPutts}`,
      type: 'putts',
      title: `Under ${nextPutts} Putts`,
      hint:
        counters.fewestPutts !== null
          ? `Your best is ${counters.fewestPutts} putts — get under ${nextPutts}`
          : `Log putts on a round and finish under ${nextPutts}`,
      current: 0,
      target: 1,
    });
  }

  // Clean card
  if (!counters.hasCleanCard) {
    locked.push({
      id: 'clean-card-first',
      type: 'clean_card',
      title: 'Clean Card',
      hint: 'Play a round without a single penalty stroke',
      current: 0,
      target: 1,
    });
  }

  // GIR
  if (counters.bestGir === null) {
    locked.push({
      id: 'gir-best-first',
      type: 'gir',
      title: 'Best Greens in Regulation',
      hint: 'Track greens in regulation on a round to unlock',
      current: 0,
      target: 1,
    });
  } else {
    locked.push({
      id: 'gir-best-next',
      type: 'gir',
      title: 'Best Greens in Regulation',
      hint: `Beat your best of ${counters.bestGir} greens in a round`,
      current: counters.bestGir,
      target: counters.bestGir + 1,
    });
  }

  // Handicap
  if (counters.firstHandicap === null) {
    const remaining = Math.max(1, 5 - counters.rounds);
    locked.push({
      id: 'handicap-first',
      type: 'handicap',
      title: 'First Handicap',
      hint: `${remaining} more ${remaining === 1 ? 'round' : 'rounds'} to get your official handicap`,
      current: counters.rounds,
      target: 5,
    });
  } else {
    const nextHandicap = HANDICAP_MILESTONES.find(
      (t) => !unlockedIds.has(`handicap-under-${t}`) && (handicap === null || handicap >= t)
    );
    if (nextHandicap !== undefined) {
      locked.push({
        id: `handicap-under-${nextHandicap}`,
        type: 'handicap',
        title: nextHandicap === 10 ? 'Single Digits' : `Handicap Under ${nextHandicap}`,
        hint:
          handicap !== null
            ? `${(handicap - nextHandicap).toFixed(1)} strokes to go — get your handicap under ${nextHandicap}`
            : `Get your handicap under ${nextHandicap}`,
        current: 0,
        target: 1,
      });
    }

    const drop =
      handicap !== null && counters.firstHandicap !== null ? counters.firstHandicap - handicap : 0;
    const nextDrop = HANDICAP_DROP_MILESTONES.find((t) => !unlockedIds.has(`handicap-drop-${t}`));
    if (nextDrop !== undefined) {
      locked.push({
        id: `handicap-drop-${nextDrop}`,
        type: 'handicap',
        title: `${nextDrop} Strokes Better`,
        hint: `Improve ${Math.max(0.1, nextDrop - drop).toFixed(1)} more strokes from your first handicap`,
        current: Math.max(0, drop),
        target: nextDrop,
      });
    }

    locked.push({
      id: 'handicap-lowest-next',
      type: 'handicap',
      title: 'Lowest Handicap Yet',
      hint:
        counters.lowestHandicap !== null
          ? `Go lower than ${counters.lowestHandicap.toFixed(1)}`
          : 'Set a new personal-best handicap',
      current: 0,
      target: 1,
    });
  }

  return { unlocked, locked, totalCount: unlocked.length + locked.length };
}

export function getMilestoneIcon(type: MilestoneType): string {
  switch (type) {
    case 'birdie': return '🐦';
    case 'eagle': return '🦅';
    case 'hole_in_one': return '🎯';
    case 'round': return '⛳';
    case 'course': return '🏌️';
    case 'home_course': return '🏡';
    case 'course_best': return '🔥';
    case 'handicap': return '📉';
    case 'score': return '🏆';
    case 'best_round': return '⭐';
    case 'stableford': return '🎖️';
    case 'putts': return '🥅';
    case 'clean_card': return '🧼';
    case 'gir': return '🎪';
    default: return '✨';
  }
}

export function getMilestoneLabel(type: MilestoneType): string {
  switch (type) {
    case 'birdie': return 'Birdies';
    case 'eagle': return 'Eagles';
    case 'hole_in_one': return 'Hole-in-Ones';
    case 'round': return 'Rounds Played';
    case 'course': return 'Courses Played';
    case 'home_course': return 'Home Course';
    case 'course_best': return 'Course Bests';
    case 'handicap': return 'Handicap';
    case 'score': return 'Score Breakthroughs';
    case 'best_round': return 'Personal Bests';
    case 'stableford': return 'Stableford';
    case 'putts': return 'Putting';
    case 'clean_card': return 'Clean Cards';
    case 'gir': return 'Greens in Regulation';
    default: return 'Other';
  }
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
