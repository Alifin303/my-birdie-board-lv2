
export interface HoleSelection {
  type: 'front9' | 'back9' | 'all' | 'custom';
  startHole?: number;
  endHole?: number;
}

export type SimplifiedGolfCourse = {
  id: number;
  name: string;
  clubName: string;
  city: string;
  state: string;
  country?: string;
  isUserAdded: boolean;
  isApiCourse?: boolean;
  apiCourseId?: string;
};

export type SimplifiedTee = {
  id: string;
  name: string;
  rating: number;
  slope: number;
  par: number;
  gender: string;
  originalIndex: number;
  yards?: number;
  holes?: SimplifiedHole[];
};

export type SimplifiedHole = {
  number: number;
  par: number;
  yards: number;
  handicap: number;
};

export type SimplifiedCourseDetail = {
  id: number;
  name: string;
  clubName: string;
  city: string;
  state: string;
  country?: string;
  tees: SimplifiedTee[];
  holes: SimplifiedHole[];
  isUserAdded?: boolean;
  apiCourseId?: string;
  isApiCourse?: boolean;
};

export type Score = {
  hole: number;
  strokes: number | null;
  par: number;
  putts?: number | null;
  gir?: boolean;
  fairway?: 'hit' | 'left' | 'right' | 'miss' | null;
  penalties?: number | null;
  yards?: number;
  handicap?: number;
};

export interface RoundScore {
  userScore: number;
  par: number;
  toPar: number;
  putts?: number;
  fairways?: number;
  fairwaysTotal?: number;
  gir?: number;
}

export interface AddRoundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handicapIndex?: number;
}

// Define ScoreSummary type needed by ScorecardStep.tsx
export interface ScoreSummary {
  totalStrokes: number;
  totalPar: number;
  totalPutts: number;
  toPar: number;
  puttsRecorded: boolean;
  front9Strokes: number;
  front9Par: number;
  front9ToPar: number;
  back9Strokes: number;
  back9Par: number;
  back9ToPar: number;
}

// Add CourseDetail type needed by handlers - now properly defined as an alias to SimplifiedCourseDetail
export type CourseDetail = SimplifiedCourseDetail;
