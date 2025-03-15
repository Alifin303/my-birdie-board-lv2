
import { useState } from "react";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Target, GolfBall, AlertCircle } from "lucide-react";
import { Round } from "./types";

interface AdvancedStatsProps {
  userRounds: Round[] | undefined;
  isLoading: boolean;
}

export const AdvancedStats = ({ userRounds, isLoading }: AdvancedStatsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (isLoading || !userRounds || userRounds.length === 0) {
    return null;
  }
  
  // Check if any rounds have advanced stats tracked
  const hasAdvancedStats = userRounds.some(round => {
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
      score.penalties !== undefined
    );
  });
  
  // If no advanced stats have been tracked, don't render anything
  if (!hasAdvancedStats) {
    return null;
  }
  
  // Calculate putting statistics
  const puttingStats = calculatePuttingStats(userRounds);
  
  // Calculate GIR statistics
  const girStats = calculateGIRStats(userRounds);
  
  // Calculate penalty statistics
  const penaltyStats = calculatePenaltyStats(userRounds);
  
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {puttingStats.tracked && (
            <Card className="p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium flex items-center gap-1.5">
                    <GolfBall className="h-4 w-4 text-primary" />
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
      </CollapsibleContent>
    </Collapsible>
  );
};

// Helper functions to calculate statistics
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
      
      // Track the round with fewest putts (minimum 9 holes)
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
  let totalGIR = 0;
  let totalHoles = 0;
  let roundsWithGIRData = 0;
  let bestGIRPercentage = 0;
  
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
    
    let roundGIR = 0;
    let roundHoles = 0;
    
    scores.forEach((score: any) => {
      if (score.gir !== undefined) {
        if (score.gir) roundGIR++;
        roundHoles++;
      }
    });
    
    if (roundHoles > 0) {
      const roundGIRPercentage = Math.round((roundGIR / roundHoles) * 100);
      if (roundGIRPercentage > bestGIRPercentage && roundHoles >= 9) {
        bestGIRPercentage = roundGIRPercentage;
      }
      
      totalGIR += roundGIR;
      totalHoles += roundHoles;
    }
  });
  
  return {
    tracked: roundsWithGIRData > 0,
    girPercentage: totalHoles > 0 ? Math.round((totalGIR / totalHoles) * 100) : 0,
    bestGIRRound: bestGIRPercentage,
    roundsTracked: roundsWithGIRData
  };
}

function calculatePenaltyStats(rounds: Round[]) {
  let totalPenalties = 0;
  let roundsWithPenaltyData = 0;
  let roundsWithoutPenalties = 0;
  
  rounds.forEach(round => {
    let scores;
    try {
      scores = typeof round.hole_scores === 'string' 
        ? JSON.parse(round.hole_scores) 
        : round.hole_scores || [];
    } catch (e) {
      return;
    }
    
    const hasPenaltyData = scores.some((score: any) => score.penalties !== undefined);
    if (!hasPenaltyData) return;
    
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
  
  return {
    tracked: roundsWithPenaltyData > 0,
    totalPenalties,
    avgPenaltiesPerRound: roundsWithPenaltyData > 0 ? totalPenalties / roundsWithPenaltyData : 0,
    roundsWithoutPenalties,
    roundsTracked: roundsWithPenaltyData
  };
}
