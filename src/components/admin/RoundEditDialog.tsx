
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAdminActions } from "@/hooks/use-admin-actions";
import { useToast } from "@/hooks/use-toast";
import { RoundScorecard } from "@/components/dashboard/scorecard";
import { HoleScore } from "@/components/dashboard/scorecard/types";
import { Round } from "@/components/dashboard/types";

interface RoundEditDialogProps {
  isOpen: boolean;
  roundId: number | null;
  roundData: {
    id: number;
    gross_score: number;
    holes_played?: number; // Changed from required to optional
    to_par_gross: number;
    date: string;
    course_name?: string;
    hole_scores?: string;
    tee_name?: string;
    tee_id?: string;
    courses?: {
      clubName?: string;
      courseName?: string;
    };
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
  const [isSaving, setIsSaving] = useState(false);
  const { updateRoundScoreAndHoles } = useAdminActions();
  const { toast } = useToast();

  const adaptedRound: Round = roundData ? {
    id: roundData.id,
    date: roundData.date,
    gross_score: roundData.gross_score,
    holes_played: roundData.holes_played || 18,
    to_par_gross: roundData.to_par_gross,
    hole_scores: roundData.hole_scores || '[]',
    tee_name: roundData.tee_name || '',
    tee_id: roundData.tee_id,
    courses: {
      id: 0, // Adding required id
      name: roundData.courses?.courseName || 'Unknown Course', // Adding required name
      clubName: roundData.courses?.clubName || 'Unknown Club',
      courseName: roundData.courses?.courseName || 'Unknown Course'
    }
  } : {} as Round;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        {roundData && (
          <RoundScorecard
            round={adaptedRound}
            isOpen={true}
            onOpenChange={() => onClose()}
            isAdmin={true}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
