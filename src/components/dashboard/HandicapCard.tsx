import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface HandicapCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  handicap: number;
  userId: string;
}

interface RoundForHandicap {
  id: number;
  date: string;
  gross_score: number;
  course_name: string;
  tee_name: string;
  slope: number;
  rating: number;
  scoreDifferential: number;
}

export const HandicapCard = ({ open, onOpenChange, userName, handicap, userId }: HandicapCardProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: handicapRounds, isLoading } = useQuery({
    queryKey: ['handicapRounds', userId, handicap],
    queryFn: async () => {
      console.log('Fetching handicap rounds for user:', userId);
      // Fetch all rounds with course and tee information
      const { data: rounds, error } = await supabase
        .from('rounds')
        .select(`
          id,
          date,
          gross_score,
          holes_played,
          course_id,
          courses:course_id(name),
          tee_name,
          tee_id
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      console.log('Fetched rounds:', rounds);

      // For each round, get the tee info (slope and rating)
      const roundsWithTeeInfo = await Promise.all(
        rounds.map(async (round) => {
          if (!round.tee_id) {
            console.log('Round missing tee_id:', round);
            return null;
          }

          const { data: teeData } = await supabase
            .from('course_tees')
            .select('slope, rating, par')
            .eq('course_id', round.course_id)
            .eq('tee_id', round.tee_id)
            .maybeSingle();

          if (!teeData) {
            console.log('No tee data found for tee_id:', round.tee_id);
            return null;
          }

          // Calculate score differential
          const adjustedScore = round.holes_played === 9 
            ? (round.gross_score * 2) + 1 
            : round.gross_score;
          
          const scoreDifferential = ((adjustedScore - (teeData.rating || 72)) * 113) / (teeData.slope || 113);

          return {
            id: round.id,
            date: round.date,
            gross_score: round.gross_score,
            course_name: round.courses?.name || 'Unknown Course',
            tee_name: round.tee_name || 'Unknown Tee',
            slope: teeData.slope || 113,
            rating: teeData.rating || 72,
            scoreDifferential,
            holes_played: round.holes_played || 18
          };
        })
      );

      const validRounds = roundsWithTeeInfo.filter(r => r !== null) as RoundForHandicap[];
      
      console.log('Valid rounds with tee data:', validRounds.length);
      
      // Sort by score differential and take the best ones used for handicap
      const sortedByDifferential = [...validRounds].sort((a, b) => a.scoreDifferential - b.scoreDifferential);
      
      // Determine how many rounds are used based on WHS
      let roundsToUse = 0;
      if (validRounds.length >= 20) roundsToUse = 8;
      else if (validRounds.length >= 15) roundsToUse = 6;
      else if (validRounds.length >= 10) roundsToUse = 4;
      else if (validRounds.length >= 5) roundsToUse = 3;
      else roundsToUse = 1;

      console.log(`Using ${roundsToUse} out of ${validRounds.length} rounds`);
      const selectedRounds = sortedByDifferential.slice(0, roundsToUse);
      console.log('Selected rounds for handicap card:', selectedRounds);

      return selectedRounds;
    },
    enabled: open,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const element = document.getElementById('handicap-card-content');
      if (!element) return;

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2
      });

      const link = document.createElement('a');
      link.download = `handicap-card-${userName.replace(/\s/g, '-')}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error downloading handicap card:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const formattedHandicap = handicap < 0 
    ? `+${Math.abs(handicap).toFixed(1)}` 
    : handicap.toFixed(1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Handicap Card</DialogTitle>
        </DialogHeader>
        
        <div id="handicap-card-content" className="bg-white p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-end border-b pb-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Issued by</p>
              <p className="font-semibold">MyBirdieBoard</p>
            </div>
          </div>

          {/* Player Info */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-primary">{userName}</h2>
            <div className="inline-block bg-primary/10 rounded-lg px-6 py-4">
              <p className="text-sm text-muted-foreground">Handicap Index</p>
              <p className="text-5xl font-bold text-primary">{formattedHandicap}</p>
            </div>
          </div>

          {/* Rounds Used for Calculation */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Rounds Used for Calculation</h3>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {handicapRounds?.map((round, index) => (
                  <div key={round.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{round.course_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(round.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{round.gross_score}</p>
                        <p className="text-xs text-muted-foreground">
                          Diff: {round.scoreDifferential.toFixed(1)}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tee</p>
                        <p className="font-medium">{round.tee_name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Slope</p>
                        <p className="font-medium">{round.slope}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Rating</p>
                        <p className="font-medium">{round.rating.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground border-t pt-4">
            <p>This handicap is calculated using the World Handicap System (WHS)</p>
            <p>Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Download Button */}
        <div className="flex justify-center pt-4 border-t">
          <Button 
            onClick={handleDownload} 
            disabled={isDownloading}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isDownloading ? 'Downloading...' : 'Download Handicap Card'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
