
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
  
  // FIXED: Use consistent calculation for net scores and net to par
  // First get the handicap from stored data if available
  const handicapIndex = validRoundsForHandicap.length >= ROUNDS_NEEDED_FOR_HANDICAP ? 
    calculateHandicapIndex(validRoundsForHandicap.map(r => r.gross_score)) : 0;

  // Calculate net scores for each round using the handicap
  const roundsWithCalculatedScores = rounds.map(r => {
    // Use stored net_score if available, otherwise calculate
    const netScore = r.net_score !== undefined && r.net_score !== null
      ? r.net_score
      : Math.round(r.gross_score - handicapIndex);
      
    // Use stored to_par_net if available, otherwise calculate
    const toParNet = r.to_par_net !== undefined && r.to_par_net !== null
      ? r.to_par_net
      : Math.round(r.to_par_gross - handicapIndex);
      
    return {
      ...r,
      calculatedNetScore: netScore,
      calculatedToParNet: toParNet
    };
  });
  
  console.log("Rounds with calculated scores:", 
    roundsWithCalculatedScores.map(r => ({
      id: r.id,
      gross: r.gross_score,
      net: r.calculatedNetScore,
      toPar: r.to_par_gross,
      toParNet: r.calculatedToParNet
    }))
  );
  
  // Find the best scores
  const bestNetScore = roundsWithCalculatedScores.length > 0 ? 
    Math.min(...roundsWithCalculatedScores.map(r => r.calculatedNetScore)) : null;
  
  const bestToParNet = roundsWithCalculatedScores.length > 0 ? 
    Math.min(...roundsWithCalculatedScores.map(r => r.calculatedToParNet)) : null;
  
  // Log the best round info for debugging
  const bestNetRound = roundsWithCalculatedScores.sort((a, b) => a.calculatedNetScore - b.calculatedNetScore)[0];
  const bestToParNetRound = roundsWithCalculatedScores.sort((a, b) => a.calculatedToParNet - b.calculatedToParNet)[0];
  
  console.log("Best net score round:", bestNetRound ? {
    id: bestNetRound.id,
    date: new Date(bestNetRound.date).toLocaleDateString(),
    course: bestNetRound.courses?.courseName,
    gross: bestNetRound.gross_score,
    net: bestNetRound.calculatedNetScore,
    toParNet: bestNetRound.calculatedToParNet,
    handicapUsed: handicapIndex
  } : "No rounds found");
  
  console.log("Best to par net round:", bestToParNetRound ? {
    id: bestToParNetRound.id,
    date: new Date(bestToParNetRound.date).toLocaleDateString(),
    course: bestToParNetRound.courses?.courseName,
    gross: bestToParNetRound.gross_score,
    net: bestToParNetRound.calculatedNetScore,
    toParNet: bestToParNetRound.calculatedToParNet,
    handicapUsed: handicapIndex
  } : "No rounds found");
  
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
  const calculatedHandicapIndex = scoresToUse > 0 ? 
    Math.max(0, Math.round(averageDifferential * 0.96 * 10) / 10) : 0;
  
  console.log("Calculated handicap:", {
    validRounds: validRoundsCount,
    scoresToUse,
    bestDifferentials,
    averageDifferential,
    handicapIndex: calculatedHandicapIndex
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
    handicapIndex: calculatedHandicapIndex,
    roundsNeededForHandicap
  };
};

// Import and use the handicapCalculator function directly
import { calculateHandicapIndex as whsCalculateHandicapIndex } from "@/integrations/supabase/handicap/handicap-calculator";

const calculateHandicapIndex = (scores: number[]): number => {
  return whsCalculateHandicapIndex(scores);
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
