
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Round } from "../types";
import { ScorecardHeader } from "./ScorecardHeader";
import { ScoreTable } from "./ScoreTable";
import { ScoreTableSummary } from "./ScoreTableSummary";
import { RoundScorecardProps, HoleScore } from "./types";
import { useState, useEffect } from "react";

export const RoundScorecard = ({ 
  round, 
  isOpen, 
  onOpenChange, 
  handicapIndex = 0,
  isDemo = false,
  isAdmin = false
}: RoundScorecardProps) => {
  const [scores, setScores] = useState<HoleScore[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [roundDate, setRoundDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDetailedStats, setShowDetailedStats] = useState(false);

  useEffect(() => {
    if (round && isOpen) {
      let parsedScores: HoleScore[] = [];
      try {
        parsedScores = typeof round.hole_scores === 'string' 
          ? JSON.parse(round.hole_scores) 
          : round.hole_scores || [];
      } catch (error) {
        console.error("Error parsing hole scores:", error);
        parsedScores = [];
      }
      
      setScores(parsedScores);
      setRoundDate(round.date ? new Date(round.date) : undefined);
      setIsEditing(false);
      setShowDetailedStats(false);
    }
  }, [round, isOpen]);

  const handleDateSelect = (date: Date | undefined) => {
    setRoundDate(date);
    setCalendarOpen(false);
  };

  const handleScoreChange = (index: number, field: 'strokes' | 'putts' | 'penalties', value: string) => {
    const newScores = [...scores];
    const parsedValue = value === '' ? 0 : parseInt(value, 10);
    
    if (!isNaN(parsedValue)) {
      newScores[index] = {
        ...newScores[index],
        [field]: parsedValue,
      };
      setScores(newScores);
    }
  };

  const handleGIRChange = (index: number, value: boolean) => {
    const newScores = [...scores];
    newScores[index] = {
      ...newScores[index],
      gir: value,
    };
    setScores(newScores);
  };

  const handleSaveChanges = async () => {
    // Implementation for saving changes
    console.log("Save changes would be implemented here");
  };

  if (!round) return null;

  const front9 = scores.filter(score => score.hole <= 9);
  const back9 = scores.filter(score => score.hole > 9);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isDemo ? 'Demo ' : ''}Round Scorecard - {round.courses?.clubName || 'Unknown Course'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <ScorecardHeader 
            round={round}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            roundDate={roundDate}
            calendarOpen={calendarOpen}
            setCalendarOpen={setCalendarOpen}
            handleDateSelect={handleDateSelect}
            isSaving={isSaving}
            handleSaveChanges={handleSaveChanges}
            showDetailedStats={showDetailedStats}
            setShowDetailedStats={setShowDetailedStats}
          />
          
          {front9.length > 0 && (
            <ScoreTable
              scores={front9}
              isEditing={isEditing && !isDemo}
              handleScoreChange={handleScoreChange}
              handleGIRChange={handleGIRChange}
              title="Front Nine"
              showDetailedStats={showDetailedStats}
            />
          )}
          
          {back9.length > 0 && (
            <ScoreTable
              scores={back9}
              isEditing={isEditing && !isDemo}
              handleScoreChange={handleScoreChange}
              handleGIRChange={handleGIRChange}
              title="Back Nine"
              startIndex={front9.length}
              showDetailedStats={showDetailedStats}
            />
          )}
          
          <ScoreTableSummary 
            scores={scores}
            handicapIndex={handicapIndex}
            showDetailedStats={showDetailedStats}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
