
import { useState } from "react";
import { HoleScoreDisplay } from "./HoleScoreDisplay";
import { ScoreCardSummary } from "./ScoreCardSummary";

interface Round {
  hole_scores?: any;
  gross_score: number;
  to_par_gross: number;
  net_score?: number;
  to_par_net?: number;
}

interface HoleScoreSectionProps {
  round: Round;
  isEditing: boolean;
  isSaving: boolean;
  editedHoleScores: number[];
  onScoreChange: (index: number, value: string) => void;
  onEdit: () => void;
  onSave: () => void;
}

export const HoleScoreSection = ({
  round,
  isEditing,
  isSaving,
  editedHoleScores,
  onScoreChange,
  onEdit,
  onSave,
}: HoleScoreSectionProps) => {
  // For no hole scores case
  if (!round.hole_scores && !isEditing) {
    return (
      <div className="mt-4 text-center p-4 bg-muted/20 rounded-md">
        <p className="text-muted-foreground">No hole-by-hole data available for this round.</p>
      </div>
    );
  }

  // Parse hole scores from JSON
  let holeScores: number[] = [];
  
  if (!isEditing) {
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
  } else {
    holeScores = editedHoleScores;
  }

  return (
    <div className="mt-4 space-y-6">
      {/* Front 9 */}
      <HoleScoreDisplay
        title="Front 9"
        startHole={1}
        holeScores={holeScores}
        isEditing={isEditing}
        onScoreChange={onScoreChange}
      />

      {/* Back 9 */}
      <HoleScoreDisplay
        title="Back 9"
        startHole={10}
        holeScores={holeScores}
        isEditing={isEditing}
        onScoreChange={onScoreChange}
      />

      {/* Total */}
      <ScoreCardSummary
        isEditing={isEditing}
        isSaving={isSaving}
        editedHoleScores={editedHoleScores}
        roundData={round}
        onEdit={onEdit}
        onSave={onSave}
      />
    </div>
  );
};
