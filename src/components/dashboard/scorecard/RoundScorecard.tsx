
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Flag, Calendar, X, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase";
import { updateUserHandicap } from "@/integrations/supabase";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { RoundScorecardProps, HoleScore } from "./types";
import { ScoreTable } from "./ScoreTable";
import { ScoreTableSummary } from "./ScoreTableSummary";
import { ScorecardHeader } from "./ScorecardHeader";
import { detectAchievements } from "@/components/add-round/utils/scoreUtils";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";

export const RoundScorecard = ({ round, isOpen, onOpenChange, handicapIndex = 0 }: RoundScorecardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [scores, setScores] = useState<HoleScore[]>([]);
  const [roundDate, setRoundDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showNet, setShowNet] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const scorecardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
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
  
  // Function to generate image from scorecard without UI controls
  const generateScorecardImage = async (): Promise<Blob | null> => {
    if (!scorecardRef.current) return null;
    
    try {
      setIsGeneratingImage(true);
      
      // Create a clone of the scorecard to modify for the image
      const scorecardClone = scorecardRef.current.cloneNode(true) as HTMLElement;
      
      // Remove UI controls from the clone (Edit button, Show Net Score button, etc.)
      const uiControls = scorecardClone.querySelectorAll('button');
      uiControls.forEach(button => {
        // Remove all buttons except those inside tables (which may be part of the scorecard data)
        if (!button.closest('table')) {
          button.remove();
        }
      });
      
      // Create a square canvas container for Instagram (1080x1080)
      const canvasContainer = document.createElement('div');
      canvasContainer.style.width = '1080px';
      canvasContainer.style.height = '1080px';
      canvasContainer.style.position = 'relative';
      canvasContainer.style.backgroundColor = '#ffffff';
      canvasContainer.style.display = 'flex';
      canvasContainer.style.flexDirection = 'column';
      canvasContainer.style.justifyContent = 'center';
      canvasContainer.style.alignItems = 'center';
      canvasContainer.style.overflow = 'hidden';
      
      // Style the scorecard for the Instagram format
      scorecardClone.style.width = '90%';
      scorecardClone.style.maxWidth = '980px';
      scorecardClone.style.borderRadius = '12px';
      scorecardClone.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
      scorecardClone.style.overflow = 'hidden';
      
      // Add the scorecard to the container
      canvasContainer.appendChild(scorecardClone);
      
      // Add a watermark
      const watermark = document.createElement('div');
      watermark.style.position = 'absolute';
      watermark.style.bottom = '20px';
      watermark.style.right = '20px';
      watermark.style.fontSize = '16px';
      watermark.style.color = '#666';
      watermark.style.fontWeight = 'bold';
      watermark.innerText = 'MyBirdieBoard.com';
      canvasContainer.appendChild(watermark);
      
      // Add to body temporarily (needed for html2canvas to work properly)
      canvasContainer.style.position = 'absolute';
      canvasContainer.style.left = '-9999px';
      document.body.appendChild(canvasContainer);
      
      // Generate image
      const canvas = await html2canvas(canvasContainer, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher resolution
        logging: false,
        allowTaint: true,
        useCORS: true,
        width: 1080,
        height: 1080
      });
      
      // Remove container from body
      document.body.removeChild(canvasContainer);
      
      // Convert canvas to blob
      return new Promise(resolve => {
        canvas.toBlob(blob => {
          resolve(blob);
        }, 'image/png', 0.95);
      });
    } catch (error) {
      console.error('Error generating scorecard image:', error);
      return null;
    } finally {
      setIsGeneratingImage(false);
    }
  };
  
  // Function to download scorecard as image
  const handleDownloadScorecard = async () => {
    try {
      setIsGeneratingImage(true);
      
      // Calculate total score and to par for filename
      const totalScore = scores.reduce((sum, score) => sum + (score.strokes || 0), 0);
      const totalPar = scores.reduce((sum, score) => sum + score.par, 0);
      const toPar = totalScore - totalPar;
      const toParStr = toPar > 0 ? `plus${toPar}` : toPar < 0 ? `minus${Math.abs(toPar)}` : 'even';
      
      // Generate a clean filename
      const courseName = (round.courses?.courseName || 'golf').replace(/\s+/g, '-').toLowerCase();
      const scoreDate = roundDate ? roundDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const fileName = `${courseName}-${scoreDate}-${totalScore}-${toParStr}.png`;
      
      const scorecardBlob = await generateScorecardImage();
      
      if (!scorecardBlob) {
        throw new Error('Failed to generate scorecard image');
      }
      
      // Create download link
      const url = URL.createObjectURL(scorecardBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Scorecard downloaded",
        description: "Your scorecard image has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error downloading scorecard:", error);
      toast({
        title: "Error downloading",
        description: "There was an error creating your scorecard image.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
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
        
        {/* Download button - only if not editing */}
        {!isEditing && (
          <div className="flex justify-center mt-4">
            <Button
              onClick={handleDownloadScorecard}
              disabled={isGeneratingImage}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {isGeneratingImage ? 'Generating...' : (
                <>
                  <Download className="h-4 w-4" />
                  Download Scorecard
                </>
              )}
            </Button>
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

        <div className="overflow-y-auto p-6" ref={contentRef}>
          <Card className="border-secondary/30 shadow-md">
            <CardContent className="pt-6" ref={scorecardRef}>
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
