
import { Round } from "./types";

export const calculateCourseSpecificStats = (courseRounds: Round[], handicapIndex: number = 0) => {
  if (courseRounds.length === 0) return null;
  
  const roundsPlayed = courseRounds.length;
  const bestGrossScore = Math.min(...courseRounds.map(r => r.gross_score));
  const bestToPar = Math.min(...courseRounds.map(r => r.to_par_gross));
  
  const roundsWithNetScore = courseRounds.map(r => {
    const calculatedNetScore = Math.round(r.gross_score - handicapIndex);
    const calculatedToParNet = Math.round(r.to_par_gross - handicapIndex);
    
    return {
      ...r,
      calculatedNetScore,
      calculatedToParNet
    };
  });
  
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
