
import { ScoreTableSummaryProps } from "./types";

export const ScoreTableSummary = ({ scores, handicapIndex = 0, showNet = false }: ScoreTableSummaryProps) => {
  if (!scores || scores.length === 0) return null;
  
  const totalScore = scores.reduce((sum, score) => sum + (score.strokes || 0), 0);
  const totalPar = scores.reduce((sum, score) => sum + score.par, 0);
  const toPar = totalScore - totalPar;
  
  // Calculate net score by subtracting handicap
  const netScore = Math.max(0, totalScore - handicapIndex);
  const netToPar = netScore - totalPar;
  
  return (
    <div className="pt-2 border-t">
      <div className="flex justify-between">
        <span className="font-medium">Total Score:</span>
        <span>
          {showNet && handicapIndex > 0 ? netScore : totalScore}
          {showNet && handicapIndex > 0 ? ` (${totalScore} gross)` : ''}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="font-medium">Total Par:</span>
        <span>{totalPar}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-medium">To Par:</span>
        <span>
          {showNet && handicapIndex > 0 
            ? `${netToPar > 0 ? '+' : ''}${netToPar}`
            : `${toPar > 0 ? '+' : ''}${toPar}`}
          {showNet && handicapIndex > 0 ? ` (${toPar > 0 ? '+' : ''}${toPar} gross)` : ''}
        </span>
      </div>
      {showNet && handicapIndex > 0 && (
        <div className="flex justify-between text-sm text-muted-foreground mt-1">
          <span>Handicap applied:</span>
          <span>{handicapIndex}</span>
        </div>
      )}
    </div>
  );
};
