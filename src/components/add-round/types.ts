
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
  score: number | null;
  putts?: number | null;
  gir?: boolean;
  fairway?: 'hit' | 'left' | 'right' | 'miss' | null;
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

export interface HoleSelection {
  startHole: number;
  endHole: number;
}

export interface AddRoundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
