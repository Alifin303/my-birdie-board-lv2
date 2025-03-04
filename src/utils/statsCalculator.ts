
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
  const bestGrossScore = Math.min(...rounds.map(r => r.gross_score));
  const bestToPar = Math.min(...rounds.map(r => r.to_par_gross));
  
  // Log all rounds with their scores for debugging
  console.log("All rounds with scores:", 
    rounds.map(r => ({
      id: r.id,
      date: new Date(r.date).toLocaleDateString(),
      course: r.courses?.courseName,
      gross: r.gross_score,
      net: r.net_score,
      toPar: r.to_par_gross,
      toParNet: r.to_par_net
    }))
  );
  
  // Handle net scores - use stored net_score if available, otherwise calculate
  // Make sure to properly round all calculations
  const roundsWithNetScore = rounds.map(r => {
    const netScore = r.net_score !== undefined && r.net_score !== null
      ? r.net_score
      : null;
    return {
      ...r,
      calculatedNetScore: netScore
    };
  }).filter(r => r.calculatedNetScore !== null);
  
  const bestNetScore = roundsWithNetScore.length > 0 ? 
    Math.min(...roundsWithNetScore.map(r => r.calculatedNetScore!)) : null;
  
  // Similarly handle to_par_net values
  const roundsWithToParNet = rounds.map(r => {
    const toParNet = r.to_par_net !== undefined && r.to_par_net !== null
      ? r.to_par_net
      : null;
    return {
      ...r,
      calculatedToParNet: toParNet
    };
  }).filter(r => r.calculatedToParNet !== null);
  
  const bestToParNet = roundsWithToParNet.length > 0 ? 
    Math.min(...roundsWithToParNet.map(r => r.calculatedToParNet!)) : null;
  
  console.log("Best scores found:", {
    bestGross: bestGrossScore,
    bestNet: bestNetScore,
    bestToPar: bestToPar,
    bestToParNet: bestToParNet
  });
  
  const averageScore = rounds.reduce((sum, r) => sum + r.gross_score, 0) / totalRounds;
  
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
  
  console.log("Calculated handicap:", {
    validRounds: validRoundsCount,
    scoresToUse,
    bestDifferentials,
    averageDifferential,
    handicapIndex
  });
  
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

// Group rounds by course and calculate course stats
export const calculateCourseStats = (rounds: Round[]): CourseStats[] => {
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
    
    // Get course name, handling possible formatting
    let courseName = firstRound.courses?.courseName || "Unknown Course";
    let clubName = firstRound.courses?.clubName || "Unknown Club";
    
    const roundsPlayed = courseRounds.length;
    const bestGrossScore = Math.min(...courseRounds.map(r => r.gross_score));
    const bestToPar = Math.min(...courseRounds.map(r => r.to_par_gross));
    
    // Properly handle net scores
    const roundsWithNetScore = courseRounds.map(r => {
      const netScore = r.net_score !== undefined && r.net_score !== null
        ? r.net_score
        : null;
      return {
        ...r,
        calculatedNetScore: netScore
      };
    }).filter(r => r.calculatedNetScore !== null);
    
    const bestNetScore = roundsWithNetScore.length > 0 ? 
      Math.min(...roundsWithNetScore.map(r => r.calculatedNetScore!)) : null;
    
    // Similarly handle to_par_net values
    const roundsWithToParNet = courseRounds.map(r => {
      const toParNet = r.to_par_net !== undefined && r.to_par_net !== null
        ? r.to_par_net
        : null;
      return {
        ...r,
        calculatedToParNet: toParNet
      };
    }).filter(r => r.calculatedToParNet !== null);
    
    const bestToParNet = roundsWithToParNet.length > 0 ? 
      Math.min(...roundsWithToParNet.map(r => r.calculatedToParNet!)) : null;

    return {
      courseId,
      courseName,
      clubName,
      city: firstRound.courses?.city,
      state: firstRound.courses?.state,
      roundsPlayed,
      bestGrossScore,
      bestNetScore,
      bestToPar,
      bestToParNet
    };
  });
};
