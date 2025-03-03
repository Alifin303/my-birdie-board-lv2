
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { RoundScorecardProps, HoleScore } from "./types";
import { ScoreTable } from "./ScoreTable";
import { ScoreTableSummary } from "./ScoreTableSummary";
import { ScorecardHeader } from "./ScorecardHeader";
import { getCourseMetadataFromLocalStorage } from "@/integrations/supabase/course/course-queries";

export const RoundScorecard = ({ round, isOpen, onOpenChange }: RoundScorecardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [scores, setScores] = useState<HoleScore[]>([]);
  const [roundDate, setRoundDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTee, setSelectedTee] = useState<string>("");
  const [selectedTeeId, setSelectedTeeId] = useState<string>("");
  const [availableTees, setAvailableTees] = useState<Array<{id: string, name: string}>>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize editable state when round data changes or dialog opens
  useEffect(() => {
    if (round && isOpen) {
      console.log("Loading round data in RoundScorecard:", round);
      console.log("Round tee_name:", round.tee_name, "tee_id:", round.tee_id);
      
      // Parse hole scores from JSON
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
      
      // Set the selected tee based on the round data
      setSelectedTee(round.tee_name || "");
      setSelectedTeeId(round.tee_id || "");
      
      // Load available tees for this course from localStorage
      loadAvailableTees(round.course_id);
    }
  }, [round, isOpen]);

  const loadAvailableTees = (courseId: number) => {
    if (!courseId) return;
    
    console.log("Loading available tees for course:", courseId);
    
    try {
      const courseMetadata = getCourseMetadataFromLocalStorage(courseId);
      
      if (courseMetadata && courseMetadata.tees && courseMetadata.tees.length > 0) {
        const teesData = courseMetadata.tees.map((tee: any) => ({
          id: tee.id,
          name: tee.name
        }));
        
        console.log("Loaded available tees from localStorage:", teesData);
        setAvailableTees(teesData);
        
        // If we have tee_id from the round but no selected tee, find it in the tees data
        if (round.tee_id && !selectedTee) {
          const matchingTee = courseMetadata.tees.find((t: any) => t.id === round.tee_id);
          if (matchingTee) {
            console.log("Found matching tee for tee_id:", matchingTee);
            setSelectedTee(matchingTee.name);
          }
        }
      } else {
        // Create a default tee if none found
        console.log("No tees found in localStorage, using default");
        setAvailableTees([{ id: round.tee_id || "default", name: round.tee_name || "Default" }]);
      }
    } catch (error) {
      console.error("Error loading tees from localStorage:", error);
      setAvailableTees([{ id: round.tee_id || "default", name: round.tee_name || "Default" }]);
    }
  };

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

  const handleTeeChange = (teeName: string) => {
    console.log("Tee changed to:", teeName);
    setSelectedTee(teeName);
    
    // Find the corresponding tee_id for the selected tee name
    const selectedTeeObject = availableTees.find(tee => tee.name === teeName);
    if (selectedTeeObject) {
      console.log("Found tee_id for selected tee:", selectedTeeObject.id);
      setSelectedTeeId(selectedTeeObject.id);
    } else {
      console.error("Could not find tee_id for tee name:", teeName);
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
      // Calculate new totals
      const totalStrokes = scores.reduce((sum, score) => sum + (score.strokes || 0), 0);
      const totalPar = scores.reduce((sum, score) => sum + score.par, 0);
      const toPar = totalStrokes - totalPar;
      
      console.log("Saving round with tee:", selectedTee, "tee_id:", selectedTeeId);
      
      // Update the round in the database
      const { error } = await supabase
        .from('rounds')
        .update({
          date: roundDate?.toISOString() || round.date,
          gross_score: totalStrokes,
          to_par_gross: toPar,
          hole_scores: JSON.stringify(scores),
          tee_name: selectedTee,
          tee_id: selectedTeeId
        })
        .eq('id', round.id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Round updated successfully!",
      });
      
      // Invalidate the rounds query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['userRounds'] });
      
      // Exit edit mode
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

  // Handle display of hole scores
  const renderHoleScores = () => {
    if (!scores || scores.length === 0) {
      return (
        <div className="mt-4 text-center p-4 bg-muted/20 rounded-md">
          <p className="text-muted-foreground">No hole-by-hole data available for this round.</p>
        </div>
      );
    }

    // Split holes into front 9 and back 9
    const front9 = scores.filter(score => score.hole <= 9);
    const back9 = scores.filter(score => score.hole > 9);

    return (
      <div className="mt-4 space-y-6">
        {/* Front 9 */}
        {front9.length > 0 && (
          <ScoreTable 
            scores={front9} 
            isEditing={isEditing} 
            handleScoreChange={handleScoreChange}
            title="Front 9"
          />
        )}

        {/* Back 9 */}
        {back9.length > 0 && (
          <ScoreTable 
            scores={back9} 
            isEditing={isEditing} 
            handleScoreChange={handleScoreChange}
            title="Back 9"
            startIndex={front9.length}
          />
        )}

        {/* Total */}
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
              <>Details for your round at {round.courses?.clubName} - {round.courses?.courseName} ({round.tee_name})</>
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
              selectedTee={selectedTee}
              availableTees={availableTees}
              handleTeeChange={handleTeeChange}
            />

            <Separator className="my-4" />
            
            {renderHoleScores()}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
