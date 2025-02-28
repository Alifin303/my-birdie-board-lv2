// Define types for API response
export interface GolfCourse {
  id: number;
  club_name?: string;
  course_name?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface TeeBox {
  tee_name?: string;
  course_rating?: number;
  slope_rating?: number;
  par_total?: number;
  total_yards?: number;
  holes?: Array<{
    par?: number;
    yardage?: number;
    handicap?: number;
  }>;
}

export interface CourseDetail {
  id?: number;
  club_name?: string;
  course_name?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  tees?: {
    male?: TeeBox[];
    female?: TeeBox[];
  };
}

// API key for the golf course API
const API_KEY = 'GZQVPVDJB4DPZAQYIR6M64J2NQ'; // Replace with your actual API key

// Search for courses by name
export const searchCourses = async (searchQuery: string): Promise<GolfCourse[]> => {
  try {
    console.log(`[API] Searching courses with query: ${searchQuery}`);
    
    const response = await axios.get('https://api.golfcourseapi.com/v1/search', {
      params: {
        search_query: searchQuery
      },
      headers: {
        'Authorization': `Key ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log(`[API] Search response:`, response.data);
    
    if (response.data && response.data.courses) {
      return response.data.courses;
    }
    
    console.warn("[API] Search returned no courses");
    return [];
  } catch (error) {
    console.error('[API] Error searching courses:', error);
    
    // Provide more detailed error information
    if (axios.isAxiosError(error) && error.response) {
      console.error('[API] Server response:', error.response.data);
      console.error('[API] Status code:', error.response.status);
    }
    
    throw new Error(`Failed to search courses: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Get course details by ID
export const getCourseDetails = async (courseId: string | number): Promise<CourseDetail> => {
  try {
    console.log(`[API] Getting course details for ID: ${courseId}`);
    
    const response = await axios.get(`https://api.golfcourseapi.com/v1/courses/${courseId}`, {
      headers: {
        'Authorization': `Key ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log(`[API] Course details response:`, response.data);
    
    if (response.data && response.data.course) {
      return response.data.course;
    }
    
    console.warn("[API] Course details returned no data");
    return {};
  } catch (error) {
    console.error('[API] Error fetching course details:', error);
    
    // Provide more detailed error information
    if (axios.isAxiosError(error) && error.response) {
      console.error('[API] Server response:', error.response.data);
      console.error('[API] Status code:', error.response.status);
    }
    
    throw new Error(`Failed to get course details: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Generate mock course details if API doesn't return proper data
export const generateMockCourseDetails = (course: GolfCourse): CourseDetail => {
  console.log(`[API] Generating mock data for course:`, course);

  // Create mock tee boxes
  const teeMale: TeeBox = {
    tee_name: 'Blue',
    course_rating: 72.3,
    slope_rating: 130,
    par_total: 72,
    total_yards: 6500,
    holes: Array(18).fill(null).map((_, idx) => {
      // Create a realistic mix of par 3, 4, and 5 holes
      let par = 4; // Most holes are par 4
      if (idx === 2 || idx === 6 || idx === 12 || idx === 16) {
        par = 3; // Some par 3 holes
      } else if (idx === 4 || idx === 9 || idx === 14) {
        par = 5; // Some par 5 holes
      }
      
      return {
        par: par,
        yardage: par === 3 ? 180 : (par === 5 ? 520 : 400),
        handicap: idx + 1
      };
    })
  };

  const teeFemale: TeeBox = {
    tee_name: 'Red',
    course_rating: 69.2,
    slope_rating: 120,
    par_total: 72,
    total_yards: 5800,
    holes: Array(18).fill(null).map((_, idx) => {
      // Create a realistic mix of par 3, 4, and 5 holes (same as male)
      let par = 4; // Most holes are par 4
      if (idx === 2 || idx === 6 || idx === 12 || idx === 16) {
        par = 3; // Some par 3 holes
      } else if (idx === 4 || idx === 9 || idx === 14) {
        par = 5; // Some par 5 holes
      }
      
      return {
        par: par,
        yardage: par === 3 ? 150 : (par === 5 ? 470 : 350),
        handicap: idx + 1
      };
    })
  };

  const mockCourseDetail: CourseDetail = {
    id: course.id,
    club_name: course.club_name || "Unknown Club",
    course_name: course.course_name || (course.club_name || "Unknown Course"),
    location: course.location,
    tees: {
      male: [teeMale],
      female: [teeFemale]
    }
  };

  console.log(`[API] Generated mock course details:`, mockCourseDetail);
  return mockCourseDetail;
};

import axios from 'axios';
