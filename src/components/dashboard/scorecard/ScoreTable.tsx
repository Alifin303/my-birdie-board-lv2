
import { Input } from "@/components/ui/input";
import { ScoreTableProps } from "./types";

export const ScoreTable = ({ 
  scores, 
  isEditing, 
  handleScoreChange, 
  title,
  startIndex = 0
}: ScoreTableProps) => {
  if (!scores || scores.length === 0) return null;
  
  const totalStrokes = scores.reduce((sum, score) => sum + (score.strokes || 0), 0);
  const totalPar = scores.reduce((sum, score) => sum + score.par, 0);

  return (
    <div>
      <h4 className="font-medium mb-2">{title}</h4>
      <div className="border rounded-md overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-2 py-2 text-left text-sm font-medium">Hole</th>
              {scores.map((score) => (
                <th key={`hole-${score.hole}`} className="px-1 py-2 text-center text-sm font-medium">{score.hole}</th>
              ))}
              <th className="px-2 py-2 text-center text-sm font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-2 py-2 text-sm font-medium">Par</td>
              {scores.map((score) => (
                <td key={`par-${score.hole}`} className="px-1 py-2 text-center">
                  <div className="bg-muted/40 border border-muted rounded-md w-7 h-7 flex items-center justify-center font-medium mx-auto">
                    {score.par}
                  </div>
                </td>
              ))}
              <td className="px-2 py-2 text-center font-medium">{totalPar}</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-2 text-sm font-medium">Score</td>
              {scores.map((score, index) => {
                const actualIndex = index + startIndex;
                return (
                  <td key={`score-${score.hole}`} className="px-1 py-2 text-center">
                    {isEditing ? (
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={score.strokes || ''}
                        onChange={(e) => handleScoreChange(actualIndex, e.target.value)}
                        className="w-9 h-7 text-center mx-auto px-1"
                        inputMode="numeric"
                      />
                    ) : (
                      <div className="w-7 h-7 flex items-center justify-center mx-auto">
                        {score.strokes || '-'}
                      </div>
                    )}
                  </td>
                );
              })}
              <td className="px-2 py-2 text-center font-medium">{totalStrokes}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
