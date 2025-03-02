
// Type definitions for golf course data
export interface GolfCourse {
  id: number | string;
  club_name?: string;
  course_name?: string;
  website?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  // Add these properties for user-added courses
  isUserAdded?: boolean;
  name?: string;
  city?: string;
  state?: string;
  country?: string;
  tee_data?: any;
}

export interface TeeBox {
  tee_name?: string;
  tee_color?: string;
  course_rating?: number;
  slope_rating?: number;
  bogey_rating?: number;
  par_total?: number;
  total_yards?: number;
  total_meters?: number;
  number_of_holes?: number;
  front_course_rating?: number;
  front_slope_rating?: number;
  front_bogey_rating?: number;
  back_course_rating?: number;
  back_slope_rating?: number;
  back_bogey_rating?: number;
  front_nine_yards?: number;
  back_nine_yards?: number;
  holes?: Array<{
    number?: number;
    par?: number;
    yardage?: number;
    handicap?: number;
    meters?: number;
    stroke_index?: number;
  }>;
}

export interface CourseDetail {
  id: number | string;
  club_name?: string;
  course_name?: string;
  description?: string;
  website?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  holes?: number;
  tees?: {
    male?: TeeBox[];
    female?: TeeBox[];
  };
  features?: string[];
  price_range?: string;
}
