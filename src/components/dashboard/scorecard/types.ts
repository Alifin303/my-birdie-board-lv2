
import { Round } from "../types";

export interface HoleScore {
  hole: number;
  par: number;
  strokes?: number;
}

export interface RoundScorecardProps {
  round: Round;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  handicapIndex?: number;
}

export interface ScoreTableProps {
  scores: HoleScore[];
  isEditing: boolean;
  handleScoreChange: (index: number, value: string) => void;
  title: string;
  startIndex?: number;
}

export interface ScoreTableSummaryProps {
  scores: HoleScore[];
  handicapIndex?: number;
  showNet?: boolean;
}

export interface ScorecardHeaderProps {
  round: Round;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  roundDate: Date | undefined;
  calendarOpen: boolean;
  setCalendarOpen: (value: boolean) => void;
  handleDateSelect: (date: Date | undefined) => void;
  isSaving: boolean;
  handleSaveChanges: () => Promise<void>;
}
