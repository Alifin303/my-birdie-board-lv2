
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Flag, Calendar, X, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase";
import { updateUserHandicap } from "@/integrations/supabase";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { RoundScorecardProps, HoleScore } from "./types";
import { ScoreTable } from "./ScoreTable";
import { ScoreTableSummary } from "./ScoreTableSummary";
import { ScorecardHeader } from "./ScorecardHeader";
import { detectAchievements, createShareData } from "@/components/add-round/utils/scoreUtils";

export const RoundScorecard = ({ round, isOpen, onOpenChange, handicapIndex = 0 }: RoundScorecardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [scores, setScores] = useState<HoleScore[]>([]);
  const [roundDate, setRoundDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showNet, setShowNet] = useState(false);
  const [shareSupported, setShareSupported] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check if Web Share API is supported
    setShareSupported(!!navigator.share);
    
    if (round && isOpen) {
      console.log("============ ROUND SCORECARD OPENED ============");
      console.log("Round ID:", round.id);
      console.log("ULTIMATE TEE NAME DEBUG:", {
        teeName: round.tee_name,
        teeNameType: typeof round.tee_name,
        teeNameStringified: JSON.stringify(round.tee_name),
        teeId: round.tee_id
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
      
      console.log("Saving round with tee data:", {
        teeName: round.tee_name,
        teeId: round.tee_id
      });
      
      // Calculate a proper net score based on current handicap
      const netScore = Math.round(totalStrokes - handicapIndex);
      const toParNet = netScore - totalPar;
      
      console.log("Calculated scores for update:", {
        grossScore: totalStrokes,
        netScore: netScore,
        toPar: toPar,
        toParNet: toParNet,
        handicapUsed: handicapIndex
      });
      
      const { error } = await supabase
        .from('rounds')
        .update({
          date: roundDate?.toISOString() || round.date,
          gross_score: totalStrokes,
          to_par_gross: toPar,
          net_score: netScore,
          to_par_net: toParNet,
          hole_scores: JSON.stringify(scores),
          tee_name: round.tee_name,
          tee_id: round.tee_id
        })
        .eq('id', round.id);
        
      if (error) {
        throw error;
      }
      
      // Get current user ID to update handicap
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Fetch all user rounds to recalculate handicap
        const { data: userRounds, error: userRoundsError } = await supabase
          .from('rounds')
          .select('gross_score')
          .eq('user_id', session.user.id)
          .order('date', { ascending: false });
          
        if (userRoundsError) {
          console.error("Error fetching user rounds for handicap update:", userRoundsError);
        } else if (userRounds && userRounds.length > 0) {
          // Extract gross scores for handicap calculation
          const grossScores = userRounds.map(r => r.gross_score);
          console.log("Updating handicap based on rounds:", grossScores);
          
          // Update the user's handicap
          const newHandicap = await updateUserHandicap(session.user.id, grossScores);
          console.log("Updated handicap to:", newHandicap);
          
          // Show handicap update in toast
          toast({
            title: "Handicap Updated",
            description: `Your handicap index is now ${newHandicap}`,
          });
        }
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

  const toggleNetScores = () => {
    setShowNet(prev => !prev);
    console.log(`[RoundScorecard] Toggling net scores: ${!showNet} with handicap: ${handicapIndex}`);
  };
  
  // New function to handle social sharing
  const handleShareRound = async () => {
    if (!navigator.share) {
      toast({
        title: "Sharing not supported",
        description: "Your browser doesn't support the Web Share API.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Calculate total score and to par
      const totalScore = scores.reduce((sum, score) => sum + (score.strokes || 0), 0);
      const totalPar = scores.reduce((sum, score) => sum + score.par, 0);
      const toPar = totalScore - totalPar;
      
      // Get course and tee name
      const courseName = round.courses 
        ? `${round.courses.clubName} - ${round.courses.courseName}` 
        : "Unknown Course";
      const teeName = round.tee_name || "Standard";
      
      // Detect achievements
      const achievements = detectAchievements(scores);
      
      // Create share data
      const shareData = createShareData(
        courseName,
        teeName,
        toPar,
        totalScore,
        achievements
      );
      
      // Use Web Share API
      await navigator.share({
        ...shareData,
        url: "https://mybirdieboard.com"
      });
      
      toast({
        title: "Shared successfully",
        description: "Your round was shared successfully!",
      });
    } catch (error) {
      console.error("Error sharing:", error);
      
      // User cancelled sharing
      if ((error as Error).name === 'AbortError') {
        return;
      }
      
      toast({
        title: "Error sharing",
        description: "There was an error sharing your round.",
        variant: "destructive",
      });
    }
  };

  const renderHoleScores = () => {
    if (!scores || scores.length === 0) {
      return (
        <div className="mt-4 text-center p-4 bg-secondary/20 rounded-md">
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

        <ScoreTableSummary 
          scores={scores} 
          handicapIndex={handicapIndex} 
          showNet={showNet} 
        />
        
        {/* Add Share Button - only if not editing and web share API is supported */}
        {!isEditing && shareSupported && (
          <div className="flex justify-center mt-4">
            <button
              onClick={handleShareRound}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Share This Round
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-background round-scorecard-content overflow-y-auto sm:max-h-[90vh] p-0">
        <DialogHeader className="golf-header rounded-t-lg p-6 sticky top-0 z-10">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Flag className="h-5 w-5" /> Round Scorecard
          </DialogTitle>
          <DialogDescription className="text-white/90">
            {isEditing ? (
              "Edit your round details"
            ) : (
              <>Details for your round at {round.courses?.clubName} - {round.courses?.courseName} ({round.tee_name || "Standard"})</>
            )}
          </DialogDescription>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-80 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-5 w-5 text-white" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <div className="overflow-y-auto p-6">
          <Card className="border-secondary/30 shadow-md">
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

              {handicapIndex > 0 && !isEditing && (
                <div className="mt-4 mb-2 flex justify-end">
                  <button 
                    onClick={toggleNetScores}
                    className={`px-3 py-1 text-sm rounded-full flex items-center gap-1.5 transition-colors ${showNet ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    {showNet ? 'Show Gross Score' : 'Show Net Score'}
                  </button>
                </div>
              )}

              <Separator className="my-4" />
              
              {renderHoleScores()}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
