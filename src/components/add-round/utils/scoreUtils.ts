
import { Score, ScoreSummary } from "../types";

export const calculateScoreSummary = (scores: Score[]): ScoreSummary => {
  const totalStrokes = scores.reduce((sum, score) => sum + (score.strokes || 0), 0);
  const totalPar = scores.reduce((sum, score) => sum + score.par, 0);
  const totalPutts = scores.reduce((sum, score) => sum + (score.putts || 0), 0);
  const toPar = totalStrokes - totalPar;
  const puttsRecorded = scores.some(score => score.putts !== undefined);
  
  // Add front 9 and back 9 calculations
  const front9Scores = scores.filter(score => score.hole <= 9);
  const back9Scores = scores.filter(score => score.hole > 9);
  
  const front9Strokes = front9Scores.reduce((sum, score) => sum + (score.strokes || 0), 0);
  const front9Par = front9Scores.reduce((sum, score) => sum + score.par, 0);
  const front9ToPar = front9Strokes - front9Par;
  
  const back9Strokes = back9Scores.reduce((sum, score) => sum + (score.strokes || 0), 0);
  const back9Par = back9Scores.reduce((sum, score) => sum + score.par, 0);
  const back9ToPar = back9Strokes - back9Par;
  
  return {
    totalStrokes,
    totalPar,
    totalPutts,
    toPar,
    puttsRecorded,
    front9Strokes,
    front9Par,
    front9ToPar,
    back9Strokes,
    back9Par,
    back9ToPar
  };
};
