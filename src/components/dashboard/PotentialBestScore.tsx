
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Round } from "./types";
import { calculatePotentialBestScore } from "./utils/bestScoreCalculator";

interface PotentialBestScoreProps {
  rounds: Round[];
}

export const PotentialBestScore: React.FC<PotentialBestScoreProps> = ({ rounds }) => {
  const potentialScore = calculatePotentialBestScore(rounds);
  
  if (!potentialScore || potentialScore.holeScores.length === 0) {
    return null;
  }
  
  // Split the hole scores into front and back nine for display
  const front9 = potentialScore.holeScores.filter(h => h.hole <= 9);
  const back9 = potentialScore.holeScores.filter(h => h.hole > 9);
  
  const toPar = potentialScore.totalBestScore - potentialScore.totalPar;
  const parDisplay = toPar === 0 ? 'E' : toPar > 0 ? `+${toPar}` : toPar.toString();
  
  return (
    <Card className="mb-8">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <span>Your Potential Best Score</span>
          <span className="text-xl font-bold">
            {potentialScore.totalBestScore} ({parDisplay})
          </span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Based on your best score for each hole across all rounds
        </p>
      </CardHeader>
      <CardContent>
        {front9.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium mb-2">Front 9</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-1 py-2 text-left text-sm font-medium">Hole</th>
                    {front9.map(score => (
                      <th key={`hole-${score.hole}`} className="px-1 py-2 text-center text-sm font-medium">
                        {score.hole}
                      </th>
                    ))}
                    <th className="px-1 py-2 text-center text-sm font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-1 py-2 text-sm font-medium">Par</td>
                    {front9.map(score => (
                      <td key={`par-${score.hole}`} className="px-1 py-2 text-center">
                        <div className="bg-muted/40 border border-muted rounded-md w-7 h-7 flex items-center justify-center font-medium mx-auto">
                          {score.par}
                        </div>
                      </td>
                    ))}
                    <td className="px-1 py-2 text-center font-medium">{potentialScore.front9Par}</td>
                  </tr>
                  <tr>
                    <td className="px-1 py-2 text-sm font-medium">Best</td>
                    {front9.map(score => {
                      // Determine color based on score vs par
                      let scoreClass = '';
                      if (score.bestScore < score.par) scoreClass = 'bg-green-100 text-green-800 border-green-200';
                      else if (score.bestScore > score.par) scoreClass = 'bg-red-100 text-red-800 border-red-200';
                      else scoreClass = 'bg-gray-100 text-gray-800 border-gray-200';
                      
                      return (
                        <td key={`best-${score.hole}`} className="px-1 py-2 text-center">
                          <div className={`border rounded-md w-7 h-7 flex items-center justify-center font-medium mx-auto ${scoreClass}`}>
                            {score.bestScore || '-'}
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-1 py-2 text-center font-medium">{potentialScore.front9BestScore}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {back9.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Back 9</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-1 py-2 text-left text-sm font-medium">Hole</th>
                    {back9.map(score => (
                      <th key={`hole-${score.hole}`} className="px-1 py-2 text-center text-sm font-medium">
                        {score.hole}
                      </th>
                    ))}
                    <th className="px-1 py-2 text-center text-sm font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-1 py-2 text-sm font-medium">Par</td>
                    {back9.map(score => (
                      <td key={`par-${score.hole}`} className="px-1 py-2 text-center">
                        <div className="bg-muted/40 border border-muted rounded-md w-7 h-7 flex items-center justify-center font-medium mx-auto">
                          {score.par}
                        </div>
                      </td>
                    ))}
                    <td className="px-1 py-2 text-center font-medium">{potentialScore.back9Par}</td>
                  </tr>
                  <tr>
                    <td className="px-1 py-2 text-sm font-medium">Best</td>
                    {back9.map(score => {
                      // Determine color based on score vs par
                      let scoreClass = '';
                      if (score.bestScore < score.par) scoreClass = 'bg-green-100 text-green-800 border-green-200';
                      else if (score.bestScore > score.par) scoreClass = 'bg-red-100 text-red-800 border-red-200';
                      else scoreClass = 'bg-gray-100 text-gray-800 border-gray-200';
                      
                      return (
                        <td key={`best-${score.hole}`} className="px-1 py-2 text-center">
                          <div className={`border rounded-md w-7 h-7 flex items-center justify-center font-medium mx-auto ${scoreClass}`}>
                            {score.bestScore || '-'}
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-1 py-2 text-center font-medium">{potentialScore.back9BestScore}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
