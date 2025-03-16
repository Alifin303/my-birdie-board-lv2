
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Edit, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScorecardHeader } from "./scorecard/ScorecardHeader";
import { ScoreTable } from "./scorecard/ScoreTable";

interface RoundScorecardProps {
  round: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RoundScorecard = ({ round, isOpen, onOpenChange }: RoundScorecardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [scores, setScores] = useState<any[]>([]);
  const [roundDate, setRoundDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTee, setSelectedTee] = useState<string | undefined>(undefined);
  const [availableTees, setAvailableTees] = useState<Array<{id: string, name: string}>>([]);
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Reset state when round changes or dialog opens/closes
  useEffect(() => {
    if (round && isOpen) {
      console.log("Loading round data for scorecard:", round.id, "tee:", round.tee_name, "tee_id:", round.tee_id);
      
      // Parse hole scores from JSON
      let parsedScores = [];
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
      setIsEditing(false); // Reset edit mode when opening a new round
      
      // Always use the exact tee_name from the round data
      setSelectedTee(round.tee_name || '');
      console.log("Setting selected tee to round's tee_name:", round.tee_name);
      
      // Get available tees for this course from localStorage
      try {
        const courseDetailsKey = `course_details_${round.course_id}`;
        const storedDetails = localStorage.getItem(courseDetailsKey);
        
        if (storedDetails) {
          const courseDetails = JSON.parse(storedDetails);
          
          if (courseDetails.tees && courseDetails.tees.length > 0) {
            const availableTeesList = courseDetails.tees.map((tee: any) => ({
              id: tee.id,
              name: tee.name
            }));
            setAvailableTees(availableTeesList);
            console.log("Loaded available tees from localStorage:", availableTeesList);
          }
        }
      } catch (error) {
        console.error("Error loading tees from localStorage:", error);
        // If we can't get tees from localStorage, just use the current tee
        setAvailableTees([{ id: round.tee_id || 'default', name: round.tee_name || 'Default' }]);
      }
      
      console.log("Loaded scorecard data:", {
        roundId: round.id,
        tee: round.tee_name,
        teeId: round.tee_id,
        date: roundDate ? format(roundDate, 'PP') : 'unknown',
        scoresCount: parsedScores.length
      });
    }
    
    // Clear state when dialog closes
    if (!isOpen) {
      setScores([]);
      setRoundDate(undefined);
      setIsEditing(false);
      setSelectedTee(undefined);
      setAvailableTees([]);
      setShowDetailedStats(false);
    }
  }, [round, isOpen]);

  if (!round) return null;

  // Format date for display
  const formattedDate = roundDate 
    ? format(roundDate, 'MMMM d, yyyy')
    : format(new Date(round.date), 'MMMM d, yyyy');

  const handleDateSelect = (date: Date | undefined) => {
    setRoundDate(date);
    setCalendarOpen(false);
  };

  const handleTeeChange = (teeName: string) => {
    setSelectedTee(teeName);
    console.log("Selected tee changed to:", teeName);
  };

  const handleScoreChange = (index: number, field: 'strokes' | 'putts' | 'penalties', value: string) => {
    const newScores = [...scores];
    const parsedValue = value === '' ? undefined : parseInt(value, 10);
    
    if (!isNaN(parsedValue as number) || value === '') {
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
      gir: value
    };
    setScores(newScores);
  };

  const handleFairwayChange = (index: number, hit: boolean, direction?: 'left' | 'right' | 'long' | 'short') => {
    const newScores = [...scores];
    newScores[index] = {
      ...newScores[index],
      fairwayHit: hit,
      fairwayMissDirection: hit ? undefined : direction
    };
    setScores(newScores);
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
      
      // Get the tee ID that matches the selected tee name
      let teeId = round.tee_id;
      if (selectedTee !== round.tee_name) {
        const selectedTeeObj = availableTees.find(tee => tee.name === selectedTee);
        if (selectedTeeObj) {
          teeId = selectedTeeObj.id;
        }
      }
      
      console.log("Saving round with tee:", selectedTee, "tee_id:", teeId);
      
      // Update the round in the database
      const { error } = await supabase
        .from('rounds')
        .update({
          date: roundDate?.toISOString() || round.date,
          gross_score: totalStrokes,
          to_par_gross: toPar,
          tee_name: selectedTee,
          tee_id: teeId,
          hole_scores: JSON.stringify(scores)
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

  // Handle hole scores display
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
            handleGIRChange={handleGIRChange}
            handleFairwayChange={handleFairwayChange}
            title="Front 9"
            startIndex={0}
            showDetailedStats={showDetailedStats}
          />
        )}

        {/* Back 9 */}
        {back9.length > 0 && (
          <ScoreTable
            scores={back9}
            isEditing={isEditing}
            handleScoreChange={handleScoreChange}
            handleGIRChange={handleGIRChange}
            handleFairwayChange={handleFairwayChange}
            title="Back 9"
            startIndex={front9.length}
            showDetailedStats={showDetailedStats}
          />
        )}

        {/* Total */}
        <div className="pt-2 border-t">
          <div className="flex justify-between">
            <span className="font-medium">Total Score:</span>
            <span>{scores.reduce((sum, score) => sum + (score.strokes || 0), 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Total Par:</span>
            <span>{scores.reduce((sum, score) => sum + score.par, 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">To Par:</span>
            <span>
              {(() => {
                const totalScore = scores.reduce((sum, score) => sum + (score.strokes || 0), 0);
                const totalPar = scores.reduce((sum, score) => sum + score.par, 0);
                const toPar = totalScore - totalPar;
                return toPar > 0 ? `+${toPar}` : toPar;
              })()}
            </span>
          </div>
        </div>
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
              <>Details for your round at {round.courses?.clubName} - {round.courses?.courseName} on {formattedDate}</>
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
              showDetailedStats={showDetailedStats}
              setShowDetailedStats={setShowDetailedStats}
            />

            <Separator className="my-4" />
            
            {renderHoleScores()}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
