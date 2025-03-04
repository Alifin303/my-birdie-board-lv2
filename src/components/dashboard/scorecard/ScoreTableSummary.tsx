
import { calculateNetScore, calculateNetToPar } from "@/integrations/supabase";
import { ScoreTableSummaryProps } from "./types";

export const ScoreTableSummary = ({ scores, handicapIndex = 0, showNet = false }: ScoreTableSummaryProps) => {
  if (!scores || scores.length === 0) return null;
  
  const totalScore = scores.reduce((sum, score) => sum + (score.strokes || 0), 0);
  const totalPar = scores.reduce((sum, score) => sum + score.par, 0);
  const toPar = totalScore - totalPar;
  
  // Ensure handicapIndex is a number
  const numericHandicap = typeof handicapIndex === 'number' 
    ? handicapIndex 
    : parseFloat(String(handicapIndex)) || 0;
    
  // Calculate net score by subtracting handicap - ensuring this is rounded to nearest integer
  const netScore = calculateNetScore(totalScore, numericHandicap);
  const netToPar = calculateNetToPar(toPar, numericHandicap);
  
  console.log("[ScoreTableSummary] Rendering with:", {
    totalScore,
    netScore,
    handicapIndex: numericHandicap,
    originalHandicapType: typeof handicapIndex,
    showNet,
    toPar,
    netToPar,
    difference: totalScore - netScore
  });
  
  return (
    <div className="pt-2 border-t">
      <div className="flex justify-between">
        <span className="font-medium">Total Score:</span>
        <span>
          {showNet && numericHandicap > 0 ? netScore : totalScore}
          {showNet && numericHandicap > 0 ? ` (${totalScore} gross)` : ''}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="font-medium">Total Par:</span>
        <span>{totalPar}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-medium">To Par:</span>
        <span>
          {showNet && numericHandicap > 0 
            ? `${netToPar > 0 ? '+' : ''}${netToPar}`
            : `${toPar > 0 ? '+' : ''}${toPar}`}
          {showNet && numericHandicap > 0 ? ` (${toPar > 0 ? '+' : ''}${toPar} gross)` : ''}
        </span>
      </div>
      {showNet && numericHandicap > 0 && (
        <div className="flex justify-between text-sm text-muted-foreground mt-1">
          <span>Handicap applied:</span>
          <span>{numericHandicap}</span>
        </div>
      )}
    </div>
  );
};
