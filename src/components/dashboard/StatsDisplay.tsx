import { CalendarDays, Trophy, Flag, TrendingUp, Hash } from "lucide-react";
import { Stats, Round } from "./types";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { HandicapCard } from "./HandicapCard";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type RoundFilter = 'all' | '9hole' | '18hole';
type ScoreMode = 'stroke' | 'stableford';

interface StatsDisplayProps {
  userRounds: Round[] | undefined;
  roundsLoading: boolean;
  scoreType: 'gross' | 'net';
  onScoreTypeChange?: (type: 'gross' | 'net') => void;
  calculateStats: (rounds: Round[]) => Stats;
  handicapIndex: number;
  profileHandicap?: number;
  roundFilter?: RoundFilter;
  onRoundFilterChange?: (filter: RoundFilter) => void;
  scoreMode?: ScoreMode;
  onScoreModeChange?: (mode: ScoreMode) => void;
  userName?: string;
  userId?: string;
}

const filterRoundsByType = (rounds: Round[], filter: RoundFilter): Round[] => {
  if (!rounds) return [];
  
  switch (filter) {
    case '9hole':
      return rounds.filter(round => (round.holes_played || 18) === 9);
    case '18hole':
      return rounds.filter(round => (round.holes_played || 18) === 18);
    case 'all':
    default:
      return rounds;
  }
};

export const MainStats = ({ 
  userRounds, 
  roundsLoading, 
  scoreType, 
  calculateStats, 
  handicapIndex, 
  roundFilter = 'all',
  onRoundFilterChange,
  scoreMode = 'stroke',
  onScoreModeChange
}: Omit<StatsDisplayProps, 'onScoreTypeChange' | 'profileHandicap'>) => {
  const roundsKey = userRounds ? `rounds-${userRounds.length}` : 'no-rounds';
  
  useEffect(() => {
    console.log("[MainStats] Rounds data changed, recalculating stats", { 
      roundsCount: userRounds?.length, 
      handicapIndex
    });
  }, [userRounds, handicapIndex]);
  
  // Initialize stats with default values
  let stats: Stats = {
    totalRounds: 0,
    bestGrossScore: 0,
    bestNetScore: null,
    bestToPar: 0,
    bestToParNet: null,
    handicapIndex: 0,
    roundsNeededForHandicap: 0
  };

  // Only calculate stats if we have rounds data
  if (!roundsLoading && userRounds) {
    // Filter rounds based on the selected filter
    const filteredRounds = filterRoundsByType(userRounds, roundFilter);
    stats = calculateStats(filteredRounds);
    
    console.log("[MainStats] Calculating scores with:", {
      roundsKey,
      roundsCount: userRounds.length,
      bestGrossScore: stats.bestGrossScore,
      bestNetScore: stats.bestNetScore,
      bestToPar: stats.bestToPar,
      bestToParNet: stats.bestToParNet,
      handicapIndex: handicapIndex,
      bestStablefordGross: stats.bestStablefordGross,
      bestStablefordNet: stats.bestStablefordNet
    });
    
    if (scoreType === 'net' && filteredRounds.length > 0) {
      const calculatedRounds = filteredRounds.map(round => {
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
      
      stats.bestNetScore = sortedByNetScore[0]?.net || null;
      stats.bestToParNet = sortedByToParNet[0]?.toParNet || null;
    }
  }
  
  // Render a loading skeleton if data is loading
  if (roundsLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-background/50 animate-pulse h-24 rounded-lg border"></div>
        ))}
      </div>
    );
  }

  // Determine what to display based on scoreMode
  const isStablefordMode = scoreMode === 'stableford';
  
  // Get display values based on mode
  const getDisplayValues = () => {
    if (isStablefordMode) {
      const stablefordValue = scoreType === 'gross' 
        ? stats.bestStablefordGross 
        : stats.bestStablefordNet;
      const avgStableford = scoreType === 'gross'
        ? stats.avgStablefordGross
        : stats.avgStablefordNet;
      return {
        mainLabel: 'Best Stableford',
        mainValue: stablefordValue ?? '-',
        secondLabel: 'Avg Stableford',
        secondValue: avgStableford ?? '-'
      };
    }
    return {
      mainLabel: 'Best Score',
      mainValue: scoreType === 'gross' ? stats.bestGrossScore : stats.bestNetScore,
      secondLabel: 'Best to Par',
      secondValue: scoreType === 'gross' 
        ? (stats.bestToPar > 0 ? '+' : '') + stats.bestToPar 
        : (stats.bestToParNet !== null && stats.bestToParNet > 0 ? '+' : '') + stats.bestToParNet
    };
  };

  const displayValues = getDisplayValues();
  
  // Render the actual stats
  return (
    <div key={roundsKey} className="space-y-4 p-4 sm:p-6">
      {/* Score Mode Toggle (Stroke/Stableford) */}
      {onScoreModeChange && (
        <div className="flex justify-center">
          <ToggleGroup 
            type="single" 
            value={scoreMode} 
            onValueChange={(value) => value && onScoreModeChange(value as ScoreMode)}
            className="bg-muted/50 p-1 rounded-lg"
          >
            <ToggleGroupItem value="stroke" aria-label="Stroke play" className="px-4">
              <Hash className="h-4 w-4 mr-2" />
              Stroke
            </ToggleGroupItem>
            <ToggleGroupItem value="stableford" aria-label="Stableford" className="px-4">
              <TrendingUp className="h-4 w-4 mr-2" />
              Stableford
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}
      
      {/* Round Filter Toggle */}
      {onRoundFilterChange && (
        <div className="flex justify-center">
          <div className="flex space-x-1 bg-muted/50 rounded-lg p-1">
            <Button
              variant={roundFilter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onRoundFilterChange('all')}
              className="h-8 px-3 text-xs"
            >
              All Rounds
            </Button>
            <Button
              variant={roundFilter === '9hole' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onRoundFilterChange('9hole')}
              className="h-8 px-3 text-xs"
            >
              9 Hole
            </Button>
            <Button
              variant={roundFilter === '18hole' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onRoundFilterChange('18hole')}
              className="h-8 px-3 text-xs"
            >
              18 Hole
            </Button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
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
              <p className="text-sm font-medium text-muted-foreground">{displayValues.mainLabel}</p>
              <p className="text-2xl sm:text-3xl font-bold truncate">
                {displayValues.mainValue}
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
              <p className="text-sm font-medium text-muted-foreground">{displayValues.secondLabel}</p>
              <p className="text-2xl sm:text-3xl font-bold truncate">
                {displayValues.secondValue}
              </p>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 rounded-full flex items-center justify-center bg-primary/10">
              {isStablefordMode ? (
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              ) : (
                <Flag className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HandicapCircle = ({ userRounds, roundsLoading, scoreType, onScoreTypeChange, calculateStats, handicapIndex, profileHandicap, userName, userId }: StatsDisplayProps) => {
  const roundsKey = userRounds ? `rounds-${userRounds.length}` : 'no-rounds';
  const [showHandicapCard, setShowHandicapCard] = useState(false);
  
  useEffect(() => {
    console.log("[HandicapCircle] Rounds data changed, handicap info:", { 
      roundsCount: userRounds?.length,
      profileHandicap,
      calculatedHandicap: handicapIndex
    });
  }, [userRounds, handicapIndex, profileHandicap]);
  
  // Initialize stats with default values
  let stats: Stats = {
    totalRounds: 0,
    bestGrossScore: 0,
    bestNetScore: null,
    bestToPar: 0,
    bestToParNet: null,
    handicapIndex: 0,
    roundsNeededForHandicap: 5
  };
  
  let hasHandicap = false;
  let displayHandicap = 0;

  // Only calculate stats if we have rounds data
  if (!roundsLoading && userRounds) {
    stats = calculateStats(userRounds);
    displayHandicap = profileHandicap !== undefined ? profileHandicap : stats.handicapIndex;
    hasHandicap = stats.roundsNeededForHandicap === 0;
    
    console.log("[HandicapCircle] Rendering with handicap:", {
      roundsKey,
      roundsCount: userRounds.length,
      calculatedHandicapIndex: stats.handicapIndex,
      profileHandicap: profileHandicap,
      displayHandicap: displayHandicap,
      hasHandicap,
      roundsNeededForHandicap: stats.roundsNeededForHandicap
    });
  }
  
  // Render a loading skeleton if data is loading
  if (roundsLoading) {
    return (
      <div className="flex justify-center mb-8">
        <div className="w-60 h-60 rounded-full border-8 border-muted animate-pulse flex items-center justify-center">
        </div>
      </div>
    );
  }
  
  // Format the handicap with a + sign for negative handicaps (plus handicaps in golf terms)
  const formattedHandicap = displayHandicap < 0 
    ? `+${Math.abs(displayHandicap).toFixed(1)}` 
    : displayHandicap.toFixed(1);
  
  // Render the actual handicap circle
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
              <p className="text-5xl font-bold my-2">{formattedHandicap}</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-muted-foreground">Handicap Status</p>
              <p className="text-xl font-bold my-3">You need {stats.roundsNeededForHandicap} more {stats.roundsNeededForHandicap === 1 ? 'round' : 'rounds'} to get your handicap.</p>
            </>
          )}
        </div>
      </div>
      
      {hasHandicap && userName && userId && (
        <Button 
          onClick={() => setShowHandicapCard(true)}
          variant="outline"
          className="mt-4"
        >
          Show Handicap Card
        </Button>
      )}

      {userName && userId && (
        <HandicapCard
          open={showHandicapCard}
          onOpenChange={setShowHandicapCard}
          userName={userName}
          handicap={displayHandicap}
          userId={userId}
        />
      )}
    </div>
  );
};
