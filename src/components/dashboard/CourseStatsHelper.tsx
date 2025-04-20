
import { Round } from "./types";

export const calculateCourseSpecificStats = (courseRounds: Round[], handicapIndex: number = 0) => {
  if (courseRounds.length === 0) return null;
  
  // Log for debugging
  console.log("Calculating course stats with handicap:", handicapIndex);
  
  const roundsPlayed = courseRounds.length;
  const bestGrossScore = Math.min(...courseRounds.map(r => r.gross_score));
  const bestToPar = Math.min(...courseRounds.map(r => r.to_par_gross));
  
  // Calculate net scores for each round using the handicap that was stored with the round if available
  const roundsWithNetScore = courseRounds.map(r => {
    // Use the handicap stored with the round if available, otherwise use the current handicap
    const handicapToUse = r.handicap_at_posting !== undefined && r.handicap_at_posting !== null
      ? r.handicap_at_posting
      : handicapIndex;
      
    // Scale the handicap for 9-hole rounds
    // Access holes_played safely with optional chaining and default to 18
    const holesPlayed = r.holes_played ?? 18;
    const scaledHandicap = (holesPlayed === 9) ? handicapToUse / 2 : handicapToUse;
      
    // Note: For negative handicaps, this will ADD strokes to the gross score
    // For example: gross_score=70, handicap=-2 => net_score=72
    const calculatedNetScore = Math.max(0, Math.round(r.gross_score - scaledHandicap));
    const calculatedToParNet = Math.round(r.to_par_gross - scaledHandicap);
    
    return {
      ...r,
      calculatedNetScore,
      calculatedToParNet,
      handicapUsed: handicapToUse
    };
  });
  
  // Log for debugging
  console.log("Rounds with calculated net scores:", 
    roundsWithNetScore.map(r => ({
      id: r.id,
      gross: r.gross_score,
      net: r.calculatedNetScore,
      toPar: r.to_par_gross,
      toParNet: r.calculatedToParNet,
      handicapUsed: r.handicapUsed,
      holesPlayed: r.holes_played ?? 18
    }))
  );
  
  const bestNetScore = Math.min(...roundsWithNetScore.map(r => r.calculatedNetScore));
  const bestToParNet = Math.min(...roundsWithNetScore.map(r => r.calculatedToParNet));
    
  return { roundsPlayed, bestGrossScore, bestNetScore, bestToPar, bestToParNet };
};

export const getAvailableYears = (courseRounds: Round[]) => {
  if (!courseRounds?.length) return [new Date().getFullYear()];
  
  const years = courseRounds.map(round => new Date(round.date).getFullYear());
  return [...new Set(years)].sort((a, b) => b - a);
};

export const getAvailableMonths = (courseRounds: Round[], periodType: 'month' | 'year' | 'all', currentDate: Date) => {
  if (!courseRounds?.length) return Array.from({ length: 12 }, (_, i) => i);
  
  if (periodType !== 'month') return [];
  
  const selectedYear = currentDate.getFullYear();
  const months = courseRounds
    .filter(round => new Date(round.date).getFullYear() === selectedYear)
    .map(round => new Date(round.date).getMonth());
  
  const availableMonths = [...new Set(months)].sort((a, b) => a - b);
  
  return availableMonths.length ? availableMonths : Array.from({ length: 12 }, (_, i) => i);
};

export const getFilteredRounds = (
  courseRounds: Round[],
  periodType: 'month' | 'year' | 'all',
  currentDate: Date
) => {
  if (!courseRounds) return [];
  
  return courseRounds.filter(round => {
    const roundDate = new Date(round.date);
    
    if (periodType === 'month') {
      return roundDate.getMonth() === currentDate.getMonth() && 
             roundDate.getFullYear() === currentDate.getFullYear();
    } else if (periodType === 'year') {
      return roundDate.getFullYear() === currentDate.getFullYear();
    } else {
      return true;
    }
  });
};
