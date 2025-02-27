
import { toast } from "@/hooks/use-toast";

// Types for Golf Course API responses
export interface GolfCourse {
  id: string;
  name: string;
  city: string;
  state: string;
  country?: string;
}

export interface CourseTee {
  id: string;
  name: string;
  gender: string;
  rating: number;
  slope: number;
  par: number;
}

export interface CourseHole {
  id: string;
  number: number;
  par: number;
  handicap: number;
  yards: {
    [teeId: string]: number;
  };
}

export interface CourseDetail {
  id: string;
  name: string;
  city: string;
  state: string;
  country?: string;
  holes: CourseHole[];
  tees: CourseTee[];
}

// API configuration for golfcourseapi.com
const API_CONFIG = {
  baseUrl: 'https://golfcourseapi.com/api/v1',
  searchEndpoint: '/courses',
  courseDetailsEndpoint: '/courses'
};

/**
 * Search for golf courses by name
 * @param query Course name query
 * @returns Array of matching golf courses
 */
export const searchCourses = async (query: string): Promise<GolfCourse[]> => {
  try {
    console.log(`Searching for courses with query: ${query}`);
    
    // Original API endpoint
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.searchEndpoint}?search=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("API response:", data);
    
    // Map API response to our GolfCourse interface
    const courses: GolfCourse[] = data.data?.map((course: any) => ({
      id: course.id.toString(),
      name: course.name,
      city: course.city || '',
      state: course.state || '',
      country: course.country || 'USA'
    })) || [];
    
    return courses;
  } catch (error) {
    console.error('Golf course search error:', error);
    // Return empty array on error
    return [];
  }
};

/**
 * Get detailed information about a specific golf course
 * @param courseId Course ID
 * @returns Course details including holes and tees
 */
export const getCourseDetails = async (courseId: string): Promise<CourseDetail | null> => {
  try {
    console.log(`Fetching details for course ID: ${courseId}`);
    
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.courseDetailsEndpoint}/${courseId}`
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Course details API response:", data);
    
    // Original API response structure
    const course = data.data;
    
    // Map API response to our CourseDetail interface
    const courseDetail: CourseDetail = {
      id: course.id.toString(),
      name: course.name,
      city: course.city || '',
      state: course.state || '',
      country: course.country || 'USA',
      
      // Map tees
      tees: course.tees.map((tee: any) => ({
        id: tee.id.toString(),
        name: tee.name,
        gender: tee.gender || 'M',
        rating: tee.rating || 72,
        slope: tee.slope || 113,
        par: tee.par || 72
      })),
      
      // Map holes
      holes: course.holes.map((hole: any) => {
        const yards: {[teeId: string]: number} = {};
        
        // Create yards object with each tee's yardage for this hole
        course.tees.forEach((tee: any) => {
          yards[tee.id.toString()] = hole.teeBoxes[tee.id] || 0;
        });
        
        return {
          id: `${hole.number}`,
          number: hole.number,
          par: hole.par,
          handicap: hole.handicap,
          yards: yards
        };
      })
    };
    
    return courseDetail;
  } catch (error) {
    console.error('Golf course details error:', error);
    // Return null on error, which will trigger mock data generation
    return null;
  }
};

/**
 * Generate mock course details when API fails or for testing
 * @param course Basic course information
 * @returns Mocked course details
 */
export const generateMockCourseDetails = (course: GolfCourse): CourseDetail => {
  // Create mock course details based on the selected course
  const courseDetail: CourseDetail = {
    id: course.id,
    name: course.name,
    city: course.city,
    state: course.state,
    country: course.country,
    holes: Array(18).fill(null).map((_, i) => ({
      id: `${i + 1}`,
      number: i + 1,
      par: i % 3 === 0 ? 5 : (i % 3 === 1 ? 3 : 4), // Mix of par 3, 4, 5
      handicap: i + 1,
      yards: { 
        "1": 350 + (i * 15), // Blue tees
        "2": 330 + (i * 15), // White tees
        "3": 310 + (i * 15)  // Red tees
      }
    })),
    tees: [
      {
        id: "1",
        name: "Blue",
        gender: "M",
        rating: 72.5,
        slope: 133,
        par: 72
      },
      {
        id: "2",
        name: "White",
        gender: "M",
        rating: 70.8,
        slope: 128,
        par: 72
      },
      {
        id: "3",
        name: "Red",
        gender: "F",
        rating: 69.2,
        slope: 123,
        par: 72
      }
    ]
  };
  
  return courseDetail;
};
