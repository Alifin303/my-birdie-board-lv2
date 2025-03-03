
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { RoundScorecardProps, HoleScore } from "./types";
import { ScoreTable } from "./ScoreTable";
import { ScoreTableSummary } from "./ScoreTableSummary";
import { ScorecardHeader } from "./ScorecardHeader";

export const RoundScorecard = ({ round, isOpen, onOpenChange }: RoundScorecardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [scores, setScores] = useState<HoleScore[]>([]);
  const [roundDate, setRoundDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize editable state when round data changes or dialog opens
  useEffect(() => {
    if (round && isOpen) {
      console.log("Loading round data in RoundScorecard:", round);
      console.log("Round tee data:", {
        tee_name: round.tee_name,
        tee_id: round.tee_id
      });
      
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
    }
  }, [round, isOpen]);

  if (!round) return null;

  const handleDateSelect = (date: Date | undefined) => {
    setRoundDate(date);
    setCalendarOpen(false);
  };

  const handleScoreChange = (index: number, value: string) => {
    const newScores = [...scores];
    const parsedValue = value === '' ? 0 : parseInt(value, 10);
    
    if (!isNaN(parsedValue)) {
      newScores[index] = {
        ...newScores[index],
        strokes: parsedValue,
      };
      setScores(newScores);
    }
  };

  const handleSaveChanges = async () => {
    if (!round.id) {
      toast({
        title: "Error",
        description: "Could not save changes: Missing round ID.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const totalStrokes = scores.reduce((sum, score) => sum + (score.strokes || 0), 0);
      const totalPar = scores.reduce((sum, score) => sum + score.par, 0);
      const toPar = totalStrokes - totalPar;
      
      // Make sure we preserve the original tee_name and tee_id
      const updateData = {
        date: roundDate?.toISOString() || round.date,
        gross_score: totalStrokes,
        to_par_gross: toPar,
        hole_scores: JSON.stringify(scores),
        // Explicitly include tee data to preserve it
        tee_name: round.tee_name,
        tee_id: round.tee_id
      };
      
      console.log("Updating round with tee data:", {
        tee_name: updateData.tee_name,
        tee_id: updateData.tee_id
      });
      
      const { error } = await supabase
        .from('rounds')
        .update(updateData)
        .eq('id', round.id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Round updated successfully!",
      });
      
      queryClient.invalidateQueries({ queryKey: ['userRounds'] });
      
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating round:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update round. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderHoleScores = () => {
    if (!scores || scores.length === 0) {
      return (
        <div className="mt-4 text-center p-4 bg-muted/20 rounded-md">
          <p className="text-muted-foreground">No hole-by-hole data available for this round.</p>
        </div>
      );
    }

    const front9 = scores.filter(score => score.hole <= 9);
    const back9 = scores.filter(score => score.hole > 9);

    return (
      <div className="mt-4 space-y-6">
        {front9.length > 0 && (
          <ScoreTable 
            scores={front9} 
            isEditing={isEditing} 
            handleScoreChange={handleScoreChange}
            title="Front 9"
          />
        )}

        {back9.length > 0 && (
          <ScoreTable 
            scores={back9} 
            isEditing={isEditing} 
            handleScoreChange={handleScoreChange}
            title="Back 9"
            startIndex={front9.length}
          />
        )}

        <ScoreTableSummary scores={scores} />
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Round Scorecard</DialogTitle>
          <DialogDescription>
            {isEditing ? (
              "Edit your round details"
            ) : (
              <>Details for your round at {round.courses?.clubName} - {round.courses?.courseName} ({round.tee_name || "Standard"})</>
            )}
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardContent className="pt-6">
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
            />

            <Separator className="my-4" />
            
            {renderHoleScores()}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
