
import { CalendarDays, Trophy, Flag } from "lucide-react";
import { Stats, Round } from "./types";
import React, { useEffect } from "react";

interface StatsDisplayProps {
  userRounds: Round[] | undefined;
  roundsLoading: boolean;
  scoreType: 'gross' | 'net';
  onScoreTypeChange: (type: 'gross' | 'net') => void;
  calculateStats: (rounds: Round[]) => Stats;
}

export const MainStats = ({ userRounds, roundsLoading, scoreType, calculateStats }: Omit<StatsDisplayProps, 'onScoreTypeChange'>) => {
  // Add key prop to force re-render when userRounds changes
  const roundsKey = userRounds ? `rounds-${userRounds.length}` : 'no-rounds';
  
  useEffect(() => {
    console.log("[MainStats] Rounds data changed, recalculating stats", { 
      roundsCount: userRounds?.length 
    });
  }, [userRounds]);
  
  if (roundsLoading || !userRounds) {
    return (
      <div className="grid grid-cols-3 gap-6 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-background/50 animate-pulse h-24 rounded-lg border"></div>
        ))}
      </div>
    );
  }

  const stats = calculateStats(userRounds);
  
  console.log("[MainStats] Rendering with score type:", scoreType, {
    roundsKey,
    roundsCount: userRounds.length,
    bestGrossScore: stats.bestGrossScore,
    bestNetScore: stats.bestNetScore,
    handicapIndex: stats.handicapIndex
  });
  
  // Calculate net scores based on handicap if not already available
  const bestNetScore = stats.bestNetScore !== null 
    ? stats.bestNetScore 
    : (stats.handicapIndex > 0 ? Math.max(0, Math.round(stats.bestGrossScore - stats.handicapIndex)) : stats.bestGrossScore);
    
  const bestNetToPar = stats.bestToParNet !== null
    ? stats.bestToParNet
    : (stats.handicapIndex > 0 ? Math.round(stats.bestToPar - stats.handicapIndex) : stats.bestToPar);
  
  // Find the round with the best net score for debugging
  if (scoreType === 'net' && userRounds.length > 0) {
    const roundsWithNetScores = userRounds.map(round => {
      const netScore = round.net_score || Math.max(0, round.gross_score - stats.handicapIndex);
      const netToPar = round.to_par_net || Math.round(round.to_par_gross - stats.handicapIndex);
      return { 
        id: round.id, 
        date: round.date, 
        gross: round.gross_score, 
        net: netScore, 
        toPar: round.to_par_gross,
        toParNet: netToPar,
        courseName: round.courses?.courseName
      };
    });
    
    // Sort by net score to find the best one
    const sortedByNetScore = [...roundsWithNetScores].sort((a, b) => a.net - b.net);
    // Sort by to par net to find the best one
    const sortedByToParNet = [...roundsWithNetScores].sort((a, b) => a.toParNet - b.toParNet);
    
    console.log("[MainStats] Best rounds by net score:", sortedByNetScore.slice(0, 3));
    console.log("[MainStats] Best rounds by net to par:", sortedByToParNet.slice(0, 3));
    console.log("[MainStats] Round with best net to par:", sortedByToParNet[0]);
  }
  
  console.log("[MainStats] Calculated scores:", {
    bestGrossScore: stats.bestGrossScore,
    calculatedBestNetScore: bestNetScore,
    difference: stats.bestGrossScore - bestNetScore,
    bestToPar: stats.bestToPar,
    bestNetToPar: bestNetToPar
  });
  
  return (
    <div key={roundsKey} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-background rounded-lg p-5 border">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Rounds Played</p>
            <p className="text-3xl font-bold">{stats.totalRounds}</p>
          </div>
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-primary/10">
            <CalendarDays className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>
      
      <div className="bg-background rounded-lg p-5 border">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Best Score</p>
            <p className="text-3xl font-bold">
              {scoreType === 'gross' ? stats.bestGrossScore : bestNetScore}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-primary/10">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>
      
      <div className="bg-background rounded-lg p-5 border">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Best to Par</p>
            <p className="text-3xl font-bold">
              {scoreType === 'gross' 
                ? (stats.bestToPar > 0 ? '+' : '') + stats.bestToPar 
                : (bestNetToPar > 0 ? '+' : '') + bestNetToPar}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-primary/10">
            <Flag className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const HandicapCircle = ({ userRounds, roundsLoading, scoreType, onScoreTypeChange, calculateStats }: StatsDisplayProps) => {
  // Add key prop to force re-render when userRounds changes
  const roundsKey = userRounds ? `rounds-${userRounds.length}` : 'no-rounds';
  
  useEffect(() => {
    console.log("[HandicapCircle] Rounds data changed, recalculating handicap", { 
      roundsCount: userRounds?.length 
    });
  }, [userRounds]);
  
  if (roundsLoading || !userRounds) {
    return (
      <div className="flex justify-center mb-8">
        <div className="w-60 h-60 rounded-full border-8 border-muted animate-pulse flex items-center justify-center">
        </div>
      </div>
    );
  }
  
  const stats = calculateStats(userRounds);
  const hasHandicap = stats.roundsNeededForHandicap === 0;
  
  console.log("[HandicapCircle] Rendering with handicap:", {
    roundsKey,
    roundsCount: userRounds.length,
    handicapIndex: stats.handicapIndex,
    hasHandicap,
    roundsNeededForHandicap: stats.roundsNeededForHandicap
  });
  
  return (
    <div key={roundsKey} className="flex flex-col items-center justify-center mb-8">
      <div className="relative mb-3">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onScoreTypeChange('gross')} 
            className={`px-3 py-1 rounded-full text-sm font-medium ${scoreType === 'gross' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
            Gross
          </button>
          <button 
            onClick={() => onScoreTypeChange('net')} 
            className={`px-3 py-1 rounded-full text-sm font-medium ${scoreType === 'net' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
            Net
          </button>
        </div>
      </div>
      
      <div className="w-60 h-60 rounded-full border-8 border-primary flex items-center justify-center">
        <div className="text-center px-6">
          {hasHandicap ? (
            <>
              <p className="text-sm font-medium text-muted-foreground">Handicap Index</p>
              <p className="text-5xl font-bold my-2">{stats.handicapIndex}</p>
              <p className="text-sm text-muted-foreground">Based on {stats.totalRounds} rounds</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-muted-foreground">Handicap Status</p>
              <p className="text-xl font-bold my-3">You need {stats.roundsNeededForHandicap} more {stats.roundsNeededForHandicap === 1 ? 'round' : 'rounds'} to get your handicap.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
