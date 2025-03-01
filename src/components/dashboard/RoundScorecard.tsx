
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

interface RoundScorecardProps {
  round: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RoundScorecard = ({ round, isOpen, onOpenChange }: RoundScorecardProps) => {
  if (!round) return null;

  // Format date for display
  const formattedDate = format(new Date(round.date), 'MMMM d, yyyy');

  // Handle hole scores display
  const renderHoleScores = () => {
    if (!round.hole_scores) {
      return (
        <div className="mt-4 text-center p-4 bg-muted/20 rounded-md">
          <p className="text-muted-foreground">No hole-by-hole data available for this round.</p>
        </div>
      );
    }

    // Parse hole scores from JSON
    let holeScores = [];
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
            {front9.map((_, index) => (
              <div key={`hole-${index + 1}`}>{index + 1}</div>
            ))}
          </div>
          <div className="grid grid-cols-10 gap-2 text-center text-sm mt-1">
            <div className="font-medium">Score</div>
            {front9.map((score, index) => (
              <div key={`score-${index + 1}`}>{score}</div>
            ))}
          </div>
        </div>

        {/* Back 9 */}
        {back9.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Back 9</h4>
            <div className="grid grid-cols-10 gap-2 text-center text-sm">
              <div className="font-medium">Hole</div>
              {back9.map((_, index) => (
                <div key={`hole-${index + 10}`}>{index + 10}</div>
              ))}
            </div>
            <div className="grid grid-cols-10 gap-2 text-center text-sm mt-1">
              <div className="font-medium">Score</div>
              {back9.map((score, index) => (
                <div key={`score-${index + 10}`}>{score}</div>
              ))}
            </div>
          </div>
        )}

        {/* Total */}
        <div className="pt-2 border-t">
          <div className="flex justify-between">
            <span className="font-medium">Total Score:</span>
            <span>{round.gross_score}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">To Par:</span>
            <span>{round.to_par_gross > 0 ? '+' : ''}{round.to_par_gross}</span>
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
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
                <p className="text-sm text-muted-foreground">Tees: {round.tee_name}</p>
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
