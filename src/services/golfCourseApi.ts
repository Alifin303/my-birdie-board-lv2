
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

// RapidAPI key for Golf Course Finder API
const RAPID_API_KEY = '12ed9a1bcemsh31a6ac7723dd5e3p17afabjsn0655c3579cfc';

// Updated API configuration with the correct host and endpoints
const API_CONFIG = {
  baseUrl: 'https://golf-courses-api.p.rapidapi.com',
  headers: {
    'X-RapidAPI-Key': RAPID_API_KEY,
    'X-RapidAPI-Host': 'golf-courses-api.p.rapidapi.com'
  }
};

/**
 * Search for golf courses by name
 * @param query Course name query
 * @returns Array of matching golf courses
 */
export const searchCourses = async (query: string): Promise<GolfCourse[]> => {
  try {
    console.log(`Searching for courses with query: ${query}`);
    
    // Correct endpoint for the Golf Courses API
    const response = await fetch(
      `${API_CONFIG.baseUrl}/courses?search=${encodeURIComponent(query)}`,
      { headers: API_CONFIG.headers }
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("API response:", data);
    
    // Map API response to our GolfCourse interface
    // The structure is different from the previous API
    const courses: GolfCourse[] = data.courses?.map((course: any) => ({
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
    
    // Correct endpoint for course details
    const response = await fetch(
      `${API_CONFIG.baseUrl}/courses/${courseId}`,
      { headers: API_CONFIG.headers }
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Course details API response:", data);
    
    // The API structure might be different, adjust mapping accordingly
    // This is a basic mapping, you may need to adjust based on the actual API response
    const course = data.data || data.course || data;
    
    // Map API response to our CourseDetail interface
    const courseDetail: CourseDetail = {
      id: course.id.toString(),
      name: course.name,
      city: course.city || '',
      state: course.state || '',
      country: course.country || 'USA',
      
      // Map tees - adjust based on actual API response structure
      tees: (course.tees || course.teeBoxes || []).map((tee: any) => ({
        id: tee.id.toString(),
        name: tee.teeType || tee.name,
        gender: tee.gender || 'M',
        rating: tee.rating || tee.courseRating || 72,
        slope: tee.slope || tee.slopeRating || 113,
        par: tee.par || 72
      })),
      
      // Map holes - adjust based on actual API response structure
      holes: (course.holes || []).map((hole: any) => {
        const yards: {[teeId: string]: number} = {};
        
        // Create yards object with each tee's yardage for this hole
        // Adjust based on actual API response structure
        (course.tees || course.teeBoxes || []).forEach((tee: any) => {
          const teeYardage = (tee.holes || tee.holeYardages || []).find((y: any) => 
            y.holeNumber === hole.holeNumber || y.number === hole.number
          );
          
          if (teeYardage) {
            yards[tee.id.toString()] = teeYardage.yards || teeYardage.distance || 0;
          }
        });
        
        return {
          id: `${hole.number || hole.holeNumber}`,
          number: hole.number || hole.holeNumber,
          par: hole.par,
          handicap: hole.handicap || (hole.number || hole.holeNumber),
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
