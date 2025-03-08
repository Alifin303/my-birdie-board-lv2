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

  const validRoundsForHandicap = rounds.filter(round => {
    const isComplete = round.gross_score > 0;
    const isPar3OnlyCourse = false;
    return isComplete && !isPar3OnlyCourse;
  });

  const totalRounds = rounds.length;
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
      toParNet: r.to_par_net
    }))
  );
  
  const handicapIndex = validRoundsForHandicap.length >= ROUNDS_NEEDED_FOR_HANDICAP ? 
    calculateHandicapIndex(validRoundsForHandicap.map(r => r.gross_score)) : 0;

  const averageScore = rounds.reduce((sum, r) => sum + r.gross_score, 0) / totalRounds;
  
  const roundsWithCalculatedScores = rounds.map(r => {
    const netScore = Math.round(r.gross_score - handicapIndex);
    const toParNet = Math.round(r.to_par_gross - handicapIndex);
    
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
      netScore: r.calculatedNetScore,
      toPar: r.to_par_gross,
      toParNet: r.calculatedToParNet
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
    handicapUsed: handicapIndex
  } : "No rounds found");
  
  console.log("Best to par net round:", bestToParNetRound ? {
    id: bestToParNetRound.id,
    date: new Date(bestToParNetRound.date).toLocaleDateString(),
    course: bestToParNetRound.courses?.courseName,
    club: bestToParNetRound.courses?.clubName,
    gross: bestToParNetRound.gross_score,
    net: bestToParNetRound.calculatedNetScore,
    toParNet: bestToParNetRound.calculatedToParNet,
    handicapUsed: handicapIndex
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
    Math.min(54, Math.max(0, Math.round(averageDifferential * 0.96 * 10) / 10)) : 0;
  
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

import { calculateHandicapIndex as whsCalculateHandicapIndex } from "@/integrations/supabase/handicap/handicap-calculator";

const calculateHandicapIndex = (scores: number[]): number => {
  return whsCalculateHandicapIndex(scores);
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
      const netScore = Math.round(r.gross_score - currentHandicapIndex);
      const toParNet = Math.round(r.to_par_gross - currentHandicapIndex);
      
      console.log(`Round ${r.id} at ${courseName} calculation:`, {
        gross: r.gross_score,
        netScore,
        toPar: r.to_par_gross,
        toParNet,
        handicapUsed: currentHandicapIndex,
        date: new Date(r.date).toLocaleDateString()
      });
      
      return {
        ...r,
        calculatedNetScore: netScore,
        calculatedToParNet: toParNet
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
        handicapUsed: currentHandicapIndex
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
      net: bestToParNetRound.calculatedNetScore,
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

  rounds.forEach(round => {
    if (round.hole_scores) {
      Object.values(round.hole_scores).forEach((holeScore: any) => {
        if (!holeScore || typeof holeScore.strokes !== 'number' || typeof holeScore.par !== 'number') {
          return;
        }

        stats.totalHoles++;
        const relativeToPar = holeScore.strokes - holeScore.par;
        
        if (relativeToPar <= -2) stats.eagles++;
        else if (relativeToPar === -1) stats.birdies++;
        else if (relativeToPar === 0) stats.pars++;
        else if (relativeToPar === 1) stats.bogeys++;
        else if (relativeToPar === 2) stats.doubleBogeys++;
        else stats.others++;
      });
    }
  });

  return stats;
};
