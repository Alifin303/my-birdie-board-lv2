
import { useState } from "react";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Target, Circle, AlertCircle, Info, TreeDeciduous } from "lucide-react";
import { Round } from "./types";
import { calculateGIRPercentage } from "@/components/add-round/utils/scoreUtils";
import { StatsLineChart } from "./StatsLineChart";

interface AdvancedStatsProps {
  userRounds: Round[] | undefined;
  isLoading: boolean;
}

export const AdvancedStats = ({ userRounds, isLoading }: AdvancedStatsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (isLoading) {
    return null;
  }
  
  const hasAdvancedStats = userRounds && userRounds.some(round => {
    if (!round.hole_scores) return false;
    
    let scores;
    try {
      scores = typeof round.hole_scores === 'string' 
        ? JSON.parse(round.hole_scores) 
        : round.hole_scores;
    } catch (e) {
      return false;
    }
    
    return scores.some((score: any) => 
      score.putts !== undefined || 
      score.gir !== undefined || 
      score.fairwayHit !== undefined ||
      score.penalties !== undefined
    );
  });
  
  const puttingStats = calculatePuttingStats(userRounds || []);
  const girStats = calculateGIRStats(userRounds || []);
  const fairwayStats = calculateFairwayStats(userRounds || []);
  const penaltyStats = calculatePenaltyStats(userRounds || []);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-semibold text-primary">Advanced Statistics</h2>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle advanced stats</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className="mt-4">
        {hasAdvancedStats ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {puttingStats.tracked && (
                <Card className="p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium flex items-center gap-1.5">
                        <Circle className="h-4 w-4 text-primary" />
                        Putting
                      </h3>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Avg Putts/Round:</span>
                          <span className="font-medium">{puttingStats.avgPuttsPerRound.toFixed(1)}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Avg Putts/Hole:</span>
                          <span className="font-medium">{puttingStats.avgPuttsPerHole.toFixed(2)}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Fewest Putts:</span>
                          <span className="font-medium">{puttingStats.fewestPutts}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
              )}
              
              {girStats.tracked && (
                <Card className="p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium flex items-center gap-1.5">
                        <Target className="h-4 w-4 text-primary" />
                        Greens in Regulation
                      </h3>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">GIR Percentage:</span>
                          <span className="font-medium">{girStats.girPercentage}%</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Best GIR Round:</span>
                          <span className="font-medium">{girStats.bestGIRRound}%</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Rounds Tracked:</span>
                          <span className="font-medium">{girStats.roundsTracked}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
              )}
              
              {fairwayStats.tracked && (
                <Card className="p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium flex items-center gap-1.5">
                        <TreeDeciduous className="h-4 w-4 text-primary" />
                        Fairways in Regulation
                      </h3>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">FIR Percentage:</span>
                          <span className="font-medium">{fairwayStats.firPercentage}%</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Best FIR Round:</span>
                          <span className="font-medium">{fairwayStats.bestFIRRound}%</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Rounds Tracked:</span>
                          <span className="font-medium">{fairwayStats.roundsTracked}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
              )}
              
              {penaltyStats.tracked && (
                <Card className="p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4 text-primary" />
                        Penalties
                      </h3>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Avg Penalties/Round:</span>
                          <span className="font-medium">{penaltyStats.avgPenaltiesPerRound.toFixed(1)}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Rounds Without Penalties:</span>
                          <span className="font-medium">{penaltyStats.roundsWithoutPenalties}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Total Penalties:</span>
                          <span className="font-medium">{penaltyStats.totalPenalties}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
              )}
            </div>
            
            <StatsLineChart 
              roundsData={userRounds || []}
              isLoading={isLoading}
            />
          </>
        ) : (
          <Card className="p-4 shadow-sm">
            <div className="flex items-start space-x-4">
              <Info className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-base">No Advanced Stats Available</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Track more details about your game like putts, greens in regulation, and penalties when entering scores to unlock advanced statistics.
                </p>
              </div>
            </div>
          </Card>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

function calculatePuttingStats(rounds: Round[]) {
  let totalPutts = 0;
  let totalHoles = 0;
  let roundsWithPuttingData = 0;
  let fewestPutts = Infinity;
  
  rounds.forEach(round => {
    let scores;
    try {
      scores = typeof round.hole_scores === 'string' 
        ? JSON.parse(round.hole_scores) 
        : round.hole_scores || [];
    } catch (e) {
      return;
    }
    
    const hasPuttingData = scores.some((score: any) => score.putts !== undefined);
    if (!hasPuttingData) return;
    
    roundsWithPuttingData++;
    
    let roundPutts = 0;
    let roundHoles = 0;
    
    scores.forEach((score: any) => {
      if (score.putts !== undefined) {
        roundPutts += score.putts;
        roundHoles++;
      }
    });
    
    if (roundHoles > 0) {
      totalPutts += roundPutts;
      totalHoles += roundHoles;
      
      if (roundHoles >= 9 && roundPutts < fewestPutts) {
        fewestPutts = roundPutts;
      }
    }
  });
  
  return {
    tracked: roundsWithPuttingData > 0,
    avgPuttsPerRound: roundsWithPuttingData > 0 ? totalPutts / roundsWithPuttingData : 0,
    avgPuttsPerHole: totalHoles > 0 ? totalPutts / totalHoles : 0,
    fewestPutts: fewestPutts === Infinity ? 0 : fewestPutts,
    roundsTracked: roundsWithPuttingData
  };
}

function calculateGIRStats(rounds: Round[]) {
  let totalGIRHits = 0;
  let totalPlayedHoles = 0;
  let roundsWithGIRData = 0;
  let roundGIRPercentages: number[] = [];

  rounds.forEach(round => {
    let scores;
    try {
      scores = typeof round.hole_scores === 'string' 
        ? JSON.parse(round.hole_scores) 
        : round.hole_scores || [];
    } catch (e) {
      return;
    }
    
    const hasGIRData = scores.some((score: any) => score.gir !== undefined);
    if (!hasGIRData) return;
    
    roundsWithGIRData++;
    
    const playedHoles = scores.filter((score: any) => 
      score.strokes !== undefined && score.strokes > 0
    );
    
    const roundGIRHits = playedHoles.filter((score: any) => score.gir === true).length;
    const roundPlayedHoles = playedHoles.length;
    
    totalGIRHits += roundGIRHits;
    totalPlayedHoles += roundPlayedHoles;
    
    const roundGIRPercentage = roundPlayedHoles > 0 ? 
      Math.round((roundGIRHits / roundPlayedHoles) * 100) : 0;
    
    console.log(`Round ${round.id} GIR calculation in stats:`, {
      date: new Date(round.date).toLocaleDateString(),
      roundGIRHits,
      roundPlayedHoles,
      girPercentage: roundGIRPercentage,
      holes: playedHoles.map((s: any) => ({ 
        hole: s.hole, 
        gir: s.gir,
        strokes: s.strokes
      }))
    });
    
    if (roundPlayedHoles >= 9) {
      roundGIRPercentages.push(roundGIRPercentage);
    }
  });
  
  const overallGIRPercentage = totalPlayedHoles > 0 ? 
    Math.round((totalGIRHits / totalPlayedHoles) * 100) : 0;
  
  let bestGIRRound = 0;
  if (roundGIRPercentages.length > 0) {
    bestGIRRound = Math.max(...roundGIRPercentages);
  }
  
  console.log("Overall GIR Stats calculation:", {
    totalGIRHits,
    totalPlayedHoles,
    overallGIRPercentage,
    bestGIRRound,
    roundsWithGIRData,
    roundGIRPercentages
  });
  
  return {
    tracked: roundsWithGIRData > 0,
    girPercentage: overallGIRPercentage,
    bestGIRRound,
    roundsTracked: roundsWithGIRData
  };
}

function calculatePenaltyStats(rounds: Round[]) {
  let totalPenalties = 0;
  let roundsWithPenaltyData = 0;
  let roundsWithoutPenalties = 0;
  let totalTrackedRounds = 0;
  
  rounds.forEach(round => {
    let scores;
    try {
      scores = typeof round.hole_scores === 'string' 
        ? JSON.parse(round.hole_scores) 
        : round.hole_scores || [];
    } catch (e) {
      return;
    }
    
    // Check for rounds with explicitly tracked penalties (penalties field exists)
    const hasPenaltyData = scores.some((score: any) => score.penalties !== undefined);
    
    if (!hasPenaltyData) {
      // If penalties aren't being tracked at all for this round, consider it a round without penalties
      roundsWithoutPenalties++;
      return;
    }
    
    totalTrackedRounds++;
    roundsWithPenaltyData++;
    
    let roundPenalties = 0;
    
    scores.forEach((score: any) => {
      if (score.penalties !== undefined) {
        roundPenalties += score.penalties;
      }
    });
    
    if (roundPenalties === 0) {
      roundsWithoutPenalties++;
    }
    
    totalPenalties += roundPenalties;
  });
  
  console.log("Penalty stats calculation:", {
    totalTrackedRounds,
    roundsWithPenaltyData,
    roundsWithoutPenalties,
    totalPenalties,
    avgPenaltiesPerRound: roundsWithPenaltyData > 0 ? totalPenalties / roundsWithPenaltyData : 0
  });
  
  return {
    tracked: roundsWithPenaltyData > 0,
    totalPenalties,
    avgPenaltiesPerRound: roundsWithPenaltyData > 0 ? totalPenalties / roundsWithPenaltyData : 0,
    roundsWithoutPenalties,
    roundsTracked: roundsWithPenaltyData
  };
}

function calculateFairwayStats(rounds: Round[]) {
  let totalFairwayHits = 0;
  let totalFairwayHoles = 0;
  let roundsWithFIRData = 0;
  let roundFIRPercentages: number[] = [];

  rounds.forEach(round => {
    let scores;
    try {
      scores = typeof round.hole_scores === 'string' 
        ? JSON.parse(round.hole_scores) 
        : round.hole_scores || [];
    } catch (e) {
      return;
    }
    
    const hasFIRData = scores.some((score: any) => score.fairwayHit !== undefined);
    if (!hasFIRData) return;
    
    roundsWithFIRData++;
    
    // Only count par 4s and par 5s for fairway stats
    const fairwayHoles = scores.filter((score: any) => 
      score.par >= 4 && score.strokes !== undefined && score.strokes > 0
    );
    
    const roundFIRHits = fairwayHoles.filter((score: any) => score.fairwayHit === true).length;
    const roundFairwayHoles = fairwayHoles.length;
    
    totalFairwayHits += roundFIRHits;
    totalFairwayHoles += roundFairwayHoles;
    
    const roundFIRPercentage = roundFairwayHoles > 0 ? 
      Math.round((roundFIRHits / roundFairwayHoles) * 100) : 0;
    
    if (roundFairwayHoles >= 5) {
      roundFIRPercentages.push(roundFIRPercentage);
    }
  });
  
  const overallFIRPercentage = totalFairwayHoles > 0 ? 
    Math.round((totalFairwayHits / totalFairwayHoles) * 100) : 0;
  
  let bestFIRRound = 0;
  if (roundFIRPercentages.length > 0) {
    bestFIRRound = Math.max(...roundFIRPercentages);
  }
  
  return {
    tracked: roundsWithFIRData > 0,
    firPercentage: overallFIRPercentage,
    bestFIRRound,
    roundsTracked: roundsWithFIRData
  };
}
