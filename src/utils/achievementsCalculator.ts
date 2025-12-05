/**
 * Achievement Badges System
 * Calculates achievements from round history
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
  category: 'scoring' | 'milestones' | 'courses' | 'consistency';
}

interface Round {
  id: number;
  gross_score: number;
  holes_played?: number;
  course_id?: number;
  date: string;
  hole_scores?: string | any[];
  courses?: { id?: number; name?: string };
}

interface HoleScore {
  hole: number;
  par: number;
  strokes: number;
}

const parseHoleScores = (holeScores: string | any[] | null): HoleScore[] => {
  if (!holeScores) return [];
  
  try {
    if (typeof holeScores === 'string') {
      return JSON.parse(holeScores);
    }
    return holeScores as HoleScore[];
  } catch {
    return [];
  }
};

const findFirstAchievementDate = (
  rounds: Round[],
  condition: (round: Round, holeScores: HoleScore[]) => boolean
): string | undefined => {
  // Sort by date ascending to find first occurrence
  const sortedRounds = [...rounds].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  for (const round of sortedRounds) {
    const holeScores = parseHoleScores(round.hole_scores);
    if (condition(round, holeScores)) {
      return round.date;
    }
  }
  return undefined;
};

export const calculateAchievements = (rounds: Round[]): Achievement[] => {
  if (!rounds || rounds.length === 0) {
    return getDefaultAchievements();
  }

  const achievements: Achievement[] = [];
  
  // Get all hole scores across all rounds
  const allHoleScores: { score: HoleScore; date: string }[] = [];
  rounds.forEach(round => {
    const holeScores = parseHoleScores(round.hole_scores);
    holeScores.forEach(hs => {
      allHoleScores.push({ score: hs, date: round.date });
    });
  });

  // Count unique courses played
  const uniqueCourses = new Set(rounds.map(r => r.course_id || r.courses?.id).filter(Boolean));
  
  // Get 18-hole rounds only for score achievements
  const fullRounds = rounds.filter(r => (r.holes_played || 18) === 18);

  // === SCORING ACHIEVEMENTS ===
  
  // First Birdie (1 under par on a hole)
  const firstBirdie = allHoleScores.find(
    hs => hs.score.strokes === hs.score.par - 1
  );
  achievements.push({
    id: 'first_birdie',
    name: 'First Birdie',
    description: 'Score 1 under par on a hole',
    icon: '🐦',
    unlocked: !!firstBirdie,
    unlockedDate: firstBirdie?.date,
    category: 'scoring'
  });

  // First Eagle (2 under par on a hole)
  const firstEagle = allHoleScores.find(
    hs => hs.score.strokes === hs.score.par - 2
  );
  achievements.push({
    id: 'first_eagle',
    name: 'Eagle Eye',
    description: 'Score 2 under par on a hole',
    icon: '🦅',
    unlocked: !!firstEagle,
    unlockedDate: firstEagle?.date,
    category: 'scoring'
  });

  // First Par
  const firstPar = allHoleScores.find(
    hs => hs.score.strokes === hs.score.par
  );
  achievements.push({
    id: 'first_par',
    name: 'Level Player',
    description: 'Score par on a hole',
    icon: '⛳',
    unlocked: !!firstPar,
    unlockedDate: firstPar?.date,
    category: 'scoring'
  });

  // === SCORE MILESTONES ===
  
  // Broke 120
  const broke120 = findFirstAchievementDate(
    fullRounds,
    (round) => round.gross_score < 120
  );
  achievements.push({
    id: 'broke_120',
    name: 'Breaking Through',
    description: 'Score under 120 (18 holes)',
    icon: '🎯',
    unlocked: !!broke120,
    unlockedDate: broke120,
    category: 'milestones'
  });

  // Broke 110
  const broke110 = findFirstAchievementDate(
    fullRounds,
    (round) => round.gross_score < 110
  );
  achievements.push({
    id: 'broke_110',
    name: 'Getting Serious',
    description: 'Score under 110 (18 holes)',
    icon: '💪',
    unlocked: !!broke110,
    unlockedDate: broke110,
    category: 'milestones'
  });

  // Broke 100
  const broke100 = findFirstAchievementDate(
    fullRounds,
    (round) => round.gross_score < 100
  );
  achievements.push({
    id: 'broke_100',
    name: 'Double Digits',
    description: 'Score under 100 (18 holes)',
    icon: '💯',
    unlocked: !!broke100,
    unlockedDate: broke100,
    category: 'milestones'
  });

  // Broke 90
  const broke90 = findFirstAchievementDate(
    fullRounds,
    (round) => round.gross_score < 90
  );
  achievements.push({
    id: 'broke_90',
    name: 'Single Handicapper Territory',
    description: 'Score under 90 (18 holes)',
    icon: '🏆',
    unlocked: !!broke90,
    unlockedDate: broke90,
    category: 'milestones'
  });

  // Broke 80
  const broke80 = findFirstAchievementDate(
    fullRounds,
    (round) => round.gross_score < 80
  );
  achievements.push({
    id: 'broke_80',
    name: 'Scratch Golfer',
    description: 'Score under 80 (18 holes)',
    icon: '👑',
    unlocked: !!broke80,
    unlockedDate: broke80,
    category: 'milestones'
  });

  // === COURSE ACHIEVEMENTS ===
  
  achievements.push({
    id: 'courses_3',
    name: 'Course Explorer',
    description: 'Play 3 different courses',
    icon: '🗺️',
    unlocked: uniqueCourses.size >= 3,
    category: 'courses'
  });

  achievements.push({
    id: 'courses_5',
    name: 'Course Hopper',
    description: 'Play 5 different courses',
    icon: '🌍',
    unlocked: uniqueCourses.size >= 5,
    category: 'courses'
  });

  achievements.push({
    id: 'courses_10',
    name: 'Course Collector',
    description: 'Play 10 different courses',
    icon: '🏌️',
    unlocked: uniqueCourses.size >= 10,
    category: 'courses'
  });

  // === CONSISTENCY ACHIEVEMENTS ===
  
  achievements.push({
    id: 'rounds_5',
    name: 'Getting Started',
    description: 'Complete 5 rounds',
    icon: '🌱',
    unlocked: rounds.length >= 5,
    category: 'consistency'
  });

  achievements.push({
    id: 'rounds_10',
    name: 'Committed Golfer',
    description: 'Complete 10 rounds',
    icon: '📈',
    unlocked: rounds.length >= 10,
    category: 'consistency'
  });

  achievements.push({
    id: 'rounds_25',
    name: 'Dedicated Player',
    description: 'Complete 25 rounds',
    icon: '⭐',
    unlocked: rounds.length >= 25,
    category: 'consistency'
  });

  achievements.push({
    id: 'rounds_50',
    name: 'Golf Enthusiast',
    description: 'Complete 50 rounds',
    icon: '🔥',
    unlocked: rounds.length >= 50,
    category: 'consistency'
  });

  return achievements;
};

const getDefaultAchievements = (): Achievement[] => {
  return [
    { id: 'first_birdie', name: 'First Birdie', description: 'Score 1 under par on a hole', icon: '🐦', unlocked: false, category: 'scoring' },
    { id: 'first_eagle', name: 'Eagle Eye', description: 'Score 2 under par on a hole', icon: '🦅', unlocked: false, category: 'scoring' },
    { id: 'first_par', name: 'Level Player', description: 'Score par on a hole', icon: '⛳', unlocked: false, category: 'scoring' },
    { id: 'broke_120', name: 'Breaking Through', description: 'Score under 120 (18 holes)', icon: '🎯', unlocked: false, category: 'milestones' },
    { id: 'broke_110', name: 'Getting Serious', description: 'Score under 110 (18 holes)', icon: '💪', unlocked: false, category: 'milestones' },
    { id: 'broke_100', name: 'Double Digits', description: 'Score under 100 (18 holes)', icon: '💯', unlocked: false, category: 'milestones' },
    { id: 'broke_90', name: 'Single Handicapper Territory', description: 'Score under 90 (18 holes)', icon: '🏆', unlocked: false, category: 'milestones' },
    { id: 'broke_80', name: 'Scratch Golfer', description: 'Score under 80 (18 holes)', icon: '👑', unlocked: false, category: 'milestones' },
    { id: 'courses_3', name: 'Course Explorer', description: 'Play 3 different courses', icon: '🗺️', unlocked: false, category: 'courses' },
    { id: 'courses_5', name: 'Course Hopper', description: 'Play 5 different courses', icon: '🌍', unlocked: false, category: 'courses' },
    { id: 'courses_10', name: 'Course Collector', description: 'Play 10 different courses', icon: '🏌️', unlocked: false, category: 'courses' },
    { id: 'rounds_5', name: 'Getting Started', description: 'Complete 5 rounds', icon: '🌱', unlocked: false, category: 'consistency' },
    { id: 'rounds_10', name: 'Committed Golfer', description: 'Complete 10 rounds', icon: '📈', unlocked: false, category: 'consistency' },
    { id: 'rounds_25', name: 'Dedicated Player', description: 'Complete 25 rounds', icon: '⭐', unlocked: false, category: 'consistency' },
    { id: 'rounds_50', name: 'Golf Enthusiast', description: 'Complete 50 rounds', icon: '🔥', unlocked: false, category: 'consistency' },
  ];
};

export const getAchievementStats = (achievements: Achievement[]) => {
  const total = achievements.length;
  const unlocked = achievements.filter(a => a.unlocked).length;
  const percentage = Math.round((unlocked / total) * 100);
  
  return { total, unlocked, percentage };
};
