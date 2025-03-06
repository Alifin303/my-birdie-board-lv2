
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
      <h4 className="font-medium mb-2 text-primary">{title}</h4>
      <div className="border rounded-md overflow-x-auto shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-secondary/20">
              <th className="px-2 py-2 text-left text-sm font-medium text-primary">Hole</th>
              {scores.map((score) => (
                <th key={`hole-${score.hole}`} className="px-1 py-2 text-center text-sm font-medium text-primary">{score.hole}</th>
              ))}
              <th className="px-2 py-2 text-center text-sm font-medium text-primary">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-2 py-2 text-sm font-medium text-primary">Par</td>
              {scores.map((score) => (
                <td key={`par-${score.hole}`} className="px-1 py-2 text-center">
                  <div className="bg-secondary/40 border border-secondary/60 rounded-md w-7 h-7 flex items-center justify-center font-medium mx-auto text-primary">
                    {score.par}
                  </div>
                </td>
              ))}
              <td className="px-2 py-2 text-center font-medium text-primary">{totalPar}</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-2 text-sm font-medium text-primary">Score</td>
              {scores.map((score, index) => {
                const actualIndex = index + startIndex;
                const isOverPar = (score.strokes || 0) > score.par;
                const isUnderPar = (score.strokes || 0) < score.par && (score.strokes || 0) > 0;
                
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
                      <div className={`w-7 h-7 flex items-center justify-center mx-auto rounded-full ${
                        isOverPar ? 'bg-destructive/10 text-destructive' : 
                        isUnderPar ? 'bg-success/20 text-success' : ''
                      }`}>
                        {score.strokes || '-'}
                      </div>
                    )}
                  </td>
                );
              })}
              <td className="px-2 py-2 text-center font-medium text-primary">{totalStrokes}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
