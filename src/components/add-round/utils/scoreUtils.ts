
import { Score } from "../types";

export const calculateScoreSummary = (scores: Score[]) => {
  const front9 = scores.filter(score => score.hole <= 9);
  const back9 = scores.filter(score => score.hole > 9);
  
  const front9Strokes = front9.reduce((sum, score) => sum + (score.strokes || 0), 0);
  const front9Par = front9.reduce((sum, score) => sum + score.par, 0);
  const front9ToPar = front9Strokes - front9Par;
  
  const back9Strokes = back9.reduce((sum, score) => sum + (score.strokes || 0), 0);
  const back9Par = back9.reduce((sum, score) => sum + score.par, 0);
  const back9ToPar = back9Strokes - back9Par;
  
  const totalStrokes = front9Strokes + back9Strokes;
  const totalPar = front9Par + back9Par;
  const toPar = totalStrokes - totalPar;
  
  const totalPutts = scores.reduce((sum, score) => sum + (score.putts || 0), 0);
  const puttsRecorded = scores.some(score => score.putts !== undefined);
  
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

export const detectAchievements = (scores: Score[]) => {
  if (!scores || scores.length === 0) return [];
  
  const achievements = [];
  
  // Check for birdies, eagles, etc.
  let birdies = 0, eagles = 0, holes = 0;
  
  scores.forEach(score => {
    if (score.strokes && score.par) {
      const diff = score.strokes - score.par;
      holes++;
      
      if (diff === -1) birdies++;
      if (diff <= -2) eagles++;
      
      // Check for hole in one
      if (score.strokes === 1) {
        achievements.push({
          type: 'hole-in-one',
          hole: score.hole,
          par: score.par
        });
      }
    }
  });
  
  if (birdies >= 3) {
    achievements.push({
      type: 'multiple-birdies',
      count: birdies
    });
  }
  
  if (eagles > 0) {
    achievements.push({
      type: 'eagle',
      count: eagles
    });
  }
  
  // Check for no three-putts
  const threePutts = scores.filter(score => score.putts && score.putts >= 3).length;
  if (threePutts === 0 && scores.every(score => score.putts !== undefined)) {
    achievements.push({
      type: 'no-three-putts'
    });
  }
  
  // Check for under par round
  const totalStrokes = scores.reduce((sum, score) => sum + (score.strokes || 0), 0);
  const totalPar = scores.reduce((sum, score) => sum + score.par, 0);
  
  if (totalStrokes < totalPar && holes >= 9) {
    achievements.push({
      type: 'under-par-round',
      strokes: totalStrokes,
      par: totalPar
    });
  }
  
  return achievements;
};

/**
 * Formats a to-par value with a + sign for over par and nothing for under par
 */
export const formatToPar = (toPar: number): string => {
  if (toPar === 0) return "E"; // Even par
  return toPar > 0 ? `+${toPar}` : `${toPar}`;
};

/**
 * Creates a data object for sharing a round
 */
export const createShareData = (
  courseName: string,
  teeName: string,
  toPar: number,
  totalScore: number,
  achievements: any[] = []
) => {
  // Format the to-par score for display
  const parFormatted = formatToPar(toPar);
  
  // Create the title for sharing
  let title = `Golf score at ${courseName}`;
  
  // Create the text description for sharing
  let text = `I shot ${totalScore} (${parFormatted}) at ${courseName} from the ${teeName} tees.`;
  
  // Add achievements to the text if available
  if (achievements.length > 0) {
    text += "\n\nAchievements:";
    
    achievements.forEach(achievement => {
      switch (achievement.type) {
        case 'hole-in-one':
          text += `\n🎯 Hole in One on hole ${achievement.hole} (par ${achievement.par})!`;
          break;
        case 'multiple-birdies':
          text += `\n🐦 ${achievement.count} Birdies`;
          break;
        case 'eagle':
          text += `\n🦅 ${achievement.count} Eagle${achievement.count > 1 ? 's' : ''}`;
          break;
        case 'no-three-putts':
          text += "\n🏆 No three-putts";
          break;
        case 'under-par-round':
          text += `\n🔥 Under Par Round (${achievement.strokes}/${achievement.par})`;
          break;
        default:
          break;
      }
    });
  }
  
  // Add an app mention for sharing
  text += "\n\nTracked with BirdieBoard";
  
  return { title, text };
};
