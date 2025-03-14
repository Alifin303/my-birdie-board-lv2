
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

// New function to detect achievements in a round
export const detectAchievements = (scores: Score[]): string[] => {
  const achievements: string[] = [];
  
  // Count birdies, eagles, etc.
  let birdies = 0;
  let eagles = 0;
  let pars = 0;
  
  // Check each hole for achievements
  scores.forEach(score => {
    const strokes = score.strokes || 0;
    const par = score.par;
    
    if (strokes === 0) return; // Skip holes without scores
    
    const relativeToPar = strokes - par;
    
    if (relativeToPar === 0) {
      pars++;
    } else if (relativeToPar === -1) {
      birdies++;
    } else if (relativeToPar <= -2) {
      eagles++;
    }
  });
  
  // Add achievements based on count
  if (birdies === 1) {
    achievements.push("1 Birdie");
  } else if (birdies > 1) {
    achievements.push(`${birdies} Birdies`);
  }
  
  if (eagles === 1) {
    achievements.push("1 Eagle");
  } else if (eagles > 1) {
    achievements.push(`${eagles} Eagles`);
  }
  
  if (pars === 1) {
    achievements.push("1 Par");
  } else if (pars > 1) {
    achievements.push(`${pars} Pars`);
  }
  
  return achievements;
};

// Format the "to par" score for display (+5, -2, E, etc.)
export const formatToPar = (toPar: number): string => {
  if (toPar === 0) return "E"; // Even par
  return toPar > 0 ? `+${toPar}` : `${toPar}`;
};

// Create a share data object for the Web Share API
export const createShareData = (
  courseName: string, 
  teeName: string, 
  toPar: number,
  totalScore: number,
  achievements: string[]
): { title: string; text: string } => {
  const formattedToPar = formatToPar(toPar);
  
  let shareText = `I shot ${totalScore} (${formattedToPar}) at ${courseName} from the ${teeName} tees using MyBirdieBoard!`;
  
  // Add achievements if there are any
  if (achievements.length > 0) {
    shareText += `\n\nAchievements: ${achievements.join(', ')}`;
  }
  
  shareText += "\n\nTrack your golf game at MyBirdieBoard.com";
  
  return {
    title: `My Round at ${courseName}`,
    text: shareText
  };
};
