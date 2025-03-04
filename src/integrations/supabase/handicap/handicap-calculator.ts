
/**
 * Calculates a handicap index based on a set of scores
 * This follows a simplified version of the World Handicap System
 */
export const calculateHandicapIndex = (scores: number[]): number => {
  if (!scores || scores.length === 0) return 0;

  // Sort scores from best to worst (lowest to highest)
  const sortedScores = [...scores].sort((a, b) => a - b);
  
  // Determine how many scores to use based on available rounds
  // Following a simplified version of the World Handicap System
  let scoresToUse = 0;
  if (scores.length >= 20) scoresToUse = 8;       // Use best 8 of 20
  else if (scores.length >= 15) scoresToUse = 6;  // Use best 6 of 15-19
  else if (scores.length >= 10) scoresToUse = 4;  // Use best 4 of 10-14
  else if (scores.length >= 5) scoresToUse = 3;   // Use best 3 of 5-9
  else if (scores.length >= 3) scoresToUse = 1;   // Use best score if fewer than 5 rounds
  else scoresToUse = 1;                           // Use best score if fewer than 3 rounds
  
  // Take the best scores based on the number we determined
  const bestScores = sortedScores.slice(0, scoresToUse);
  
  // Calculate the average of best scores
  const averageScore = bestScores.reduce((sum, score) => sum + score, 0) / bestScores.length;
  
  // Apply a simplified handicap formula (0.96 multiplier as per WHS)
  // In a real implementation, this would consider course rating and slope
  const handicapIndex = Math.max(0, (averageScore - 72) * 0.96);
  
  // CRITICAL FIX: Round to the nearest integer as per user requirement
  return Math.round(handicapIndex);
};

/**
 * Calculates a net score by subtracting the player's handicap from their gross score
 * Ensures the result is always an integer
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
  
  // Calculate the raw net score
  const rawNetScore = grossScore - numericHandicap;
  
  // Round to the nearest integer as per user requirement
  return Math.max(0, Math.round(rawNetScore));
};

/**
 * Calculates a net "to par" score by subtracting the player's handicap from their gross "to par" score
 * This is used to determine how a player performed relative to par, after applying their handicap
 */
export const calculateNetToPar = (toPar: number, handicap: number | string | null | undefined): number => {
  // Handle various input types for handicap
  let numericHandicap = 0;
  
  if (handicap === null || handicap === undefined) {
    numericHandicap = 0;
  } else if (typeof handicap === 'number') {
    numericHandicap = handicap;
  } else {
    numericHandicap = parseFloat(String(handicap)) || 0;
  }
  
  // Subtract handicap from to par value and round to nearest integer
  const netToPar = Math.round(toPar - numericHandicap);
  
  console.log(`Calculating net to par: toPar=${toPar}, handicap=${numericHandicap}, netToPar=${netToPar}`);
  
  // Unlike net score, net to par can be negative (under par) so we don't apply a minimum value
  return netToPar;
};

/**
 * Updates a user's handicap in the database based on their recent rounds
 * @param userId The user's ID
 * @param rounds An array of round gross scores
 * @returns The new handicap index
 */
export const updateUserHandicap = async (userId: string, rounds: number[]): Promise<number> => {
  try {
    if (!userId) {
      console.error("Cannot update handicap: No user ID provided");
      return 0;
    }
    
    // Import supabase client directly
    const { supabase } = await import('@/integrations/supabase');
    
    // Calculate the new handicap index - ensure it's rounded to nearest integer
    const newHandicap = calculateHandicapIndex(rounds);
    console.log(`Updating handicap for user ${userId}: New handicap=${newHandicap} based on ${rounds.length} rounds`);
    
    // Update the user's profile with the new handicap
    const { data, error } = await supabase
      .from('profiles')
      .update({ handicap: newHandicap })
      .eq('id', userId)
      .select('handicap');
    
    if (error) {
      console.error("Error updating user handicap:", error);
      throw error;
    }
    
    console.log("Handicap updated successfully:", data);
    return newHandicap;
  } catch (error) {
    console.error("Failed to update handicap:", error);
    return 0;
  }
};
