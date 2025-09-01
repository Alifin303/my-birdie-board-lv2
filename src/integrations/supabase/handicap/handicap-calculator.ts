
/**
 * Calculates a handicap index based on score differentials using the World Handicap System
 * @param scoreDifferentials Array of score differentials calculated as (Adjusted Gross Score - Course Rating) × (113 ÷ Slope Rating)
 * @param scores Optional array of raw scores for logging purposes
 * @param holes Optional array of holes played for logging purposes
 */
export const calculateHandicapIndex = (scoreDifferentials: number[], scores: number[] = [], holes: number[] = []): number => {
  if (!scoreDifferentials || scoreDifferentials.length === 0) return 0;
  // Sort score differentials from best to worst (lowest to highest)
  const sortedDifferentials = [...scoreDifferentials].sort((a, b) => a - b);
  
  // Log for debugging
  console.log("Calculating handicap with score differentials:", sortedDifferentials);
  console.log("Original scores:", scores);
  console.log("Hole counts:", holes);
  
  // Determine how many differentials to use based on available rounds
  // Following the World Handicap System
  let differentialsToUse = 0;
  if (scoreDifferentials.length >= 20) differentialsToUse = 8;       // Use best 8 of 20
  else if (scoreDifferentials.length >= 15) differentialsToUse = 6;  // Use best 6 of 15-19
  else if (scoreDifferentials.length >= 10) differentialsToUse = 4;  // Use best 4 of 10-14
  else if (scoreDifferentials.length >= 5) differentialsToUse = 3;   // Use best 3 of 5-9
  else if (scoreDifferentials.length >= 3) differentialsToUse = 1;   // Use best differential if fewer than 5 rounds
  else differentialsToUse = 1;                                       // Use best differential if fewer than 3 rounds
  
  // Take the best differentials based on the number we determined
  const bestDifferentials = sortedDifferentials.slice(0, differentialsToUse);
  console.log(`Using best ${differentialsToUse} differentials:`, bestDifferentials);
  
  // Calculate the average of best differentials
  const averageDifferential = bestDifferentials.reduce((sum, diff) => sum + diff, 0) / bestDifferentials.length;
  console.log("Average of best differentials:", averageDifferential);
  
  // Calculate handicap index as per WHS (average differential × 0.96)
  const calculatedHandicap = averageDifferential * 0.96;
  console.log("Raw calculated handicap:", calculatedHandicap);
  
  // Cap the handicap at 54, which is the maximum allowed in the World Handicap System
  // Allow for negative handicaps (plus handicaps) for exceptional players
  const cappedHandicap = Math.min(54, Math.max(-5, calculatedHandicap));
  console.log("Final handicap after cap:", cappedHandicap);

  // Return the exact calculated value (don't round) to match Supabase's decimal storage
  return cappedHandicap;
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
  // For negative handicaps (plus handicaps), this will add strokes to the gross score
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
  // For negative handicaps (plus handicaps), this will increase the to par value
  const netToPar = Math.round(toPar - numericHandicap);
  
  console.log(`Calculating net to par: toPar=${toPar}, handicap=${numericHandicap}, netToPar=${netToPar}`);
  
  // Unlike net score, net to par can be negative (under par) so we don't apply a minimum value
  return netToPar;
};

/**
 * Calculates a score differential using the World Handicap System formula
 * @param adjustedGrossScore The adjusted gross score for the round
 * @param courseRating The course rating for the tees played
 * @param slopeRating The slope rating for the tees played
 * @returns The score differential
 */
export const calculateScoreDifferential = (
  adjustedGrossScore: number,
  courseRating: number,
  slopeRating: number
): number => {
  return (adjustedGrossScore - courseRating) * (113 / slopeRating);
};

/**
 * Updates a user's handicap in the database based on their recent rounds with course/tee data
 * @param userId The user's ID
 * @returns The new handicap index
 */
export const updateUserHandicap = async (userId: string): Promise<number> => {
  try {
    if (!userId) {
      console.error("Cannot update handicap: No user ID provided");
      return 0;
    }
    
    // Import supabase client directly
    const { supabase } = await import('@/integrations/supabase');
    
    // Fetch user's rounds first
    const { data: roundsData, error: roundsError } = await supabase
      .from('rounds')
      .select('gross_score, holes_played, tee_id, course_id')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (roundsError) {
      console.error("Error fetching rounds for handicap calculation:", roundsError);
      return 0;
    }

    if (!roundsData || roundsData.length === 0) {
      console.log("No rounds found for user, setting handicap to 0");
      const { error } = await supabase
        .from('profiles')
        .update({ handicap: 0 })
        .eq('id', userId);
      
      if (error) console.error("Error updating handicap to 0:", error);
      return 0;
    }

    // Calculate score differentials using actual course/tee data
    const scoreDifferentials: number[] = [];
    const scores: number[] = [];
    const holes: number[] = [];

    for (const round of roundsData) {
      // Get tee data for this round
      const { data: teeData, error: teeError } = await supabase
        .from('course_tees')
        .select('rating, slope')
        .eq('course_id', round.course_id)
        .eq('tee_id', round.tee_id)
        .single();
      
      if (teeError || !teeData) {
        console.warn(`No tee data found for round with course_id: ${round.course_id}, tee_id: ${round.tee_id}, using defaults`);
        // Use default values if no tee data found
        const courseRating = 72;
        const slopeRating = 113;
        const holesPlayed = round.holes_played || 18;
        
        let adjustedScore = round.gross_score;
        if (holesPlayed === 9) {
          adjustedScore = round.gross_score * 2 + 1;
        }

        const differential = calculateScoreDifferential(adjustedScore, courseRating, slopeRating);
        scoreDifferentials.push(differential);
        scores.push(round.gross_score);
        holes.push(holesPlayed);
        continue;
      }

      const courseRating = teeData.rating || 72;
      const slopeRating = teeData.slope || 113;
      const holesPlayed = round.holes_played || 18;
      
      // Adjust score for 9-hole rounds (WHS: double and add adjustment)
      let adjustedScore = round.gross_score;
      if (holesPlayed === 9) {
        adjustedScore = round.gross_score * 2 + 1;
      }

      const differential = calculateScoreDifferential(adjustedScore, courseRating, slopeRating);
      scoreDifferentials.push(differential);
      scores.push(round.gross_score);
      holes.push(holesPlayed);
    }

    if (scoreDifferentials.length === 0) {
      console.log("No valid rounds with tee data found, setting handicap to 0");
      const { error } = await supabase
        .from('profiles')
        .update({ handicap: 0 })
        .eq('id', userId);
      
      if (error) console.error("Error updating handicap to 0:", error);
      return 0;
    }

    // Calculate the new handicap index using score differentials
    const newHandicap = calculateHandicapIndex(scoreDifferentials, scores, holes);
    console.log(`Updating handicap for user ${userId}: New handicap=${newHandicap} based on ${scoreDifferentials.length} rounds with course data`);
    
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
