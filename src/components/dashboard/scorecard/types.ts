import { Round } from "../types";

export interface HoleScore {
  hole: number;
  par: number;
  strokes?: number;
  putts?: number;           // Added for putting statistics
  gir?: boolean;            // Added for green in regulation
  penalties?: number;       // Added for penalty tracking
}

export interface RoundScorecardProps {
  round: Round;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  handicapIndex?: number;
  isAdmin?: boolean;
}

export interface ScoreTableProps {
  scores: HoleScore[];
  isEditing: boolean;
  handleScoreChange: (index: number, field: 'strokes' | 'putts' | 'penalties', value: string) => void;
  handleGIRChange?: (index: number, value: boolean) => void;
  title: string;
  startIndex?: number;
  showDetailedStats?: boolean;
}

export interface ScoreTableSummaryProps {
  scores: HoleScore[];
  handicapIndex?: number;
  showNet?: boolean;
  showDetailedStats?: boolean;
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
  showDetailedStats?: boolean;
  setShowDetailedStats?: (value: boolean) => void;
}
