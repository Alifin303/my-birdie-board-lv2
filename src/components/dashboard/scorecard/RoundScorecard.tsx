
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Round } from "../types";
import { ScorecardHeader } from "./ScorecardHeader";
import { ScoreTable } from "./ScoreTable";
import { ScoreTableSummary } from "./ScoreTableSummary";

interface RoundScorecardProps {
  round: Round;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  handicapIndex: number;
  isDemo?: boolean;
}

export const RoundScorecard = ({ 
  round, 
  isOpen, 
  onOpenChange, 
  handicapIndex,
  isDemo = false 
}: RoundScorecardProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isDemo ? 'Demo ' : ''}Round Scorecard - {round.courses?.clubName || 'Unknown Course'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <ScorecardHeader round={round} handicapIndex={handicapIndex} />
          <ScoreTable round={round} />
          <ScoreTableSummary round={round} handicapIndex={handicapIndex} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
