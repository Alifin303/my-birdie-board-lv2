interface Round {
  id: number;
  date: string;
  tee_name: string;
  gross_score: number;
  net_score?: number;
  to_par_gross: number;
  to_par_net?: number;
  hole_scores?: {
    [holeNumber: string]: {
      hole: number;
      par: number;
      strokes: number;
      putts?: number;
    }
  };
  courses?: {
    id: number;
    name: string;
    city?: string;
    state?: string;
    clubName?: string;
    courseName?: string;
  };
  handicap_at_posting?: number;
  holes_played?: number;
  stableford_gross?: number;
  stableford_net?: number;
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
  bestStablefordGross?: number;
  bestStablefordNet?: number;
  avgStablefordGross?: number;
  avgStablefordNet?: number;
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

  // Prepare rounds for handicap calculation
  // Adjust 9-hole scores for handicap calculation
  const normalizedRounds = rounds.map(round => {
    const holesPlayed = round.holes_played || 18;
    let normalizedScore = round.gross_score;
    
    // For 9-hole rounds, check for potential outliers
    if (holesPlayed === 9) {
      const estimatedPar = 36; // Estimated par for 9 holes
      const isLikelyOutlier = round.gross_score > (estimatedPar + 20);
      
      if (isLikelyOutlier) {
        // Use a more conservative adjustment for outlier scores
        normalizedScore = round.gross_score + estimatedPar;
        console.log(`Normalizing outlier 9-hole round: original=${round.gross_score}, normalized=${normalizedScore}`);
      } else {
        // Standard adjustment: double the score and add 1
        normalizedScore = round.gross_score * 2 + 1;
        console.log(`Normalizing 9-hole round: original=${round.gross_score}, normalized=${normalizedScore}`);
      }
    }
    
    return {
      ...round,
      normalizedScore
    };
  });

  const validRoundsForHandicap = normalizedRounds.filter(round => {
    const isComplete = round.gross_score > 0;
    const isPar3OnlyCourse = false;
    return isComplete && !isPar3OnlyCourse;
  });

  const totalRounds = rounds.length;
  
  // For display stats, we'll show the actual best scores (not normalized)
  const bestGrossScore = Math.min(...rounds.map(r => r.gross_score));
  const bestToPar = Math.min(...rounds.map(r => r.to_par_gross));
  
  console.log("All rounds with scores:", 
    rounds.map(r => ({
      id: r.id,
      date: new Date(r.date).toLocaleDateString(),
      course: r.courses?.courseName,
      club: r.courses?.clubName,
      gross: r.gross_score,
      net: r.net_score,
      toPar: r.to_par_gross,
      toParNet: r.to_par_net,
      handicapAtPosting: r.handicap_at_posting,
      holesPlayed: r.holes_played || 18
    }))
  );
  
  // For handicap calculation, use the normalized scores
  const handicapIndex = validRoundsForHandicap.length >= ROUNDS_NEEDED_FOR_HANDICAP ? 
    calculateHandicapIndex(
      validRoundsForHandicap.map(r => r.normalizedScore), 
      validRoundsForHandicap.map(r => r.holes_played || 18)
    ) : 0;

  // For average score, consider the actual played rounds
  const averageScore = rounds.reduce((sum, r) => sum + r.gross_score, 0) / totalRounds;
  
  const roundsWithCalculatedScores = rounds.map(r => {
    const handicapToUse = r.handicap_at_posting !== undefined && r.handicap_at_posting !== null
      ? r.handicap_at_posting
      : handicapIndex;
    
    // Scale the handicap for 9-hole rounds (half the handicap)
    const scaledHandicap = (r.holes_played === 9) ? handicapToUse / 2 : handicapToUse;
    
    const netScore = Math.round(r.gross_score - scaledHandicap);
    const toParNet = Math.round(r.to_par_gross - scaledHandicap);
    
    return {
      ...r,
      calculatedNetScore: netScore,
      calculatedToParNet: toParNet,
      handicapUsed: handicapToUse,
      scaledHandicap
    };
  });
  
  console.log("Rounds with calculated scores:", 
    roundsWithCalculatedScores.map(r => ({
      id: r.id,
      gross: r.gross_score,
      netScore: r.calculatedNetScore,
      toPar: r.to_par_gross,
      toParNet: r.calculatedToParNet,
      handicapUsed: r.handicapUsed,
      scaledHandicap: r.scaledHandicap,
      holesPlayed: r.holes_played || 18
    }))
  );
  
  const bestNetScore = roundsWithCalculatedScores.length > 0 ? 
    Math.min(...roundsWithCalculatedScores.map(r => r.calculatedNetScore)) : null;
  
  const bestToParNet = roundsWithCalculatedScores.length > 0 ? 
    Math.min(...roundsWithCalculatedScores.map(r => r.calculatedToParNet)) : null;
  
  const bestNetRound = roundsWithCalculatedScores.sort((a, b) => a.calculatedNetScore - b.calculatedNetScore)[0];
  const bestToParNetRound = roundsWithCalculatedScores.sort((a, b) => a.calculatedToParNet - b.calculatedToParNet)[0];
  
  console.log("Best net score round:", bestNetRound ? {
    id: bestNetRound.id,
    date: new Date(bestNetRound.date).toLocaleDateString(),
    course: bestNetRound.courses?.courseName,
    club: bestNetRound.courses?.clubName,
    gross: bestNetRound.gross_score,
    net: bestNetRound.calculatedNetScore,
    toParNet: bestNetRound.calculatedToParNet,
    handicapUsed: bestNetRound.handicapUsed,
    holesPlayed: bestNetRound.holes_played || 18
  } : "No rounds found");
  
  console.log("Best to par net round:", bestToParNetRound ? {
    id: bestToParNetRound.id,
    date: new Date(bestToParNetRound.date).toLocaleDateString(),
    course: bestToParNetRound.courses?.courseName,
    club: bestToParNetRound.courses?.clubName,
    gross: bestToParNetRound.gross_score,
    net: bestNetRound.calculatedNetScore,
    toParNet: bestToParNetRound.calculatedToParNet,
    handicapUsed: bestToParNetRound.handicapUsed,
    holesPlayed: bestToParNetRound.holes_played || 18
  } : "No rounds found");
  
  const validRoundsCount = validRoundsForHandicap.length;
  
  const differentials = validRoundsForHandicap.map(round => (round.to_par_gross));
  differentials.sort((a, b) => a - b);
  
  let scoresToUse = 0;
  if (validRoundsCount >= 20) scoresToUse = 8;
  else if (validRoundsCount >= 15) scoresToUse = 6;
  else if (validRoundsCount >= 10) scoresToUse = 4;
  else if (validRoundsCount >= 5) scoresToUse = 3;
  else scoresToUse = 0;
  
  const bestDifferentials = differentials.slice(0, scoresToUse);
  const averageDifferential = bestDifferentials.length > 0 ? 
    bestDifferentials.reduce((sum, diff) => sum + diff, 0) / bestDifferentials.length : 0;
  
  const calculatedHandicapIndex = scoresToUse > 0 ? 
    Math.min(54, Math.round(averageDifferential * 0.96 * 10) / 10) : 0;
  
  const roundsNeededForHandicap = validRoundsCount >= ROUNDS_NEEDED_FOR_HANDICAP ? 
    0 : ROUNDS_NEEDED_FOR_HANDICAP - validRoundsCount;

  // Calculate Stableford stats
  const roundsWithStableford = rounds.filter(r => r.stableford_gross !== null && r.stableford_gross !== undefined);
  const bestStablefordGross = roundsWithStableford.length > 0 
    ? Math.max(...roundsWithStableford.map(r => r.stableford_gross!)) 
    : undefined;
  const bestStablefordNet = roundsWithStableford.length > 0 
    ? Math.max(...roundsWithStableford.filter(r => r.stableford_net !== null && r.stableford_net !== undefined).map(r => r.stableford_net!)) 
    : undefined;
  const avgStablefordGross = roundsWithStableford.length > 0 
    ? Math.round(roundsWithStableford.reduce((sum, r) => sum + (r.stableford_gross || 0), 0) / roundsWithStableford.length) 
    : undefined;
  const avgStablefordNet = roundsWithStableford.length > 0 
    ? Math.round(roundsWithStableford.filter(r => r.stableford_net !== null).reduce((sum, r) => sum + (r.stableford_net || 0), 0) / roundsWithStableford.filter(r => r.stableford_net !== null).length) 
    : undefined;

  return {
    totalRounds,
    bestGrossScore,
    bestNetScore,
    bestToPar,
    bestToParNet,
    averageScore,
    handicapIndex: calculatedHandicapIndex,
    roundsNeededForHandicap,
    bestStablefordGross,
    bestStablefordNet,
    avgStablefordGross,
    avgStablefordNet
  };
};

import { calculateHandicapIndex as whsCalculateHandicapIndex } from "@/integrations/supabase/handicap/handicap-calculator";

const calculateHandicapIndex = (scores: number[], holes: number[] = []): number => {
  console.log("StatCalculator: Calculating handicap from scores:", scores);
  console.log("StatCalculator: With hole counts:", holes);
  const handicap = whsCalculateHandicapIndex(scores, holes);
  console.log("StatCalculator: Calculated handicap:", handicap);
  return handicap;
};

export const calculateCourseStats = (rounds: Round[], handicapIndex?: number): CourseStats[] => {
  if (!rounds || rounds.length === 0) return [];

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

  const currentHandicapIndex = handicapIndex !== undefined ? 
    handicapIndex : calculateStats(rounds).handicapIndex;
    
  console.log("Current handicap for course stats calculations:", currentHandicapIndex);

  return Array.from(courseMap.entries()).map(([courseId, courseRounds]) => {
    const firstRound = courseRounds[0];
    let courseName = firstRound.courses?.courseName || "Unknown Course";
    let clubName = firstRound.courses?.clubName || "Unknown Club";
    
    const roundsPlayed = courseRounds.length;
    const bestGrossScore = Math.min(...courseRounds.map(r => r.gross_score));
    const bestToPar = Math.min(...courseRounds.map(r => r.to_par_gross));
    
    const roundsWithCalculatedScores = courseRounds.map(r => {
      const handicapToUse = r.handicap_at_posting !== undefined && r.handicap_at_posting !== null
        ? r.handicap_at_posting 
        : currentHandicapIndex;
        
      // Scale the handicap for 9-hole rounds
      const scaledHandicap = (r.holes_played === 9) ? handicapToUse / 2 : handicapToUse;
      
      const netScore = Math.round(r.gross_score - scaledHandicap);
      const toParNet = Math.round(r.to_par_gross - scaledHandicap);
      
      console.log(`Round ${r.id} at ${courseName} calculation:`, {
        gross: r.gross_score,
        netScore,
        toPar: r.to_par_gross,
        toParNet,
        handicapUsed: handicapToUse,
        scaledHandicap,
        holesPlayed: r.holes_played || 18,
        handicapAtPosting: r.handicap_at_posting,
        currentHandicap: currentHandicapIndex,
        date: new Date(r.date).toLocaleDateString()
      });
      
      return {
        ...r,
        calculatedNetScore: netScore,
        calculatedToParNet: toParNet,
        handicapUsed: handicapToUse
      };
    });
    
    const bestNetScore = roundsWithCalculatedScores.length > 0 ? 
      Math.min(...roundsWithCalculatedScores.map(r => r.calculatedNetScore)) : null;
    
    const bestToParNet = roundsWithCalculatedScores.length > 0 ? 
      Math.min(...roundsWithCalculatedScores.map(r => r.calculatedToParNet)) : null;
    
    console.log(`Course stats for ${clubName} - ${courseName}:`, 
      roundsWithCalculatedScores.map(r => ({
        id: r.id,
        date: new Date(r.date).toLocaleDateString(),
        gross: r.gross_score,
        net: r.calculatedNetScore,
        toPar: r.to_par_gross,
        toParNet: r.calculatedToParNet,
        handicapUsed: r.handicapUsed
      }))
    );
    
    const bestNetRound = roundsWithCalculatedScores.sort((a, b) => a.calculatedNetScore - b.calculatedNetScore)[0];
    const bestToParNetRound = roundsWithCalculatedScores.sort((a, b) => a.calculatedToParNet - b.calculatedToParNet)[0];
    
    console.log(`Best net score round for ${courseName}:`, bestNetRound ? {
      id: bestNetRound.id,
      date: new Date(bestNetRound.date).toLocaleDateString(),
      gross: bestNetRound.gross_score,
      net: bestNetRound.calculatedNetScore,
      toParNet: bestNetRound.calculatedToParNet
    } : "No rounds found");
    
    console.log(`Best to par net round for ${courseName}:`, bestToParNetRound ? {
      id: bestToParNetRound.id,
      date: new Date(bestToParNetRound.date).toLocaleDateString(),
      gross: bestToParNetRound.gross_score,
      net: bestNetRound.calculatedNetScore,
      toParNet: bestToParNetRound.calculatedToParNet
    } : "No rounds found");

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

export const calculateHoleStats = (rounds: Round[]) => {
  const stats = {
    eagles: 0,
    birdies: 0,
    pars: 0,
    bogeys: 0,
    doubleBogeys: 0,
    others: 0,
    totalHoles: 0
  };

  if (!rounds || rounds.length === 0) {
    return stats;
  }

  rounds.forEach(round => {
    console.log(`Processing round ${round.id} hole_scores:`, round.hole_scores);
    
    if (round.hole_scores) {
      let holeScoresArray: any[] = [];
      
      if (Array.isArray(round.hole_scores)) {
        holeScoresArray = round.hole_scores;
      } else if (typeof round.hole_scores === 'object') {
        holeScoresArray = Object.values(round.hole_scores);
      } else if (typeof round.hole_scores === 'string') {
        try {
          const parsed = JSON.parse(round.hole_scores);
          holeScoresArray = Array.isArray(parsed) ? parsed : Object.values(parsed);
        } catch (e) {
          console.log(`Error parsing hole_scores string for round ${round.id}:`, e);
          return;
        }
      }
      
      console.log(`Processed hole scores for round ${round.id}:`, holeScoresArray);
      
      holeScoresArray.forEach(holeScore => {
        if (!holeScore || typeof holeScore.strokes !== 'number' || typeof holeScore.par !== 'number') {
          console.log("Skipping invalid hole score:", holeScore);
          return;
        }
        
        stats.totalHoles++;
        const relativeToPar = holeScore.strokes - holeScore.par;
        
        if (relativeToPar <= -2) {
          stats.eagles++;
          console.log(`Eagle on hole ${holeScore.hole}, par ${holeScore.par}, strokes ${holeScore.strokes}`);
        }
        else if (relativeToPar === -1) {
          stats.birdies++;
          console.log(`Birdie on hole ${holeScore.hole}, par ${holeScore.par}, strokes ${holeScore.strokes}`);
        }
        else if (relativeToPar === 0) {
          stats.pars++;
          console.log(`Par on hole ${holeScore.hole}, par ${holeScore.par}, strokes ${holeScore.strokes}`);
        }
        else if (relativeToPar === 1) {
          stats.bogeys++;
          console.log(`Bogey on hole ${holeScore.hole}, par ${holeScore.par}, strokes ${holeScore.strokes}`);
        }
        else if (relativeToPar === 2) {
          stats.doubleBogeys++;
          console.log(`Double bogey on hole ${holeScore.hole}, par ${holeScore.par}, strokes ${holeScore.strokes}`);
        }
        else {
          stats.others++;
          console.log(`Other (${relativeToPar}) on hole ${holeScore.hole}, par ${holeScore.par}, strokes ${holeScore.strokes}`);
        }
      });
    } else {
      console.log(`Round ${round.id} has no hole_scores or invalid format:`, round.hole_scores);
    }
  });

  console.log("Final calculated hole stats:", stats);
  return stats;
};
