
import { ScoreTableSummaryProps } from "./types";
import { formatToPar, calculateGIRPercentage } from "@/components/add-round/utils/scoreUtils";

export const ScoreTableSummary = ({ 
  scores, 
  handicapIndex = 0,
  showNet = false,
  showDetailedStats = false
}: ScoreTableSummaryProps) => {
  if (!scores || scores.length === 0) return null;
  
  const totalStrokes = scores.reduce((sum, score) => sum + (score.strokes || 0), 0);
  const totalPar = scores.reduce((sum, score) => sum + score.par, 0);
  const toPar = totalStrokes - totalPar;
  
  // Calculate net score if handicap is provided
  const netScore = Math.round(totalStrokes - handicapIndex);
  const toParNet = netScore - totalPar;
  
  // Calculate detailed statistics
  const totalPutts = scores.reduce((sum, score) => sum + (score.putts || 0), 0);
  const puttingAverage = totalPutts > 0 ? (totalPutts / scores.filter(s => (s.putts || 0) > 0).length).toFixed(1) : '-';
  
  // Use the consistent GIR calculation function
  const { girPercentage, totalGIR } = calculateGIRPercentage(scores);
  
  const totalPenalties = scores.reduce((sum, score) => sum + (score.penalties || 0), 0);
  
  const hasPuttData = scores.some(score => score.putts !== undefined);
  const hasGIRData = scores.some(score => score.gir !== undefined);
  const hasPenaltyData = scores.some(score => score.penalties !== undefined);
  
  return (
    <div className="pt-2 border-t space-y-3">
      <div className="flex justify-between">
        <span className="font-medium">Total Score:</span>
        <span>{totalStrokes}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-medium">Total Par:</span>
        <span>{totalPar}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-medium">To Par:</span>
        <span>{formatToPar(toPar)}</span>
      </div>
      
      {showNet && handicapIndex > 0 && (
        <>
          <div className="flex justify-between">
            <span className="font-medium">Net Score:</span>
            <span>{netScore}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Net To Par:</span>
            <span>{formatToPar(toParNet)}</span>
          </div>
        </>
      )}
      
      {showDetailedStats && (
        <>
          {hasPuttData && (
            <>
              <div className="flex justify-between">
                <span className="font-medium">Total Putts:</span>
                <span>{totalPutts}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Putts per Hole:</span>
                <span>{puttingAverage}</span>
              </div>
            </>
          )}
          
          {hasGIRData && (
            <div className="flex justify-between">
              <span className="font-medium">Greens in Regulation:</span>
              <span>{totalGIR}/{scores.filter(s => s.strokes && s.strokes > 0).length} ({girPercentage}%)</span>
            </div>
          )}
          
          {hasPenaltyData && (
            <div className="flex justify-between">
              <span className="font-medium">Penalty Strokes:</span>
              <span>{totalPenalties}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};
