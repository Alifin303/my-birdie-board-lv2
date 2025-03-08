import { CalendarDays, Trophy, Flag } from "lucide-react";
import { Stats, Round } from "./types";
import React, { useEffect } from "react";

interface StatsDisplayProps {
  userRounds: Round[] | undefined;
  roundsLoading: boolean;
  scoreType: 'gross' | 'net';
  onScoreTypeChange?: (type: 'gross' | 'net') => void;
  calculateStats: (rounds: Round[]) => Stats;
  handicapIndex: number;
  profileHandicap?: number;
}

export const MainStats = ({ userRounds, roundsLoading, scoreType, calculateStats, handicapIndex }: Omit<StatsDisplayProps, 'onScoreTypeChange' | 'profileHandicap'>) => {
  const roundsKey = userRounds ? `rounds-${userRounds.length}` : 'no-rounds';
  
  useEffect(() => {
    console.log("[MainStats] Rounds data changed, recalculating stats", { 
      roundsCount: userRounds?.length, 
      handicapIndex
    });
  }, [userRounds, handicapIndex]);
  
  if (roundsLoading || !userRounds) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-background/50 animate-pulse h-24 rounded-lg border"></div>
        ))}
      </div>
    );
  }

  const stats = calculateStats(userRounds);
  
  console.log("[MainStats] Calculating scores with:", {
    roundsKey,
    roundsCount: userRounds.length,
    bestGrossScore: stats.bestGrossScore,
    bestNetScore: stats.bestNetScore,
    bestToPar: stats.bestToPar,
    bestToParNet: stats.bestToParNet,
    handicapIndex: handicapIndex
  });
  
  if (scoreType === 'net' && userRounds.length > 0) {
    const calculatedRounds = userRounds.map(round => {
      const netScore = Math.round(round.gross_score - handicapIndex);
      const netToPar = Math.round(round.to_par_gross - handicapIndex);
      return { 
        id: round.id, 
        date: round.date, 
        gross: round.gross_score, 
        net: netScore, 
        toPar: round.to_par_gross,
        toParNet: netToPar,
        courseName: round.courses?.courseName,
        clubName: round.courses?.clubName
      };
    });
    
    const sortedByNetScore = [...calculatedRounds].sort((a, b) => a.net - b.net);
    const sortedByToParNet = [...calculatedRounds].sort((a, b) => a.toParNet - b.toParNet);
    
    console.log("[MainStats] All rounds with net scores:", calculatedRounds.map(r => ({
      id: r.id,
      date: new Date(r.date).toLocaleDateString(),
      course: r.courseName,
      club: r.clubName,
      gross: r.gross,
      net: r.net,
      toPar: r.toPar,
      toParNet: r.toParNet
    })));
    
    console.log("[MainStats] Best rounds by net score:", sortedByNetScore.slice(0, 3).map(r => ({
      id: r.id,
      course: r.courseName,
      score: r.net,
      date: new Date(r.date).toLocaleDateString()
    })));
    
    console.log("[MainStats] Best rounds by net to par:", sortedByToParNet.slice(0, 3).map(r => ({
      id: r.id,
      course: r.courseName,
      toPar: r.toParNet,
      date: new Date(r.date).toLocaleDateString()
    })));

    stats.bestNetScore = sortedByNetScore[0]?.net || null;
    stats.bestToParNet = sortedByToParNet[0]?.toParNet || null;
  }
  
  return (
    <div key={roundsKey} className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
      <div className="bg-background rounded-lg p-4 border">
        <div className="flex items-center justify-between">
          <div className="space-y-1 pr-2">
            <p className="text-sm font-medium text-muted-foreground">Rounds Played</p>
            <p className="text-2xl sm:text-3xl font-bold truncate">{stats.totalRounds}</p>
          </div>
          <div className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 rounded-full flex items-center justify-center bg-primary/10">
            <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
        </div>
      </div>
      
      <div className="bg-background rounded-lg p-4 border">
        <div className="flex items-center justify-between">
          <div className="space-y-1 pr-2">
            <p className="text-sm font-medium text-muted-foreground">Best Score</p>
            <p className="text-2xl sm:text-3xl font-bold truncate">
              {scoreType === 'gross' ? stats.bestGrossScore : stats.bestNetScore}
            </p>
          </div>
          <div className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 rounded-full flex items-center justify-center bg-primary/10">
            <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
        </div>
      </div>
      
      <div className="bg-background rounded-lg p-4 border">
        <div className="flex items-center justify-between">
          <div className="space-y-1 pr-2">
            <p className="text-sm font-medium text-muted-foreground">Best to Par</p>
            <p className="text-2xl sm:text-3xl font-bold truncate">
              {scoreType === 'gross' 
                ? (stats.bestToPar > 0 ? '+' : '') + stats.bestToPar 
                : (stats.bestToParNet !== null && stats.bestToParNet > 0 ? '+' : '') + stats.bestToParNet}
            </p>
          </div>
          <div className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 rounded-full flex items-center justify-center bg-primary/10">
            <Flag className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const HandicapCircle = ({ userRounds, roundsLoading, scoreType, onScoreTypeChange, calculateStats, handicapIndex, profileHandicap }: StatsDisplayProps) => {
  const roundsKey = userRounds ? `rounds-${userRounds.length}` : 'no-rounds';
  
  useEffect(() => {
    console.log("[HandicapCircle] Rounds data changed, handicap info:", { 
      roundsCount: userRounds?.length,
      profileHandicap,
      calculatedHandicap: handicapIndex
    });
  }, [userRounds, handicapIndex, profileHandicap]);
  
  if (roundsLoading || !userRounds) {
    return (
      <div className="flex justify-center mb-8">
        <div className="w-60 h-60 rounded-full border-8 border-muted animate-pulse flex items-center justify-center">
        </div>
      </div>
    );
  }
  
  const stats = calculateStats(userRounds);
  const displayHandicap = profileHandicap !== undefined ? profileHandicap : stats.handicapIndex;
  const hasHandicap = stats.roundsNeededForHandicap === 0;
  
  console.log("[HandicapCircle] Rendering with handicap:", {
    roundsKey,
    roundsCount: userRounds.length,
    calculatedHandicapIndex: stats.handicapIndex,
    profileHandicap: profileHandicap,
    displayHandicap: displayHandicap,
    hasHandicap,
    roundsNeededForHandicap: stats.roundsNeededForHandicap
  });
  
  return (
    <div key={roundsKey} className="flex flex-col items-center justify-center mb-8">
      <div className="relative mb-3">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onScoreTypeChange && onScoreTypeChange('gross')} 
            className={`px-3 py-1 rounded-full text-sm font-medium ${scoreType === 'gross' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
            Gross
          </button>
          <button 
            onClick={() => onScoreTypeChange && onScoreTypeChange('net')} 
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
              <p className="text-5xl font-bold my-2">{displayHandicap}</p>
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
