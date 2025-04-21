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
  const [holeSelection, setHoleSelection] = useState<"all" | "front9" | "back9">("all");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (round && isOpen) {
      console.log("Loading round data for scorecard:", round.id, "tee:", round.tee_name, "tee_id:", round.tee_id);
      
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
      setIsEditing(false);
      
      setSelectedTee(round.tee_name || '');
      console.log("Setting selected tee to round's tee_name:", round.tee_name);
      
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
    
    if (!isOpen) {
      setScores([]);
      setRoundDate(undefined);
      setIsEditing(false);
      setSelectedTee(undefined);
      setAvailableTees([]);
    }
  }, [round, isOpen]);

  if (!round) return null;

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
      let filteredScores = scores;
      let holesPlayed = 18;
      if (holeSelection === "front9") {
        filteredScores = scores.filter(score => score.hole >= 1 && score.hole <= 9 && (score.strokes ?? 0) > 0);
        holesPlayed = 9;
      } else if (holeSelection === "back9") {
        filteredScores = scores.filter(score => score.hole > 9 && score.hole <= 18 && (score.strokes ?? 0) > 0);
        holesPlayed = 9;
      } else {
        const nonBlank = scores.filter(score => (score.strokes ?? 0) > 0);
        if (nonBlank.length === 9) {
          filteredScores = nonBlank;
          holesPlayed = 9;
        }
      }

      if (filteredScores.length < 3) {
        throw new Error("Please enter at least 3 hole scores");
      }

      const totalStrokes = filteredScores.reduce((sum, score) => sum + (score.strokes || 0), 0);
      const totalPar = filteredScores.reduce((sum, score) => sum + score.par, 0);
      const toPar = totalStrokes - totalPar;
      
      let teeId = round.tee_id;
      if (selectedTee !== round.tee_name) {
        const selectedTeeObj = availableTees.find(tee => tee.name === selectedTee);
        if (selectedTeeObj) {
          teeId = selectedTeeObj.id;
        }
      }
      
      console.log("Saving round with tee:", selectedTee, "tee_id:", teeId);
      
      const { error } = await supabase
        .from('rounds')
        .update({
          date: roundDate?.toISOString() || round.date,
          gross_score: totalStrokes,
          to_par_gross: toPar,
          tee_name: selectedTee,
          tee_id: teeId,
          hole_scores: JSON.stringify(filteredScores),
          holes_played: holesPlayed
        })
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

  const handleHoleSelection = (type: "all" | "front9" | "back9") => {
    setHoleSelection(type);
  };

  const renderHolesSelector = () => {
    if (!isEditing) return null;
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Holes Played</label>
        <div className="flex space-x-1">
          <Button variant={holeSelection === "all" ? "default" : "outline"} size="sm" onClick={() => handleHoleSelection("all")} className="flex-1 h-9 px-2">All 18</Button>
          <Button variant={holeSelection === "front9" ? "default" : "outline"} size="sm" onClick={() => handleHoleSelection("front9")} className="flex-1 h-9 px-2">Front 9</Button>
          <Button variant={holeSelection === "back9" ? "default" : "outline"} size="sm" onClick={() => handleHoleSelection("back9")} className="flex-1 h-9 px-2">Back 9</Button>
        </div>
      </div>
    );
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

    const front9Total = front9.reduce((sum, score) => sum + (score.strokes || 0), 0);
    const front9Par = front9.reduce((sum, score) => sum + score.par, 0);
    const back9Total = back9.reduce((sum, score) => sum + (score.strokes || 0), 0);
    const back9Par = back9.reduce((sum, score) => sum + score.par, 0);

    return (
      <div className="mt-4 space-y-6">
        {front9.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Front 9</h4>
            <div className="border rounded-md overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-2 py-2 text-left text-sm font-medium">Hole</th>
                    {front9.map((score) => (
                      <th key={`hole-${score.hole}`} className="px-2 py-2 text-center text-sm font-medium">{score.hole}</th>
                    ))}
                    <th className="px-2 py-2 text-center text-sm font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-2 py-2 text-sm font-medium">Par</td>
                    {front9.map((score) => (
                      <td key={`par-${score.hole}`} className="px-1 py-2 text-center">
                        <div className="bg-muted/40 border border-muted rounded-md w-7 h-7 flex items-center justify-center font-medium mx-auto">
                          {score.par}
                        </div>
                      </td>
                    ))}
                    <td className="px-2 py-2 text-center font-medium">{front9Par}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-2 py-2 text-sm font-medium">Score</td>
                    {front9.map((score, index) => (
                      <td key={`score-${score.hole}`} className="px-1 py-2 text-center">
                        {isEditing ? (
                          <Input
                            type="number"
                            min="1"
                            max="20"
                            value={score.strokes || ''}
                            onChange={(e) => handleScoreChange(index, e.target.value)}
                            className="w-9 h-7 text-center mx-auto px-1"
                            inputMode="numeric"
                          />
                        ) : (
                          <div className="w-7 h-7 flex items-center justify-center mx-auto">
                            {score.strokes || '-'}
                          </div>
                        )}
                      </td>
                    ))}
                    <td className="px-2 py-2 text-center font-medium">{front9Total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {back9.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Back 9</h4>
            <div className="border rounded-md overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-2 py-2 text-left text-sm font-medium">Hole</th>
                    {back9.map((score) => (
                      <th key={`hole-${score.hole}`} className="px-2 py-2 text-center text-sm font-medium">{score.hole}</th>
                    ))}
                    <th className="px-2 py-2 text-center text-sm font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-2 py-2 text-sm font-medium">Par</td>
                    {back9.map((score) => (
                      <td key={`par-${score.hole}`} className="px-1 py-2 text-center">
                        <div className="bg-muted/40 border border-muted rounded-md w-7 h-7 flex items-center justify-center font-medium mx-auto">
                          {score.par}
                        </div>
                      </td>
                    ))}
                    <td className="px-2 py-2 text-center font-medium">{back9Par}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-2 py-2 text-sm font-medium">Score</td>
                    {back9.map((score, index) => {
                      const actualIndex = index + front9.length;
                      return (
                        <td key={`score-${score.hole}`} className="px-1 py-2 text-center">
                          {isEditing ? (
                            <Input
                              type="number"
                              min="1"
                              max="20"
                              value={score.strokes || ''}
                              onChange={(e) => handleScoreChange(actualIndex, e.target.value)}
                              className="w-9 h-7 text-center mx-auto px-1"
                              inputMode="numeric"
                            />
                          ) : (
                            <div className="w-7 h-7 flex items-center justify-center mx-auto">
                              {score.strokes || '-'}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-2 py-2 text-center font-medium">{back9Total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

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
            {renderHolesSelector()}
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
