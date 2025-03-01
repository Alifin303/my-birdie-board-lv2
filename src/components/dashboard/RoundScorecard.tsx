
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CourseInfo } from "./scorecard/CourseInfo";
import { HoleScoreSection } from "./scorecard/HoleScoreSection";

interface RoundScorecardProps {
  round: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RoundScorecard = ({ round, isOpen, onOpenChange }: RoundScorecardProps) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedHoleScores, setEditedHoleScores] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  if (!round) return null;

  // Format date for display
  const formattedDate = format(new Date(round.date), 'MMMM d, yyyy');

  // Initialize editing mode
  const handleEdit = () => {
    let initialScores: number[] = [];
    
    try {
      if (round.hole_scores) {
        initialScores = typeof round.hole_scores === 'string' 
          ? JSON.parse(round.hole_scores) 
          : [...round.hole_scores];
      }
    } catch (error) {
      console.error("Error parsing hole scores:", error);
      initialScores = [];
    }
    
    setEditedHoleScores(initialScores);
    setIsEditing(true);
  };

  // Handle score change for a specific hole
  const handleScoreChange = (index: number, value: string) => {
    const newScores = [...editedHoleScores];
    newScores[index] = Number(value) || 0;
    setEditedHoleScores(newScores);
  };

  // Save edited scores
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Calculate new total score
      const newGrossScore = editedHoleScores.reduce((sum, score) => sum + (score || 0), 0);
      
      // Calculate to par (simplified - assuming par is 72)
      // In a real app, you would get the actual course par from the database
      const coursePar = 72; // Default assumption
      const newToPar = newGrossScore - coursePar;
      
      const { error } = await supabase
        .from('rounds')
        .update({
          gross_score: newGrossScore,
          to_par_gross: newToPar,
          hole_scores: editedHoleScores
        })
        .eq('id', round.id);
        
      if (error) {
        console.error("Error updating round:", error);
        toast({
          title: "Error",
          description: "Failed to update scorecard. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Refresh rounds data
      queryClient.invalidateQueries({ queryKey: ['userRounds'] });
      
      toast({
        title: "Success",
        description: "Scorecard updated successfully",
      });
      
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving scorecard:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setIsEditing(false);  // Reset editing mode when closing
      }
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Round Scorecard</DialogTitle>
          <DialogDescription>
            Details for your round at {round.courses?.clubName} - {round.courses?.courseName} on {formattedDate}
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardContent className="pt-6">
            <CourseInfo 
              courseData={round.courses || {}}
              roundDate={formattedDate}
              teeName={round.tee_name}
            />

            <Separator className="my-4" />
            
            <HoleScoreSection
              round={round}
              isEditing={isEditing}
              isSaving={isSaving}
              editedHoleScores={editedHoleScores}
              onScoreChange={handleScoreChange}
              onEdit={handleEdit}
              onSave={handleSave}
            />
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
