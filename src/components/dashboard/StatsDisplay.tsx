
import { CalendarDays, Trophy, Flag } from "lucide-react";

interface Round {
  id: number;
  date: string;
  tee_name: string;
  gross_score: number;
  net_score?: number;
  to_par_gross: number;
  to_par_net?: number;
  courses?: {
    id: number;
    name: string;
    city?: string;
    state?: string;
  };
}

interface Stats {
  totalRounds: number;
  bestGrossScore: number;
  bestNetScore: number | null;
  bestToPar: number;
  bestToParNet: number | null;
  averageScore: number;
  handicapIndex: number;
  roundsNeededForHandicap: number;
}

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
  console.log("Stats for MainStats:", { 
    scoreType, 
    bestGrossScore: stats.bestGrossScore, 
    bestNetScore: stats.bestNetScore,
    bestToPar: stats.bestToPar,
    bestToParNet: stats.bestToParNet,
    handicapIndex: stats.handicapIndex
  });
  
  // Simple calculation for net scores when toggling
  let displayedScore, displayedToPar;
  
  if (scoreType === 'gross') {
    displayedScore = stats.bestGrossScore;
    displayedToPar = (stats.bestToPar > 0 ? '+' : '') + stats.bestToPar;
  } else {
    // For net score: simply subtract handicap from gross score
    const netScore = stats.handicapIndex > 0 ? Math.round(stats.bestGrossScore - stats.handicapIndex) : stats.bestGrossScore;
    displayedScore = netScore;
    
    // For net to par: subtract handicap from gross to par
    const netToPar = stats.handicapIndex > 0 ? stats.bestToPar - Math.round(stats.handicapIndex) : stats.bestToPar;
    displayedToPar = (netToPar > 0 ? '+' : '') + netToPar;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
            <p className="text-3xl font-bold">{displayedScore}</p>
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
            <p className="text-3xl font-bold">{displayedToPar}</p>
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
  
  const handleScoreTypeChange = (type: 'gross' | 'net') => {
    console.log("HandicapCircle: changing score type to", type);
    
    // Ensure we're not triggering unnecessary re-renders if type is the same
    if (type !== scoreType) {
      onScoreTypeChange(type);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center mb-8">
      <div className="relative mb-3">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleScoreTypeChange('gross')} 
            className={`px-3 py-1 rounded-full text-sm font-medium ${scoreType === 'gross' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
            Gross
          </button>
          <button 
            onClick={() => handleScoreTypeChange('net')} 
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
