
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAdminActions } from "@/hooks/use-admin-actions";
import { useToast } from "@/hooks/use-toast";

interface RoundEditDialogProps {
  isOpen: boolean;
  roundId: number | null;
  roundData: {
    id: number;
    gross_score: number;
    holes_played: number;
    to_par_gross: number;
    date: string;
    course_name?: string;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function RoundEditDialog({ 
  isOpen, 
  roundId, 
  roundData, 
  onClose, 
  onSuccess 
}: RoundEditDialogProps) {
  const [grossScore, setGrossScore] = useState<number>(0);
  const [holesPlayed, setHolesPlayed] = useState<number>(18);
  const [toPar, setToPar] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  
  const { updateRoundScoreAndHoles } = useAdminActions();
  const { toast } = useToast();

  useEffect(() => {
    if (roundData) {
      setGrossScore(roundData.gross_score);
      setHolesPlayed(roundData.holes_played || 18);
      setToPar(roundData.to_par_gross);
    }
  }, [roundData]);

  const handleSave = async () => {
    if (!roundId) return;
    
    // Validate inputs
    if (grossScore <= 0) {
      toast({
        title: "Invalid Score",
        description: "Gross score must be greater than 0.",
        variant: "destructive"
      });
      return;
    }
    
    if (holesPlayed !== 9 && holesPlayed !== 18) {
      toast({
        title: "Invalid Holes",
        description: "Holes played must be either 9 or 18.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const success = await updateRoundScoreAndHoles(roundId, {
        gross_score: grossScore,
        holes_played: holesPlayed,
        to_par_gross: toPar
      });
      
      if (success) {
        onSuccess();
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Round</DialogTitle>
        </DialogHeader>
        
        {roundData && (
          <div className="grid gap-4 py-4">
            <div className="text-sm text-muted-foreground mb-2">
              {roundData.course_name && <div>Course: {roundData.course_name}</div>}
              <div>Date: {new Date(roundData.date).toLocaleDateString()}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gross-score">Gross Score</Label>
                <Input
                  id="gross-score"
                  type="number"
                  value={grossScore}
                  onChange={(e) => setGrossScore(Number(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="holes-played">Holes Played</Label>
                <Input
                  id="holes-played"
                  type="number"
                  value={holesPlayed}
                  onChange={(e) => setHolesPlayed(Number(e.target.value))}
                />
                <div className="text-xs text-muted-foreground">Must be 9 or 18</div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="to-par">Score to Par</Label>
                <Input
                  id="to-par"
                  type="number"
                  value={toPar}
                  onChange={(e) => setToPar(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
