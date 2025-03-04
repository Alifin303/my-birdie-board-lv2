
// Helper function to calculate handicap index based on World Handicap System
export function calculateHandicapIndex(
  rounds: Array<{ gross_score: number; to_par_gross: number; net_score?: number; to_par_net?: number }>, 
  options: { 
    skipIncompleteRounds?: boolean; 
    skipPar3Courses?: boolean;
    requiredRounds?: number;
  } = {}
): { 
  handicapIndex: number; 
  roundsNeededForHandicap: number;
  isValidHandicap: boolean;
} {
  const { 
    skipIncompleteRounds = true, 
    skipPar3Courses = true,
    requiredRounds = 5 
  } = options;
  
  if (!rounds || rounds.length === 0) {
    return { 
      handicapIndex: 0, 
      roundsNeededForHandicap: requiredRounds,
      isValidHandicap: false
    };
  }

  // Filter out incomplete rounds and par-3 only courses if specified
  const validRoundsForHandicap = rounds.filter(round => {
    // Check if round is complete based on gross score
    const isComplete = !skipIncompleteRounds || round.gross_score > 0;
    
    // For par-3 courses, we would need some kind of indicator in the data
    // This is a placeholder logic - in a real app, you would need actual course data
    const isPar3OnlyCourse = skipPar3Courses ? false : true; // Placeholder logic
    
    return isComplete && !isPar3OnlyCourse;
  });

  const validRoundsCount = validRoundsForHandicap.length;
  
  // Calculate differentials (using to_par_gross as a simplified proxy)
  // In a real WHS implementation, you would use: (adjusted_gross_score - course_rating) * 113 / slope_rating
  const differentials = validRoundsForHandicap.map(round => round.to_par_gross);
  differentials.sort((a, b) => a - b); // Sort in ascending order
  
  // Determine how many differentials to use based on WHS rules
  let scoresToUse = 0;
  if (validRoundsCount >= 20) scoresToUse = 8;       // Use best 8 of 20
  else if (validRoundsCount >= 15) scoresToUse = 6;  // Use best 6 of 15-19
  else if (validRoundsCount >= 10) scoresToUse = 4;  // Use best 4 of 10-14
  else if (validRoundsCount >= 5) scoresToUse = 3;   // Use best 3 of 5-9
  else scoresToUse = 0;                              // Not enough rounds
  
  // Take the best differentials
  const bestDifferentials = differentials.slice(0, scoresToUse);
  
  // Calculate average differential
  const averageDifferential = bestDifferentials.length > 0 
    ? bestDifferentials.reduce((sum, diff) => sum + diff, 0) / bestDifferentials.length 
    : 0;
  
  // Apply the 0.96 multiplier per WHS
  const handicapIndex = scoresToUse > 0 
    ? Math.max(0, Math.round(averageDifferential * 0.96 * 10) / 10) 
    : 0;
  
  const roundsNeededForHandicap = validRoundsCount >= requiredRounds 
    ? 0 
    : requiredRounds - validRoundsCount;
  
  return {
    handicapIndex,
    roundsNeededForHandicap,
    isValidHandicap: roundsNeededForHandicap === 0
  };
}

// Helper function to calculate net score from gross score and handicap
export function calculateNetScore(grossScore: number, handicap: number): number {
  return Math.max(0, grossScore - handicap);
}
