
import { TeeData, HoleData } from './types';

// Create a default tee with 18 holes
export function createDefaultTee(): TeeData {
  return {
    id: `tee-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: 'White',
    color: '#FFFFFF',
    gender: 'male',
    holes: Array(18).fill(null).map((_, idx) => ({
      number: idx + 1,
      par: 4,
      yards: 350,
      handicap: idx + 1
    }))
  };
}

// Calculate course rating and slope for a tee (simplified algorithm)
export const calculateRatings = (tee: TeeData) => {
  // This is a simplified algorithm - in reality, course ratings are much more complex
  const totalYards = tee.holes.reduce((sum, hole) => sum + hole.yards, 0);
  const totalPar = tee.holes.reduce((sum, hole) => sum + hole.par, 0);
  
  // Simulated rating based on total yards and par
  const rating = parseFloat(((totalYards / 100) * 0.56 + totalPar * 0.24).toFixed(1));
  
  // Simulated slope based on total yards
  const slope = Math.round(113 + (totalYards - 6000) * 0.05);
  
  return { rating, slope, par: totalPar, yards: totalYards };
};
