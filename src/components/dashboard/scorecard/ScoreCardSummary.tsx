
import { Button } from "@/components/ui/button";
import { Edit, Save } from "lucide-react";

interface ScoreCardSummaryProps {
  isEditing: boolean;
  isSaving: boolean;
  editedHoleScores: number[];
  roundData: {
    gross_score: number;
    to_par_gross: number;
    net_score?: number;
    to_par_net?: number;
  };
  onEdit: () => void;
  onSave: () => void;
}

export const ScoreCardSummary = ({
  isEditing,
  isSaving,
  editedHoleScores,
  roundData,
  onEdit,
  onSave,
}: ScoreCardSummaryProps) => {
  return (
    <>
      <div className="pt-2 border-t">
        <div className="flex justify-between">
          <span className="font-medium">Total Score:</span>
          <span>
            {isEditing 
              ? editedHoleScores.reduce((sum, score) => sum + (score || 0), 0) 
              : roundData.gross_score
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
              : `${roundData.to_par_gross > 0 ? '+' : ''}${roundData.to_par_gross}`
            }
          </span>
        </div>
        {roundData.net_score !== undefined && (
          <div className="flex justify-between">
            <span className="font-medium">Net Score:</span>
            <span>{roundData.net_score}</span>
          </div>
        )}
        {roundData.to_par_net !== undefined && (
          <div className="flex justify-between">
            <span className="font-medium">Net To Par:</span>
            <span>{roundData.to_par_net > 0 ? '+' : ''}{roundData.to_par_net}</span>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-3">
        {isEditing ? (
          <Button 
            onClick={onSave} 
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        ) : (
          <Button 
            variant="outline" 
            onClick={onEdit}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit Scorecard
          </Button>
        )}
      </div>
    </>
  );
};
