
import { CourseDetail } from "@/services/golfCourseApi";

export type HoleSelection = "all" | "front9" | "back9";

export interface SimplifiedGolfCourse {
  id: number;
  name: string;
  clubName: string;
  city?: string;
  state?: string;
  country?: string;
  apiCourseId?: string | number;
  isUserAdded?: boolean;
}

export interface SimplifiedHole {
  number: number;
  par: number;
  yards: number;
  handicap: number;
}

export interface SimplifiedTee {
  id: string;
  name: string;
  gender: 'male' | 'female';
  rating: number;
  slope: number;
  par: number;
  originalIndex?: number;
  yards: number;
  holes?: SimplifiedHole[];
  color?: string;
}

export interface SimplifiedCourseDetail {
  id: number;
  name: string;
  clubName: string;
  city: string;
  state: string;
  country: string;
  tees: SimplifiedTee[];
  holes?: SimplifiedHole[];
  apiCourseId?: string;
  isUserAdded?: boolean;
}

export interface Score {
  hole: number;
  par: number;
  strokes?: number;
  putts?: number;
  fairwayHit?: boolean;
  greenInRegulation?: boolean;
  penaltyStrokes?: number;
}

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

// Re-export CourseDetail from golfCourseApi to make it available to importers
export { CourseDetail };
