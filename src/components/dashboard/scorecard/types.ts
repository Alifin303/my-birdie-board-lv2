
export interface HoleScore {
  hole: number;
  par: number;
  strokes?: number;
  putts?: number;
}

export interface RoundScorecardProps {
  round: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface ScorecardHeaderProps {
  round: any;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  roundDate: Date | undefined;
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean) => void;
  handleDateSelect: (date: Date | undefined) => void;
  isSaving: boolean;
  handleSaveChanges: () => void;
  selectedTee?: string;
  availableTees?: Array<{id: string, name: string}>;
  handleTeeChange?: (teeName: string) => void;
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
}
