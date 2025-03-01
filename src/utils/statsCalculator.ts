
interface Round {
  id: number;
  date: string;
  tee_name: string;
  gross_score: number;
  net_score?: number;
  to_par_gross: number;
  to_par_net?: number;
  courses?: {
    id: number;
    name: string;
    city?: string;
    state?: string;
    clubName?: string;
    courseName?: string;
  };
}

interface Stats {
  totalRounds: number;
  bestGrossScore: number;
  bestNetScore: number | null;
  bestToPar: number;
  bestToParNet: number | null;
  averageScore: number;
  handicapIndex: number;
  roundsNeededForHandicap: number;
}

interface CourseStats {
  courseId: number;
  courseName: string;
  clubName: string;
  city?: string;
  state?: string;
  roundsPlayed: number;
  bestGrossScore: number;
  bestNetScore: number | null;
  bestToPar: number;
  bestToParNet: number | null;
  averageScore: number;
}

// Calculate overall user stats from rounds
export const calculateStats = (rounds: Round[]): Stats => {
  const ROUNDS_NEEDED_FOR_HANDICAP = 5;
  
  if (!rounds || rounds.length === 0) {
    return {
      totalRounds: 0,
      bestGrossScore: 0,
      bestNetScore: null,
      bestToPar: 0,
      bestToParNet: null,
      averageScore: 0,
      handicapIndex: 0,
      roundsNeededForHandicap: ROUNDS_NEEDED_FOR_HANDICAP
    };
  }

  // Filter out incomplete rounds and par-3 only courses for handicap calculation
  const validRoundsForHandicap = rounds.filter(round => {
    // Here we're assuming incomplete rounds would have either undefined scores
    // or some indicator in the data structure. Adjust based on your data model.
    const isComplete = round.gross_score > 0;
    
    // For par-3 courses, you'd need some indicator in your data model
    // This is a placeholder - replace with actual logic based on your data
    const isPar3OnlyCourse = false; // Implement actual check based on your data
    
    return isComplete && !isPar3OnlyCourse;
  });

  const totalRounds = rounds.length;
  
  // Safely calculate scores only if we have rounds
  const bestGrossScore = rounds.length > 0 ? Math.min(...rounds.map(r => r.gross_score)) : 0;
  const bestToPar = rounds.length > 0 ? Math.min(...rounds.map(r => r.to_par_gross)) : 0;
  
  // Net scores may not be available for all rounds
  const roundsWithNetScore = rounds.filter(r => r.net_score !== undefined && r.to_par_net !== undefined);
  const bestNetScore = roundsWithNetScore.length > 0 ? 
    Math.min(...roundsWithNetScore.map(r => r.net_score!)) : null;
  const bestToParNet = roundsWithNetScore.length > 0 ? 
    Math.min(...roundsWithNetScore.map(r => r.to_par_net!)) : null;
  
  const averageScore = rounds.length > 0 ? 
    rounds.reduce((sum, r) => sum + r.gross_score, 0) / totalRounds : 0;
  
  // Calculate handicap based on official handicap system
  // This follows a simplified version of the World Handicap System
  // Best 8 of last 20 rounds for established players
  const validRoundsCount = validRoundsForHandicap.length;
  
  // Calculate differentials (adjusted gross score - course rating) * 113 / slope rating
  // For simplicity we're using to_par_gross as a proxy for differentials
  // In a real system, you'd need course rating and slope rating
  const differentials = validRoundsForHandicap.map(round => (round.to_par_gross));
  differentials.sort((a, b) => a - b);
  
  // Number of scores to use depends on how many rounds are available
  let scoresToUse = 0;
  if (validRoundsCount >= 20) scoresToUse = 8;       // Use best 8 of 20
  else if (validRoundsCount >= 15) scoresToUse = 6;  // Use best 6 of 15-19
  else if (validRoundsCount >= 10) scoresToUse = 4;  // Use best 4 of 10-14
  else if (validRoundsCount >= 5) scoresToUse = 3;   // Use best 3 of 5-9
  else scoresToUse = 0;                             // Not enough rounds
  
  const bestDifferentials = differentials.slice(0, scoresToUse);
  const averageDifferential = bestDifferentials.length > 0 ? 
    bestDifferentials.reduce((sum, diff) => sum + diff, 0) / bestDifferentials.length : 0;
  
  // Apply handicap formula (0.96 multiplier as per WHS)
  const handicapIndex = scoresToUse > 0 ? 
    Math.max(0, Math.round(averageDifferential * 0.96 * 10) / 10) : 0;
  
  const roundsNeededForHandicap = validRoundsCount >= ROUNDS_NEEDED_FOR_HANDICAP ? 
    0 : ROUNDS_NEEDED_FOR_HANDICAP - validRoundsCount;

  return {
    totalRounds,
    bestGrossScore,
    bestNetScore,
    bestToPar,
    bestToParNet,
    averageScore,
    handicapIndex,
    roundsNeededForHandicap
  };
};

// Calculate course stats
export const calculateCourseStats = (rounds: Round[], scoreType: 'gross' | 'net' = 'gross'): any => {
  if (!rounds || rounds.length === 0) {
    return {
      roundsPlayed: 0,
      bestScore: 0,
      averageScore: 0,
      bestToPar: 0
    };
  }

  // Get valid scores for the calculations
  const validGrossScores = rounds.filter(r => r.gross_score !== undefined);
  const validNetScores = rounds.filter(r => r.net_score !== undefined);
  
  // Calculate basic stats
  const roundsPlayed = rounds.length;
  
  // Calculate scores based on scoreType
  if (scoreType === 'gross') {
    const bestScore = validGrossScores.length > 0 ? 
      Math.min(...validGrossScores.map(r => r.gross_score)) : 0;
      
    const bestToPar = validGrossScores.length > 0 ? 
      Math.min(...validGrossScores.map(r => r.to_par_gross)) : 0;
      
    const totalScore = validGrossScores.reduce((sum, r) => sum + r.gross_score, 0);
    const averageScore = validGrossScores.length > 0 ? totalScore / validGrossScores.length : 0;
    
    return {
      roundsPlayed,
      bestScore,
      averageScore,
      bestToPar
    };
  } else {
    // Net score calculations
    const bestScore = validNetScores.length > 0 ? 
      Math.min(...validNetScores.map(r => r.net_score!)) : 0;
      
    const bestToPar = validNetScores.length > 0 ? 
      Math.min(...validNetScores.map(r => r.to_par_net!)) : 0;
      
    const totalScore = validNetScores.reduce((sum, r) => sum + (r.net_score || 0), 0);
    const averageScore = validNetScores.length > 0 ? totalScore / validNetScores.length : 0;
    
    return {
      roundsPlayed,
      bestScore,
      averageScore,
      bestToPar
    };
  }
};

// Group rounds by course and calculate course stats
export const calculateCourseStats = (rounds: Round[], scoreType: 'gross' | 'net' = 'gross'): CourseStats[] => {
  if (!rounds || rounds.length === 0) return [];

  // Group rounds by course
  const courseMap = new Map<number, Round[]>();
  
  rounds.forEach(round => {
    if (round.courses) {
      const courseId = round.courses.id;
      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, []);
      }
      courseMap.get(courseId)!.push(round);
    }
  });

  // Calculate stats for each course
  return Array.from(courseMap.entries()).map(([courseId, courseRounds]) => {
    const firstRound = courseRounds[0]; // For course name and details
    
    // Ensure we have valid course information
    if (!firstRound.courses) {
      return {
        courseId,
        courseName: "Unknown Course",
        clubName: "Unknown Club",
        roundsPlayed: courseRounds.length,
        bestGrossScore: Math.min(...courseRounds.map(r => r.gross_score)),
        bestNetScore: null,
        bestToPar: Math.min(...courseRounds.map(r => r.to_par_gross)),
        bestToParNet: null,
        averageScore: courseRounds.reduce((sum, r) => sum + r.gross_score, 0) / courseRounds.length
      };
    }
    
    // Get course name, handling possible formatting
    let courseName = firstRound.courses.courseName || "Unknown Course";
    let clubName = firstRound.courses.clubName || "Unknown Club";
    
    const roundsPlayed = courseRounds.length;
    
    // Calculate stats based on score type
    const stats = calculateCourseStats(courseRounds, scoreType);
    
    return {
      courseId,
      courseName,
      clubName,
      city: firstRound.courses.city,
      state: firstRound.courses.state,
      roundsPlayed,
      bestGrossScore: stats.bestScore,
      bestNetScore: null, // We're using the simplified stats calculation above
      bestToPar: stats.bestToPar,
      bestToParNet: null, // We're using the simplified stats calculation above
      averageScore: stats.averageScore
    };
  });
};
