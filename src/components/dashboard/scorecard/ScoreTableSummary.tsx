
import { ScoreTableSummaryProps } from "./types";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase";

export const ScoreTableSummary = ({ scores, userId }: ScoreTableSummaryProps) => {
  const [handicap, setHandicap] = useState<number>(0);
  
  useEffect(() => {
    if (userId) {
      const fetchHandicap = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('handicap')
          .eq('id', userId)
          .single();
          
        if (!error && data) {
          setHandicap(data.handicap || 0);
        }
      };
      
      fetchHandicap();
    }
  }, [userId]);
  
  if (!scores || scores.length === 0) return null;
  
  const totalScore = scores.reduce((sum, score) => sum + (score.strokes || 0), 0);
  const totalPar = scores.reduce((sum, score) => sum + score.par, 0);
  const toPar = totalScore - totalPar;
  
  // Calculate net score by applying the handicap
  const handicapToApply = Math.round(handicap);
  const netScore = totalScore - handicapToApply;
  const toParNet = netScore - totalPar;
  
  return (
    <div className="pt-2 border-t">
      <div className="flex justify-between">
        <span className="font-medium">Total Score (Gross):</span>
        <span>{totalScore}</span>
      </div>
      {handicap > 0 && (
        <div className="flex justify-between">
          <span className="font-medium">Net Score:</span>
          <span>{netScore}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span className="font-medium">Total Par:</span>
        <span>{totalPar}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-medium">To Par (Gross):</span>
        <span>
          {toPar > 0 ? `+${toPar}` : toPar}
        </span>
      </div>
      {handicap > 0 && (
        <div className="flex justify-between">
          <span className="font-medium">To Par (Net):</span>
          <span>
            {toParNet > 0 ? `+${toParNet}` : toParNet}
          </span>
        </div>
      )}
      {handicap > 0 && (
        <div className="flex justify-between text-sm text-muted-foreground mt-1">
          <span>Handicap applied:</span>
          <span>{handicap}</span>
        </div>
      )}
    </div>
  );
};
