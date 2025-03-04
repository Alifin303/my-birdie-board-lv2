
/**
 * Calculates a handicap index based on a set of scores
 * This is a simplified calculation and not the exact USGA method
 */
export const calculateHandicapIndex = (scores: number[]): number => {
  if (!scores || scores.length === 0) return 0;

  // Sort scores from best to worst
  const sortedScores = [...scores].sort((a, b) => a - b);
  
  // Take the best score
  const bestScore = sortedScores[0];
  
  // Apply a simple algorithm to calculate handicap index
  // This is not the official USGA method
  const handicapIndex = Math.max(0, (bestScore - 72) * 0.96);
  
  // Round to 1 decimal place
  return Math.round(handicapIndex * 10) / 10;
};

/**
 * Calculates a net score by subtracting the player's handicap from their gross score
 */
export const calculateNetScore = (grossScore: number, handicap: number | string | null | undefined): number => {
  // Handle various input types for handicap
  let numericHandicap = 0;
  
  if (handicap === null || handicap === undefined) {
    console.log(`Handicap is ${handicap}, defaulting to 0`);
    numericHandicap = 0;
  } else if (typeof handicap === 'number') {
    numericHandicap = handicap;
  } else {
    // Try to parse it as a number if it's a string
    numericHandicap = parseFloat(String(handicap)) || 0;
  }
  
  console.log(`Calculating net score: gross=${grossScore}, handicap=${numericHandicap} (original: ${handicap}, type: ${typeof handicap})`);
  
  // Ensure we never return a negative score
  return Math.max(0, grossScore - numericHandicap);
};
