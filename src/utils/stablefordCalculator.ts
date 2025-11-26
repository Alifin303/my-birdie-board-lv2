/**
 * Stableford Scoring System
 * Standard Stableford points:
 * - Albatross (3 under par): 5 points
 * - Eagle (2 under par): 4 points
 * - Birdie (1 under par): 3 points
 * - Par: 2 points
 * - Bogey (1 over par): 1 point
 * - Double bogey or worse: 0 points
 */

interface HoleScore {
  hole: number;
  par: number;
  strokes?: number;
  handicap?: number;
}

/**
 * Calculate Stableford points for a single hole
 */
export const calculateHoleStableford = (strokes: number, par: number): number => {
  const scoreToPar = strokes - par;
  
  if (scoreToPar <= -3) return 5; // Albatross or better
  if (scoreToPar === -2) return 4; // Eagle
  if (scoreToPar === -1) return 3; // Birdie
  if (scoreToPar === 0) return 2;  // Par
  if (scoreToPar === 1) return 1;  // Bogey
  return 0; // Double bogey or worse
};

/**
 * Calculate net Stableford points for a single hole with handicap strokes
 */
export const calculateNetHoleStableford = (
  strokes: number, 
  par: number, 
  handicapStrokes: number
): number => {
  const netStrokes = strokes - handicapStrokes;
  return calculateHoleStableford(netStrokes, par);
};

/**
 * Calculate total gross Stableford points for a round
 */
export const calculateGrossStableford = (scores: HoleScore[]): number => {
  return scores.reduce((total, score) => {
    if (score.strokes === undefined || score.strokes === null) return total;
    return total + calculateHoleStableford(score.strokes, score.par);
  }, 0);
};

/**
 * Calculate handicap strokes for each hole based on course handicap
 * Distributes strokes across holes based on hole handicap (difficulty/stroke index)
 */
const getHandicapStrokesForHole = (
  holeHandicap: number, 
  courseHandicap: number
): number => {
  // Validate inputs
  if (courseHandicap <= 0 || holeHandicap <= 0) return 0;
  
  // Each hole with handicap <= courseHandicap gets 1 stroke
  let strokes = holeHandicap <= courseHandicap ? 1 : 0;
  
  // For handicaps > 18, distribute additional strokes
  if (courseHandicap > 18) {
    const extraStrokes = courseHandicap - 18;
    if (holeHandicap <= extraStrokes) {
      strokes += 1;
    }
  }
  
  return strokes;
};

/**
 * Calculate total net Stableford points for a round with handicap
 */
export const calculateNetStableford = (
  scores: HoleScore[], 
  courseHandicap: number
): number => {
  if (!courseHandicap || courseHandicap <= 0) {
    console.log("No course handicap, using gross Stableford");
    return calculateGrossStableford(scores);
  }

  console.log("Calculating net Stableford with course handicap:", courseHandicap);
  
  return scores.reduce((total, score) => {
    if (score.strokes === undefined || score.strokes === null) return total;
    
    // Use hole's handicap (stroke index) if available, otherwise default to hole number
    const holeHandicap = score.handicap ?? score.hole;
    
    if (!score.handicap) {
      console.warn(`Hole ${score.hole} missing handicap/stroke index, using hole number as default`);
    }
    
    const handicapStrokes = getHandicapStrokesForHole(
      holeHandicap, 
      courseHandicap
    );
    
    const netPoints = calculateNetHoleStableford(
      score.strokes, 
      score.par, 
      handicapStrokes
    );
    
    console.log(`Hole ${score.hole}: strokes=${score.strokes}, par=${score.par}, holeHandicap=${holeHandicap}, handicapStrokes=${handicapStrokes}, netPoints=${netPoints}`);
    
    return total + netPoints;
  }, 0);
};

/**
 * Get Stableford points for display alongside hole scores
 */
export const getStablefordPointsPerHole = (
  scores: HoleScore[], 
  courseHandicap?: number
): { gross: number; net: number }[] => {
  return scores.map(score => {
    if (score.strokes === undefined || score.strokes === null) {
      return { gross: 0, net: 0 };
    }

    const gross = calculateHoleStableford(score.strokes, score.par);
    
    let net = gross;
    if (courseHandicap && courseHandicap > 0) {
      // Use hole's handicap (stroke index) if available, otherwise default to hole number
      const holeHandicap = score.handicap ?? score.hole;
      const handicapStrokes = getHandicapStrokesForHole(
        holeHandicap, 
        courseHandicap
      );
      net = calculateNetHoleStableford(score.strokes, score.par, handicapStrokes);
    }

    return { gross, net };
  });
};

/**
 * Format Stableford score for display
 */
export const formatStablefordScore = (points: number): string => {
  return `${points} pts`;
};
