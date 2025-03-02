
export interface SimplifiedGolfCourse {
  id: number;
  name: string;
  clubName: string;
  city?: string;
  state?: string;
  country?: string;
  isUserAdded?: boolean;
  apiCourseId?: string;
}

export interface SimplifiedHole {
  number: number;
  par: number;
  yards?: number;
  handicap?: number;
}

export interface SimplifiedTee {
  id: string;
  name: string;
  rating: number;
  slope: number;
  par: number;
  gender: 'male' | 'female';
  originalIndex: number;
  yards?: number;
  holes?: SimplifiedHole[];
}

export interface SimplifiedCourseDetail {
  id: number;
  name: string;
  clubName: string;
  city?: string;
  state?: string;
  country?: string;
  tees: SimplifiedTee[];
  holes: SimplifiedHole[];
  isUserAdded?: boolean;
  apiCourseId?: string;
}

export interface Score {
  hole: number;
  par: number;
  strokes?: number;
  putts?: number;
  yards?: number;
  handicap?: number;
}

export type HoleSelection = 'all' | 'front9' | 'back9';

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

export interface AddRoundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Add the CourseDetail interface export
export interface CourseDetail {
  id: number | string;
  course_name?: string;
  club_name?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  tees?: {
    male?: Array<{
      tee_name?: string;
      course_rating?: number;
      slope_rating?: number;
      par_total?: number;
      total_yards?: number;
      holes?: Array<{
        number?: number;
        par?: number;
        yardage?: number;
        handicap?: number;
      }>;
    }>;
    female?: Array<{
      tee_name?: string;
      course_rating?: number;
      slope_rating?: number;
      par_total?: number;
      total_yards?: number;
      holes?: Array<{
        number?: number;
        par?: number;
        yardage?: number;
        handicap?: number;
      }>;
    }>;
  };
}
