
import React from "react";

interface CourseBasicStatsProps {
  roundsPlayed: number;
  bestGrossScore: number;
  bestNetScore: number;
  bestToPar: number;
  bestToParNet: number;
  scoreType: 'gross' | 'net';
}

export const CourseBasicStats = ({ 
  roundsPlayed, 
  bestGrossScore, 
  bestNetScore, 
  bestToPar, 
  bestToParNet, 
  scoreType 
}: CourseBasicStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-background border rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">Rounds Played</p>
        <p className="text-3xl font-bold">{roundsPlayed}</p>
      </div>
      <div className="bg-background border rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">Best Score</p>
        <p className="text-3xl font-bold">
          {scoreType === 'gross' 
            ? bestGrossScore 
            : bestNetScore}
        </p>
      </div>
      <div className="bg-background border rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">Best to Par</p>
        <p className="text-3xl font-bold">
          {scoreType === 'gross' 
            ? (bestToPar > 0 ? '+' : '') + bestToPar
            : (bestToParNet > 0 ? '+' : '') + bestToParNet}
        </p>
      </div>
    </div>
  );
};
