
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
  const [showDetailedStats, setShowDetailedStats] = useState(false);
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

  const roundHandicap = round.handicap_at_posting !== undefined && round.handicap_at_posting !== null
    ? round.handicap_at_posting
    : handicapIndex;

  console.log("Using round-specific handicap:", {
    roundId: round.id,
    handicapAtPosting: round.handicap_at_posting,
    currentHandicap: handicapIndex,
    usingHandicap: roundHandicap
  });

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
      
      const handicapToUse = round.handicap_at_posting !== undefined && round.handicap_at_posting !== null
        ? round.handicap_at_posting
        : roundHandicap;
      
      console.log("Using handicap for net score calculation:", handicapToUse);
      
      const netScore = Math.round(totalStrokes - handicapToUse);
      const toParNet = netScore - totalPar;
      
      console.log("Calculated scores for update:", {
        grossScore: totalStrokes,
        netScore: netScore,
        toPar: toPar,
        toParNet: toParNet,
        handicapUsed: handicapToUse
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
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: userRounds, error: userRoundsError } = await supabase
          .from('rounds')
          .select('gross_score')
          .eq('user_id', session.user.id)
          .order('date', { ascending: false });
          
        if (userRoundsError) {
          console.error("Error fetching user rounds for handicap update:", userRoundsError);
        } else if (userRounds && userRounds.length > 0) {
          const grossScores = userRounds.map(r => r.gross_score);
          console.log("Updating handicap based on rounds:", grossScores);
          
          const newHandicap = await updateUserHandicap(session.user.id, grossScores);
          console.log("Updated handicap to:", newHandicap);
          
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
  };
  
  const generateScorecardImage = async (): Promise<Blob | null> => {
    if (!scorecardRef.current) return null;
    
    try {
      setIsGeneratingImage(true);
      
      const scorecardClone = scorecardRef.current.cloneNode(true) as HTMLElement;
      
      // Remove UI controls from the clone
      const uiControls = scorecardClone.querySelectorAll('button');
      uiControls.forEach(button => {
        if (!button.closest('table')) {
          (button as HTMLElement).remove();
        }
      });
      
      // Create container for the image
      const canvasContainer = document.createElement('div');
      (canvasContainer as HTMLElement).style.width = '1080px';
      (canvasContainer as HTMLElement).style.height = '1400px';
      (canvasContainer as HTMLElement).style.position = 'fixed';
      (canvasContainer as HTMLElement).style.backgroundColor = '#ffffff';
      (canvasContainer as HTMLElement).style.display = 'flex';
      (canvasContainer as HTMLElement).style.flexDirection = 'column';
      (canvasContainer as HTMLElement).style.justifyContent = 'flex-start';
      (canvasContainer as HTMLElement).style.alignItems = 'center';
      (canvasContainer as HTMLElement).style.overflow = 'hidden';
      (canvasContainer as HTMLElement).style.padding = '20px';
      (canvasContainer as HTMLElement).style.fontFamily = 'Arial, sans-serif';
      
      // Add logo
      const logoContainer = document.createElement('div');
      (logoContainer as HTMLElement).style.position = 'absolute';
      (logoContainer as HTMLElement).style.top = '20px';
      (logoContainer as HTMLElement).style.left = '20px';
      (logoContainer as HTMLElement).style.width = '180px';
      (logoContainer as HTMLElement).style.height = 'auto';
      (logoContainer as HTMLElement).style.zIndex = '10';
      
      const logoImg = document.createElement('img');
      logoImg.src = '/logo.png';
      (logoImg as HTMLElement).style.width = '100%';
      (logoImg as HTMLElement).style.height = 'auto';
      (logoImg as HTMLElement).style.objectFit = 'contain';
      
      await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = () => {
          console.error('Failed to load logo');
          resolve(null);
        };
        
        setTimeout(resolve, 1000);
      });
      
      logoContainer.appendChild(logoImg);
      canvasContainer.appendChild(logoContainer);
      
      // Style the scorecard for the download
      (scorecardClone as HTMLElement).style.width = '90%';
      (scorecardClone as HTMLElement).style.maxWidth = '980px';
      (scorecardClone as HTMLElement).style.borderRadius = '12px';
      (scorecardClone as HTMLElement).style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
      (scorecardClone as HTMLElement).style.overflow = 'hidden';
      (scorecardClone as HTMLElement).style.marginTop = '80px';
      (scorecardClone as HTMLElement).style.padding = '20px';
      (scorecardClone as HTMLElement).style.paddingBottom = '120px';
      
      // Force desktop layout for the downloaded image
      const mobileLayouts = scorecardClone.querySelectorAll('.sm\\:hidden, .md\\:hidden');
      mobileLayouts.forEach(element => {
        (element as HTMLElement).style.display = 'none';
      });
      
      const desktopLayouts = scorecardClone.querySelectorAll('.hidden.sm\\:grid, .hidden.sm\\:block, .hidden.md\\:grid, .hidden.md\\:block');
      desktopLayouts.forEach(element => {
        (element as HTMLElement).style.display = 'grid';
        if ((element as HTMLElement).classList.contains('sm:block') || (element as HTMLElement).classList.contains('md:block')) {
          (element as HTMLElement).style.display = 'block';
        }
      });
      
      // Style elements for a consistent look
      const headings = scorecardClone.querySelectorAll('h3');
      headings.forEach(heading => {
        (heading as HTMLElement).style.fontSize = '32px';
        (heading as HTMLElement).style.fontWeight = '700';
        (heading as HTMLElement).style.marginBottom = '15px';
      });
      
      const courseInfo = scorecardClone.querySelectorAll('p');
      courseInfo.forEach(p => {
        (p as HTMLElement).style.fontSize = '24px';
        (p as HTMLElement).style.marginBottom = '10px';
        (p as HTMLElement).style.lineHeight = '1.4';
      });
      
      const tables = scorecardClone.querySelectorAll('table');
      tables.forEach(table => {
        (table as HTMLElement).style.fontSize = '22px';
        (table as HTMLElement).style.width = '100%';
        (table as HTMLElement).style.borderCollapse = 'separate';
        (table as HTMLElement).style.borderSpacing = '2px';
        (table as HTMLElement).style.marginBottom = '20px';
      });
      
      const tableHeaders = scorecardClone.querySelectorAll('th');
      tableHeaders.forEach(th => {
        (th as HTMLElement).style.padding = '12px 8px';
        (th as HTMLElement).style.textAlign = 'center';
        (th as HTMLElement).style.fontWeight = '600';
        (th as HTMLElement).style.fontSize = '22px';
      });
      
      const tableCells = scorecardClone.querySelectorAll('td');
      tableCells.forEach(cell => {
        (cell as HTMLElement).style.padding = '12px 8px';
        (cell as HTMLElement).style.verticalAlign = 'middle';
        (cell as HTMLElement).style.textAlign = 'center';
        (cell as HTMLElement).style.fontSize = '22px';
      });
      
      const scoreContainers = scorecardClone.querySelectorAll('td > div');
      scoreContainers.forEach(container => {
        if (container.parentElement?.tagName === 'TD') {
          (container as HTMLElement).style.display = 'flex';
          (container as HTMLElement).style.alignItems = 'center';
          (container as HTMLElement).style.justifyContent = 'center';
          (container as HTMLElement).style.height = '40px';
          (container as HTMLElement).style.width = '40px';
          (container as HTMLElement).style.margin = '0 auto';
          (container as HTMLElement).style.fontSize = '22px';
          (container as HTMLElement).style.fontWeight = '500';
        }
      });
      
      const sectionTitles = scorecardClone.querySelectorAll('h4');
      sectionTitles.forEach(title => {
        (title as HTMLElement).style.fontSize = '28px';
        (title as HTMLElement).style.fontWeight = '600';
        (title as HTMLElement).style.marginTop = '15px';
        (title as HTMLElement).style.marginBottom = '10px';
      });
      
      const summarySection = scorecardClone.querySelector('.pt-2.border-t.space-y-3');
      if (summarySection) {
        (summarySection as HTMLElement).style.marginTop = '40px';
        (summarySection as HTMLElement).style.paddingTop = '30px';
        (summarySection as HTMLElement).style.marginBottom = '120px';
      }
      
      const summaryRows = scorecardClone.querySelectorAll('.flex.justify-between');
      summaryRows.forEach(row => {
        (row as HTMLElement).style.fontSize = '24px';
        (row as HTMLElement).style.padding = '8px 0';
        (row as HTMLElement).style.marginBottom = '20px';
        
        const label = row.querySelector('span:first-child');
        const value = row.querySelector('span:last-child');
        
        if (label && value) {
          (row as HTMLElement).style.display = 'flex';
          (row as HTMLElement).style.flexDirection = 'row';
          (row as HTMLElement).style.justifyContent = 'flex-start';
          (row as HTMLElement).style.gap = '12px';
          
          (label as HTMLElement).style.fontWeight = 'bold';
          (label as HTMLElement).style.minWidth = '150px';
          
          (value as HTMLElement).style.fontWeight = '500';
          
          if (label.textContent?.endsWith(':')) {
            label.textContent = label.textContent.slice(0, -1);
          }
        }
      });
      
      const watermark = document.createElement('div');
      (watermark as HTMLElement).style.position = 'absolute';
      (watermark as HTMLElement).style.bottom = '40px';
      (watermark as HTMLElement).style.right = '40px';
      (watermark as HTMLElement).style.fontSize = '20px';
      (watermark as HTMLElement).style.color = '#666';
      (watermark as HTMLElement).style.fontWeight = 'bold';
      (watermark as HTMLElement).style.zIndex = '5';
      watermark.innerText = 'MyBirdieBoard.com';
      canvasContainer.appendChild(watermark);
      
      canvasContainer.appendChild(scorecardClone);
      
      (canvasContainer as HTMLElement).style.left = '-9999px';
      document.body.appendChild(canvasContainer);
      
      const canvas = await html2canvas(canvasContainer, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        allowTaint: true,
        useCORS: true,
        width: 1080,
        height: 1400,
        imageTimeout: 5000,
        onclone: (clonedDoc) => {
          const logoInClone = clonedDoc.querySelector('img');
          if (logoInClone) {
            logoInClone.crossOrigin = 'anonymous';
            
            const baseUrl = window.location.origin;
            logoInClone.src = `${baseUrl}/logo.png?t=${new Date().getTime()}`;
            
            logoInClone.onload = () => console.log('Logo loaded in clone');
            logoInClone.onerror = () => console.error('Logo failed to load in clone');
          }
        }
      });
      
      document.body.removeChild(canvasContainer);
      
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
  
  const handleDownloadScorecard = async () => {
    try {
      setIsGeneratingImage(true);
      
      const totalScore = scores.reduce((sum, score) => sum + (score.strokes || 0), 0);
      const totalPar = scores.reduce((sum, score) => sum + score.par, 0);
      const toPar = totalScore - totalPar;
      const toParStr = toPar > 0 ? `plus${toPar}` : toPar < 0 ? `minus${Math.abs(toPar)}` : 'even';
      
      const courseName = (round.courses?.courseName || 'golf').replace(/\s+/g, '-').toLowerCase();
      const scoreDate = roundDate ? roundDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const fileName = `${courseName}-${scoreDate}-${totalScore}-${toParStr}.png`;
      
      const scorecardBlob = await generateScorecardImage();
      
      if (!scorecardBlob) {
        throw new Error('Failed to generate scorecard image');
      }
      
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

  const front9 = scores.filter(score => score.hole <= 9);
  const back9 = scores.filter(score => score.hole > 9);

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
                showDetailedStats={showDetailedStats}
                setShowDetailedStats={setShowDetailedStats}
              />

              {roundHandicap > 0 && (
                <div className="mt-2 mb-4 px-1">
                  <p className="text-sm text-muted-foreground">
                    Handicap at time of posting: <span className="font-semibold">{roundHandicap}</span>
                  </p>
                </div>
              )}

              {roundHandicap > 0 && !isEditing && (
                <div className="mt-4 mb-2 flex justify-end">
                  <button 
                    onClick={() => setShowNet(!showNet)}
                    className={`px-3 py-1 text-sm rounded-full flex items-center gap-1.5 transition-colors ${showNet ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    {showNet ? 'Show Gross Score' : 'Show Net Score'}
                  </button>
                </div>
              )}

              <Separator className="my-4" />
              
              <div className="space-y-6">
                {front9.length > 0 && (
                  <ScoreTable
                    scores={front9}
                    isEditing={isEditing}
                    handleScoreChange={handleScoreChange}
                    handleGIRChange={handleGIRChange}
                    title="Front Nine"
                    showDetailedStats={showDetailedStats}
                  />
                )}
                
                {back9.length > 0 && (
                  <ScoreTable
                    scores={back9}
                    isEditing={isEditing}
                    handleScoreChange={handleScoreChange}
                    handleGIRChange={handleGIRChange}
                    title="Back Nine"
                    startIndex={front9.length}
                    showDetailedStats={showDetailedStats}
                  />
                )}
                
                <ScoreTableSummary 
                  scores={scores} 
                  handicapIndex={roundHandicap}
                  showNet={showNet}
                  showDetailedStats={showDetailedStats}
                />
              </div>
              
              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNet(!showNet)}
                  className="text-xs"
                >
                  {showNet ? "Hide Net Scores" : "Show Net Scores"}
                </Button>
                
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadScorecard}
                    disabled={isGeneratingImage}
                    className="flex items-center gap-1 text-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {isGeneratingImage ? "Generating..." : "Download Scorecard"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
