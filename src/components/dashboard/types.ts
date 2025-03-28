
export interface Round {
  id: number;
  date: string;
  tee_name: string;
  tee_id?: string;
  gross_score: number;
  net_score?: number;
  to_par_gross: number;
  to_par_net?: number;
  hole_scores?: any;
  handicap_at_posting?: number; // Add this field to store the handicap at posting time
  courses?: {
    id: number;
    name: string;
    city?: string;
    state?: string;
    clubName?: string;
    courseName?: string;
  };
}

export interface HoleScore {
  hole: number;
  par: number;
  strokes: number;
  putts?: number;
  penalties?: number;
  gir?: boolean;
}

export interface CourseStats {
  courseId: number;
  courseName: string;
  clubName: string;
  city?: string;
  state?: string;
  roundsPlayed: number;
  bestGrossScore: number;
  bestNetScore: number | null;
  bestToPar: number;
  bestToParNet: number | null;
}

export interface Stats {
  totalRounds: number;
  bestGrossScore: number;
  bestNetScore: number | null;
  bestToPar: number;
  bestToParNet: number | null;
  handicapIndex: number;
  roundsNeededForHandicap: number;
}
