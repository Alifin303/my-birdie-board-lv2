export interface Milestone {
  id: string;
  type: 'birdie' | 'eagle' | 'hole_in_one' | 'round' | 'course' | 'handicap' | 'score' | 'best_round' | 'stableford';
  title: string;
  description: string;
  date: string;
  value?: number;
}

interface Round {
  id: number;
  date: string;
  gross_score: number;
  hole_scores?: { score: number; par: number }[] | null;
  holes_played?: number;
  course_id?: number;
  courses?: { id: number; name: string };
  stableford_gross?: number;
  handicap_at_posting?: number;
}

const BIRDIE_MILESTONES = [1, 5, 10, 25, 50, 100, 250, 500];
const EAGLE_MILESTONES = [1, 5, 10, 25, 50];
const ROUND_MILESTONES = [1, 5, 10, 25, 50, 100, 250, 500];
const COURSE_MILESTONES = [1, 5, 10, 25, 50, 100];
const SCORE_MILESTONES = [120, 110, 100, 90, 80, 70];
const STABLEFORD_MILESTONES = [20, 25, 30, 32, 34, 36, 38, 40];

export function calculateMilestones(rounds: Round[]): Milestone[] {
  if (!rounds || !Array.isArray(rounds) || rounds.length === 0) return [];

  const milestones: Milestone[] = [];
  
  // Sort rounds by date ascending for chronological milestone tracking
  const sortedRounds = [...rounds].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Track birdies and eagles chronologically
  let birdieCount = 0;
  let eagleCount = 0;
  let holeInOneCount = 0;
  const birdiesMilestoneHit = new Set<number>();
  const eaglesMilestoneHit = new Set<number>();
  
  sortedRounds.forEach((round) => {
    if (round.hole_scores && Array.isArray(round.hole_scores)) {
      round.hole_scores.forEach((hole: { score: number; par: number }) => {
        if (hole.score && hole.par) {
          const difference = hole.score - hole.par;
          
          // Hole in one
          if (hole.score === 1) {
            holeInOneCount++;
            milestones.push({
              id: `hole-in-one-${holeInOneCount}`,
              type: 'hole_in_one',
              title: holeInOneCount === 1 ? 'First Hole-in-One!' : `Hole-in-One #${holeInOneCount}`,
              description: `Scored an ace!`,
              date: round.date,
              value: holeInOneCount
            });
          }
          
          // Eagle (2 under par, but not hole-in-one on par 3)
          if (difference <= -2 && hole.score !== 1) {
            eagleCount++;
            if (EAGLE_MILESTONES.includes(eagleCount) && !eaglesMilestoneHit.has(eagleCount)) {
              eaglesMilestoneHit.add(eagleCount);
              milestones.push({
                id: `eagle-${eagleCount}`,
                type: 'eagle',
                title: eagleCount === 1 ? 'First Eagle' : `${getOrdinal(eagleCount)} Eagle`,
                description: eagleCount === 1 
                  ? 'Scored your first eagle!' 
                  : `Reached ${eagleCount} career eagles`,
                date: round.date,
                value: eagleCount
              });
            }
          }
          
          // Birdie (1 under par)
          if (difference === -1) {
            birdieCount++;
            if (BIRDIE_MILESTONES.includes(birdieCount) && !birdiesMilestoneHit.has(birdieCount)) {
              birdiesMilestoneHit.add(birdieCount);
              milestones.push({
                id: `birdie-${birdieCount}`,
                type: 'birdie',
                title: birdieCount === 1 ? 'First Birdie' : `${getOrdinal(birdieCount)} Birdie`,
                description: birdieCount === 1 
                  ? 'Scored your first birdie!' 
                  : `Reached ${birdieCount} career birdies`,
                date: round.date,
                value: birdieCount
              });
            }
          }
        }
      });
    }
  });

  // Track rounds played
  sortedRounds.forEach((round, index) => {
    const roundNumber = index + 1;
    if (ROUND_MILESTONES.includes(roundNumber)) {
      milestones.push({
        id: `round-${roundNumber}`,
        type: 'round',
        title: roundNumber === 1 ? 'First Round' : `${getOrdinal(roundNumber)} Round`,
        description: roundNumber === 1 
          ? 'Logged your first round!' 
          : `Completed ${roundNumber} rounds`,
        date: round.date,
        value: roundNumber
      });
    }
  });

  // Track unique courses played
  const coursesVisited = new Set<number>();
  sortedRounds.forEach((round) => {
    const courseId = round.course_id || round.courses?.id;
    if (courseId && !coursesVisited.has(courseId)) {
      coursesVisited.add(courseId);
      const courseCount = coursesVisited.size;
      
      if (COURSE_MILESTONES.includes(courseCount)) {
        milestones.push({
          id: `course-${courseCount}`,
          type: 'course',
          title: courseCount === 1 ? 'First Course' : `${getOrdinal(courseCount)} Course`,
          description: courseCount === 1 
            ? 'Played your first course!' 
            : `Played ${courseCount} different courses`,
          date: round.date,
          value: courseCount
        });
      }
    }
  });

  // Track score milestones (breaking 120, 110, 100, 90, 80, 70)
  const scoresHit = new Set<number>();
  sortedRounds.forEach((round) => {
    const holesPlayed = round.holes_played || 18;
    if (holesPlayed !== 18) return;
    
    SCORE_MILESTONES.forEach((threshold) => {
      if (round.gross_score < threshold && !scoresHit.has(threshold)) {
        scoresHit.add(threshold);
        milestones.push({
          id: `score-${threshold}`,
          type: 'score',
          title: `Broke ${threshold}`,
          description: `Shot ${round.gross_score} - under ${threshold} for the first time!`,
          date: round.date,
          value: round.gross_score
        });
      }
    });
  });

  // Track personal best rounds
  let bestScore = Infinity;
  sortedRounds.forEach((round) => {
    const holesPlayed = round.holes_played || 18;
    if (holesPlayed !== 18) return;
    
    if (round.gross_score < bestScore) {
      bestScore = round.gross_score;
      // Only add milestone if it's not their first round (that's already tracked)
      const roundIndex = sortedRounds.indexOf(round);
      if (roundIndex > 0) {
        milestones.push({
          id: `best-round-${round.gross_score}-${round.date}`,
          type: 'best_round',
          title: 'New Personal Best',
          description: `Shot ${round.gross_score} - your best round yet!`,
          date: round.date,
          value: round.gross_score
        });
      }
    }
  });

  // Track Stableford milestones
  const stablefordHit = new Set<number>();
  sortedRounds.forEach((round) => {
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
            value: round.stableford_gross
          });
        }
      });
    }
  });

  // Track handicap changes (improvements and increases)
  let previousHandicap: number | null = null;
  let firstHandicapRecorded = false;
  
  sortedRounds.forEach((round) => {
    const handicap = round.handicap_at_posting;
    if (handicap !== undefined && handicap !== null && typeof handicap === 'number') {
      // Track first handicap as a milestone
      if (!firstHandicapRecorded) {
        firstHandicapRecorded = true;
        milestones.push({
          id: `handicap-first-${round.date}`,
          type: 'handicap',
          title: 'First Handicap',
          description: `Starting handicap: ${handicap.toFixed(1)}`,
          date: round.date,
          value: handicap
        });
        previousHandicap = handicap;
        return;
      }
      
      // Track handicap improvements
      if (previousHandicap !== null && handicap < previousHandicap) {
        const improvement = (previousHandicap - handicap).toFixed(1);
        milestones.push({
          id: `handicap-improved-${round.date}-${handicap}`,
          type: 'handicap',
          title: 'Handicap Improved',
          description: `Dropped to ${handicap.toFixed(1)} (improved by ${improvement})`,
          date: round.date,
          value: handicap
        });
      }
      
      previousHandicap = handicap;
    }
  });

  // Sort milestones by date descending (most recent first)
  return milestones.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getRecentMilestones(rounds: Round[], limit: number = 3): Milestone[] {
  const allMilestones = calculateMilestones(rounds);
  return allMilestones.slice(0, limit);
}

export function getMilestonesByType(rounds: Round[]): Record<string, Milestone[]> {
  const allMilestones = calculateMilestones(rounds);
  const grouped: Record<string, Milestone[]> = {
    birdie: [],
    eagle: [],
    hole_in_one: [],
    round: [],
    course: [],
    score: [],
    best_round: [],
    stableford: [],
    handicap: []
  };
  
  allMilestones.forEach(m => {
    if (grouped[m.type]) {
      grouped[m.type].push(m);
    }
  });
  
  return grouped;
}

export function getMilestoneIcon(type: Milestone['type']): string {
  switch (type) {
    case 'birdie': return '🐦';
    case 'eagle': return '🦅';
    case 'hole_in_one': return '🎯';
    case 'round': return '⛳';
    case 'course': return '🏌️';
    case 'handicap': return '📉';
    case 'score': return '🏆';
    case 'best_round': return '⭐';
    case 'stableford': return '🎖️';
    default: return '✨';
  }
}

export function getMilestoneLabel(type: Milestone['type']): string {
  switch (type) {
    case 'birdie': return 'Birdies';
    case 'eagle': return 'Eagles';
    case 'hole_in_one': return 'Hole-in-Ones';
    case 'round': return 'Rounds Played';
    case 'course': return 'Courses Played';
    case 'handicap': return 'Handicap Updates';
    case 'score': return 'Score Breakthroughs';
    case 'best_round': return 'Personal Bests';
    case 'stableford': return 'Stableford';
    default: return 'Other';
  }
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
