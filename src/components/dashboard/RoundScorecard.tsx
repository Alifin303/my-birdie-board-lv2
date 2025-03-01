
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Edit, Save } from "lucide-react";

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
      const newGrossScore = editedHoleScores.reduce((sum, score) => sum + score, 0);
      
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

  // Handle hole scores display
  const renderHoleScores = () => {
    if (!round.hole_scores && !isEditing) {
      return (
        <div className="mt-4 text-center p-4 bg-muted/20 rounded-md">
          <p className="text-muted-foreground">No hole-by-hole data available for this round.</p>
        </div>
      );
    }

    // Parse hole scores from JSON
    let holeScores = [];
    
    if (!isEditing) {
      try {
        holeScores = typeof round.hole_scores === 'string' 
          ? JSON.parse(round.hole_scores) 
          : round.hole_scores;
      } catch (error) {
        console.error("Error parsing hole scores:", error);
        return (
          <div className="mt-4 text-center p-4 bg-muted/20 rounded-md">
            <p className="text-muted-foreground">Error displaying hole scores.</p>
          </div>
        );
      }

      if (!Array.isArray(holeScores) || holeScores.length === 0) {
        return (
          <div className="mt-4 text-center p-4 bg-muted/20 rounded-md">
            <p className="text-muted-foreground">No hole-by-hole data available for this round.</p>
          </div>
        );
      }
    } else {
      holeScores = editedHoleScores;
    }

    // Split holes into front 9 and back 9
    const front9 = holeScores.slice(0, 9);
    const back9 = holeScores.slice(9, 18);

    return (
      <div className="mt-4 space-y-6">
        {/* Front 9 */}
        <div>
          <h4 className="font-medium mb-2">Front 9</h4>
          <div className="grid grid-cols-10 gap-2 text-center text-sm">
            <div className="font-medium">Hole</div>
            {Array.from({ length: 9 }, (_, i) => (
              <div key={`hole-${i + 1}`}>{i + 1}</div>
            ))}
          </div>
          <div className="grid grid-cols-10 gap-2 text-center text-sm mt-1">
            <div className="font-medium">Score</div>
            {Array.from({ length: 9 }, (_, i) => (
              <div key={`score-${i + 1}`}>
                {isEditing ? (
                  <Input 
                    type="number" 
                    value={editedHoleScores[i] || ''}
                    onChange={(e) => handleScoreChange(i, e.target.value)}
                    min="1"
                    max="20"
                    className="h-8 w-full text-center p-1"
                  />
                ) : (
                  front9[i] || '-'
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Back 9 */}
        <div>
          <h4 className="font-medium mb-2">Back 9</h4>
          <div className="grid grid-cols-10 gap-2 text-center text-sm">
            <div className="font-medium">Hole</div>
            {Array.from({ length: 9 }, (_, i) => (
              <div key={`hole-${i + 10}`}>{i + 10}</div>
            ))}
          </div>
          <div className="grid grid-cols-10 gap-2 text-center text-sm mt-1">
            <div className="font-medium">Score</div>
            {Array.from({ length: 9 }, (_, i) => (
              <div key={`score-${i + 10}`}>
                {isEditing ? (
                  <Input 
                    type="number" 
                    value={editedHoleScores[i + 9] || ''}
                    onChange={(e) => handleScoreChange(i + 9, e.target.value)}
                    min="1"
                    max="20"
                    className="h-8 w-full text-center p-1"
                  />
                ) : (
                  back9[i] || '-'
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="pt-2 border-t">
          <div className="flex justify-between">
            <span className="font-medium">Total Score:</span>
            <span>
              {isEditing 
                ? editedHoleScores.reduce((sum, score) => sum + (score || 0), 0) 
                : round.gross_score
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">To Par:</span>
            <span>
              {isEditing 
                ? (() => {
                    const totalScore = editedHoleScores.reduce((sum, score) => sum + (score || 0), 0);
                    const toPar = totalScore - 72; // Assuming par 72
                    return toPar > 0 ? `+${toPar}` : toPar;
                  })() 
                : `${round.to_par_gross > 0 ? '+' : ''}${round.to_par_gross}`
              }
            </span>
          </div>
          {round.net_score !== undefined && (
            <div className="flex justify-between">
              <span className="font-medium">Net Score:</span>
              <span>{round.net_score}</span>
            </div>
          )}
          {round.to_par_net !== undefined && (
            <div className="flex justify-between">
              <span className="font-medium">Net To Par:</span>
              <span>{round.to_par_net > 0 ? '+' : ''}{round.to_par_net}</span>
            </div>
          )}
        </div>

        {/* Edit/Save buttons */}
        <div className="flex justify-end gap-2 pt-3">
          {isEditing ? (
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={handleEdit}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit Scorecard
            </Button>
          )}
        </div>
      </div>
    );
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Course Information</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {round.courses?.clubName} - {round.courses?.courseName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {round.courses?.city}{round.courses?.state ? `, ${round.courses?.state}` : ''}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Round Details</h3>
                <p className="text-sm text-muted-foreground mt-1">Date: {formattedDate}</p>
                <p className="text-sm text-muted-foreground">Tees: {round.tee_name || 'Not specified'}</p>
              </div>
            </div>

            <Separator className="my-4" />
            
            {renderHoleScores()}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
