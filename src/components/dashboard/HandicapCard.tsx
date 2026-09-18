import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import { useHandicapBreakdown } from "@/hooks/use-handicap-breakdown";

interface HandicapCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  handicap: number;
  userId: string;
}

export const HandicapCard = ({ open, onOpenChange, userName, handicap, userId }: HandicapCardProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: breakdown, isLoading } = useHandicapBreakdown(userId, open);
  const handicapRounds = (breakdown?.entries ?? []).filter((entry) => entry.counting);

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
        
        <div id="handicap-card-content" className="always-light bg-white p-8 space-y-6">
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
