
import React from "react";
import { Input } from "@/components/ui/input";
import { Score } from "@/components/add-round/types";

interface ScoreTableProps {
  title: string;
  scores: Score[];
  handleScoreChange: (index: number, field: 'strokes' | 'putts', value: string) => void;
  totalPar: number;
  totalStrokes: number;
  baseIndex: number;
}

export const ScoreTable: React.FC<ScoreTableProps> = ({
  title,
  scores,
  handleScoreChange,
  totalPar,
  totalStrokes,
  baseIndex
}) => {
  if (scores.length === 0) return null;
  
  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium mb-2">{title}</h3>
      <div className="border rounded-md">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-2 py-2 text-left text-sm font-medium whitespace-nowrap">Hole</th>
                {scores.map(score => (
                  <th key={`hole-${score.hole}`} className="px-2 py-2 text-center text-sm font-medium">{score.hole}</th>
                ))}
                <th className="px-2 py-2 text-center text-sm font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-2 py-2 text-sm font-medium">Par</td>
                {scores.map(score => (
                  <td key={`par-${score.hole}`} className="px-1 py-2 text-center">
                    <div className="bg-muted/40 border border-muted rounded-md w-7 h-7 flex items-center justify-center font-medium mx-auto">
                      {score.par}
                    </div>
                  </td>
                ))}
                <td className="px-2 py-2 text-center font-medium">{totalPar}</td>
              </tr>
              <tr className="border-b">
                <td className="px-2 py-2 text-sm font-medium">Strokes</td>
                {scores.map((score, index) => {
                  const adjustedIndex = index + baseIndex;
                  return (
                    <td key={`strokes-${score.hole}`} className="px-1 py-2 text-center">
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={score.strokes || ''}
                        onChange={(e) => handleScoreChange(adjustedIndex, 'strokes', e.target.value)}
                        className="w-9 h-7 text-center mx-auto px-1"
                        inputMode="numeric"
                      />
                    </td>
                  );
                })}
                <td className="px-2 py-2 text-center font-medium">
                  {totalStrokes || '-'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
