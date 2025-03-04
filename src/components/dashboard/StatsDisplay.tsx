
import { CalendarDays, Trophy, Flag } from "lucide-react";
import { Stats, Round } from "./types";

interface StatsDisplayProps {
  userRounds: Round[] | undefined;
  roundsLoading: boolean;
  scoreType: 'gross' | 'net';
  onScoreTypeChange: (type: 'gross' | 'net') => void;
  calculateStats: (rounds: Round[]) => Stats;
}

export const MainStats = ({ userRounds, roundsLoading, scoreType, calculateStats }: Omit<StatsDisplayProps, 'onScoreTypeChange'>) => {
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
    bestGrossScore: stats.bestGrossScore,
    bestNetScore: stats.bestNetScore,
    handicapIndex: stats.handicapIndex
  });
  
  // Calculate net scores based on handicap if not already available
  const bestNetScore = stats.bestNetScore !== null 
    ? stats.bestNetScore 
    : (stats.handicapIndex > 0 ? Math.max(0, stats.bestGrossScore - stats.handicapIndex) : stats.bestGrossScore);
    
  const bestNetToPar = stats.bestToParNet !== null
    ? stats.bestToParNet
    : (stats.handicapIndex > 0 ? stats.bestToPar - stats.handicapIndex : stats.bestToPar);
  
  console.log("[MainStats] Calculated scores:", {
    bestGrossScore: stats.bestGrossScore,
    calculatedBestNetScore: bestNetScore,
    difference: stats.bestGrossScore - bestNetScore,
    bestToPar: stats.bestToPar,
    bestNetToPar: bestNetToPar
  });
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-white/10 backdrop-blur-md border-white/20 rounded-lg p-5 shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-white/80">Rounds Played</p>
            <p className="text-3xl font-bold">{stats.totalRounds}</p>
          </div>
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-accent/20">
            <CalendarDays className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-md border-white/20 rounded-lg p-5 shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-white/80">Best Score</p>
            <p className="text-3xl font-bold">
              {scoreType === 'gross' ? stats.bestGrossScore : bestNetScore}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-accent/20">
            <Trophy className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-md border-white/20 rounded-lg p-5 shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-white/80">Best to Par</p>
            <p className="text-3xl font-bold">
              {scoreType === 'gross' 
                ? (stats.bestToPar > 0 ? '+' : '') + stats.bestToPar 
                : (bestNetToPar > 0 ? '+' : '') + bestNetToPar}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-accent/20">
            <Flag className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const HandicapCircle = ({ userRounds, roundsLoading, scoreType, onScoreTypeChange, calculateStats }: StatsDisplayProps) => {
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
  
  return (
    <div className="flex flex-col items-center justify-center mb-8">
      <div className="relative mb-3">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onScoreTypeChange('gross')} 
            className={`px-3 py-1 rounded-full text-sm font-medium ${scoreType === 'gross' ? 'bg-accent text-white' : 'bg-white/10 text-white'}`}
          >
            Gross
          </button>
          <button 
            onClick={() => onScoreTypeChange('net')} 
            className={`px-3 py-1 rounded-full text-sm font-medium ${scoreType === 'net' ? 'bg-accent text-white' : 'bg-white/10 text-white'}`}
          >
            Net
          </button>
        </div>
      </div>
      
      <div className="w-60 h-60 rounded-full border-8 border-primary bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
        <div className="text-center px-6">
          {hasHandicap ? (
            <>
              <p className="text-sm font-medium text-white/80">Handicap Index</p>
              <p className="text-5xl font-bold my-2">{stats.handicapIndex}</p>
              <p className="text-sm text-white/80">Based on {stats.totalRounds} rounds</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-white/80">Handicap Status</p>
              <p className="text-xl font-bold my-3">You need {stats.roundsNeededForHandicap} more {stats.roundsNeededForHandicap === 1 ? 'round' : 'rounds'} to get your handicap.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
