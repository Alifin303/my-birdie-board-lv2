
import { TeeData, HoleData } from './types';

// Create a default tee with 18 holes
export function createDefaultTee(): TeeData {
  return {
    id: `tee-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: 'White',
    color: '#FFFFFF',
    gender: 'male',
    rating: 72.0,
    slope: 113,
    par: 72,
    holes: Array(18).fill(null).map((_, idx) => ({
      number: idx + 1,
      par: null,
      yards: null,
      handicap: null
    }))
  };
}

// Calculate course rating and slope for a tee (simplified algorithm)
export const calculateRatings = (tee: TeeData) => {
  // Add a safety check to prevent errors when holes is undefined or has undefined elements
  if (!tee || !tee.holes || tee.holes.some(hole => !hole)) {
    return { rating: 72.0, slope: 113, par: 72, yards: 0 };
  }
  
  const totalYards = tee.holes.reduce((sum, hole) => sum + (Number(hole.yards) || 0), 0);
  const totalPar = tee.holes.reduce((sum, hole) => sum + (Number(hole.par) || 0), 0);
  
  // If manual ratings are being used, return the manual values
  if (tee.useManualRatings && tee.rating !== undefined && tee.slope !== undefined) {
    return { 
      rating: tee.rating, 
      slope: tee.slope, 
      par: totalPar, 
      yards: totalYards 
    };
  }
  
  // Auto-calculate ratings if manual ratings are not set or are at default values
  const shouldAutoCalculate = !tee.rating || !tee.slope || 
    (tee.rating === 72.0 && tee.slope === 113);
  
  if (shouldAutoCalculate) {
    // Simulated rating based on total yards and par
    const calculatedRating = parseFloat(((totalYards / 100) * 0.56 + totalPar * 0.24).toFixed(1));
    
    // Simulated slope based on total yards
    const calculatedSlope = Math.round(113 + (totalYards - 6000) * 0.05);
    
    return { 
      rating: calculatedRating, 
      slope: calculatedSlope, 
      par: totalPar, 
      yards: totalYards 
    };
  }
  
  // Use the existing manual ratings
  return { 
    rating: tee.rating || 72.0, 
    slope: tee.slope || 113, 
    par: totalPar, 
    yards: totalYards 
  };
};
