export interface Milestone {
  id: string;
  type: 'birdie' | 'round' | 'course' | 'handicap' | 'score';
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
}

const BIRDIE_MILESTONES = [1, 5, 10, 25, 50, 100, 250, 500];
const ROUND_MILESTONES = [1, 5, 10, 25, 50, 100, 250, 500];
const COURSE_MILESTONES = [1, 5, 10, 25, 50, 100];
const SCORE_MILESTONES = [120, 110, 100, 90, 80, 70];

export function calculateMilestones(rounds: Round[]): Milestone[] {
  if (!rounds || rounds.length === 0) return [];

  const milestones: Milestone[] = [];
  
  // Sort rounds by date ascending for chronological milestone tracking
  const sortedRounds = [...rounds].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Track birdies chronologically
  let birdieCount = 0;
  const birdiesMilestoneHit = new Set<number>();
  
  sortedRounds.forEach((round) => {
    if (round.hole_scores && Array.isArray(round.hole_scores)) {
      round.hole_scores.forEach((hole: { score: number; par: number }) => {
        if (hole.score && hole.par && hole.score <= hole.par - 1) {
          birdieCount++;
          
          if (BIRDIE_MILESTONES.includes(birdieCount) && !birdiesMilestoneHit.has(birdieCount)) {
            birdiesMilestoneHit.add(birdieCount);
            const suffix = birdieCount === 1 ? 'st' : birdieCount === 5 ? 'th' : 'th';
            milestones.push({
              id: `birdie-${birdieCount}`,
              type: 'birdie',
              title: `${birdieCount}${suffix} Birdie`,
              description: birdieCount === 1 
                ? 'Scored your first birdie!' 
                : `Reached ${birdieCount} career birdies`,
              date: round.date,
              value: birdieCount
            });
          }
        }
      });
    }
  });

  // Track rounds played
  sortedRounds.forEach((round, index) => {
    const roundNumber = index + 1;
    if (ROUND_MILESTONES.includes(roundNumber)) {
      const suffix = roundNumber === 1 ? 'st' : roundNumber === 5 ? 'th' : 'th';
      milestones.push({
        id: `round-${roundNumber}`,
        type: 'round',
        title: `${roundNumber}${suffix} Round`,
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
        const suffix = courseCount === 1 ? 'st' : courseCount === 5 ? 'th' : 'th';
        milestones.push({
          id: `course-${courseCount}`,
          type: 'course',
          title: `${courseCount}${suffix} Course`,
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
    // Only count 18-hole rounds for score milestones
    const holesPlayed = round.holes_played || 18;
    if (holesPlayed !== 18) return;
    
    SCORE_MILESTONES.forEach((threshold) => {
      if (round.gross_score < threshold && !scoresHit.has(threshold)) {
        scoresHit.add(threshold);
        milestones.push({
          id: `score-${threshold}`,
          type: 'score',
          title: `Broke ${threshold}`,
          description: `Shot under ${threshold} for the first time!`,
          date: round.date,
          value: round.gross_score
        });
      }
    });
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

export function getMilestoneIcon(type: Milestone['type']): string {
  switch (type) {
    case 'birdie': return '🐦';
    case 'round': return '⛳';
    case 'course': return '🏌️';
    case 'handicap': return '📊';
    case 'score': return '🏆';
    default: return '✨';
  }
}
