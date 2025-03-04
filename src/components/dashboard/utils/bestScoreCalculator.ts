
import { Round } from "../types";

export interface HoleBestScore {
  hole: number;
  par: number;
  bestScore: number;
  rounds: number; // How many rounds have data for this hole
}

export interface PotentialBestScoreResult {
  holeScores: HoleBestScore[];
  totalPar: number;
  totalBestScore: number;
  front9Par: number;
  front9BestScore: number;
  back9Par: number;
  back9BestScore: number;
}

/**
 * Calculates the user's best score for each hole across all their rounds at a course
 */
export const calculatePotentialBestScore = (rounds: Round[]): PotentialBestScoreResult | null => {
  if (!rounds || rounds.length === 0) {
    return null;
  }

  // First, extract all hole scores from all rounds
  const allHoleScores: Record<number, { scores: number[], par: number }> = {};
  
  // Process each round
  rounds.forEach(round => {
    if (!round.hole_scores) return;
    
    let holeData;
    try {
      // Try to parse the hole_scores which might be a string or already an object
      holeData = typeof round.hole_scores === 'string' 
        ? JSON.parse(round.hole_scores) 
        : round.hole_scores;
    } catch (err) {
      console.error('Error parsing hole scores:', err);
      return;
    }
    
    // Skip if hole_scores isn't an array
    if (!Array.isArray(holeData)) {
      console.warn('hole_scores is not an array:', holeData);
      return;
    }
    
    // Process each hole in the round
    holeData.forEach(hole => {
      if (typeof hole !== 'object' || !hole || hole.hole === undefined || hole.strokes === undefined) {
        return; // Skip invalid hole data
      }
      
      const holeNumber = hole.hole;
      const score = hole.strokes;
      const par = hole.par;
      
      // Initialize the hole entry if it doesn't exist
      if (!allHoleScores[holeNumber]) {
        allHoleScores[holeNumber] = { scores: [], par };
      }
      
      // Add this score to the collection
      if (score > 0) {
        allHoleScores[holeNumber].scores.push(score);
      }
    });
  });
  
  // Convert to the sorted array format we need
  const holeScores: HoleBestScore[] = Object.entries(allHoleScores)
    .map(([holeStr, data]) => {
      const hole = parseInt(holeStr, 10);
      const { scores, par } = data;
      
      // Calculate the best score if there are any scores recorded
      const bestScore = scores.length > 0 ? Math.min(...scores) : 0;
      
      return {
        hole,
        par,
        bestScore,
        rounds: scores.length
      };
    })
    .sort((a, b) => a.hole - b.hole); // Sort by hole number
  
  // Calculate totals
  const totalPar = holeScores.reduce((sum, h) => sum + h.par, 0);
  const totalBestScore = holeScores.reduce((sum, h) => sum + h.bestScore, 0);
  
  // Split front 9 and back 9
  const front9 = holeScores.filter(h => h.hole <= 9);
  const back9 = holeScores.filter(h => h.hole > 9);
  
  const front9Par = front9.reduce((sum, h) => sum + h.par, 0);
  const front9BestScore = front9.reduce((sum, h) => sum + h.bestScore, 0);
  
  const back9Par = back9.reduce((sum, h) => sum + h.par, 0);
  const back9BestScore = back9.reduce((sum, h) => sum + h.bestScore, 0);
  
  return {
    holeScores,
    totalPar,
    totalBestScore,
    front9Par,
    front9BestScore,
    back9Par,
    back9BestScore
  };
};
