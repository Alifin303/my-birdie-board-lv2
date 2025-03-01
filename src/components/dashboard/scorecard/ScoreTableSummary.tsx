
import { ScoreTableSummaryProps } from "./types";

export const ScoreTableSummary = ({ scores }: ScoreTableSummaryProps) => {
  if (!scores || scores.length === 0) return null;
  
  const totalScore = scores.reduce((sum, score) => sum + (score.strokes || 0), 0);
  const totalPar = scores.reduce((sum, score) => sum + score.par, 0);
  const toPar = totalScore - totalPar;
  
  return (
    <div className="pt-2 border-t">
      <div className="flex justify-between">
        <span className="font-medium">Total Score:</span>
        <span>{totalScore}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-medium">Total Par:</span>
        <span>{totalPar}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-medium">To Par:</span>
        <span>
          {toPar > 0 ? `+${toPar}` : toPar}
        </span>
      </div>
    </div>
  );
};
