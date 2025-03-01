
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
            <p className="text-3xl font-bold">{scoreType === 'gross' ? stats.bestGrossScore : (stats.bestNetScore || '-')}</p>
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
                : stats.bestToParNet !== null 
                  ? (stats.bestToParNet > 0 ? '+' : '') + stats.bestToParNet 
                  : '-'}
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
              <p className="text-5xl font-bold my-2">{stats.handicapIndex.toFixed(1)}</p>
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
