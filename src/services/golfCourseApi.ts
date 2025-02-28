
// Type definitions
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

// Configuration for API options
export const API_CONFIG = {
  // Always use real API
  USE_REAL_API: true,
  // The base URL for the golf course API
  API_URL: "https://golf-courses-api.herokuapp.com/api/v1",
  // API key for authentication
  API_KEY: "GZQVPVDJB4DPZAQYIR6M64J2NQ"
};

// Search courses function - now only using the live API
export async function searchCourses(query: string, includeMockData: boolean = false): Promise<{ mockCourses: GolfCourse[], results: GolfCourse[] }> {
  console.log(`Searching for courses with query: ${query}`);
  const normalizedQuery = query.toLowerCase().trim();
  
  let apiResults: GolfCourse[] = [];
  
  try {
    // Make request to the API
    console.log(`Making live API request to ${API_CONFIG.API_URL}/courses/search`);
    
    // Build query parameters
    const searchParams = new URLSearchParams({
      q: normalizedQuery,
      limit: '50'
    });
    
    // Make API request with the correct authorization header format
    const response = await fetch(
      `${API_CONFIG.API_URL}/courses/search?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Key ${API_CONFIG.API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        signal: AbortSignal.timeout(15000) // 15 second timeout
      }
    );
    
    console.log(`Live API response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`API returned error status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Live API response data:`, data);
    
    // Process the API response based on its structure
    if (data.courses && Array.isArray(data.courses)) {
      apiResults = data.courses;
    } else if (data.data && Array.isArray(data.data)) {
      apiResults = data.data;
    } else if (Array.isArray(data)) {
      apiResults = data;
    } else {
      throw new Error('API response format did not match expected structure');
    }
    
    console.log(`Found ${apiResults.length} courses from live API`);
    
    // Map API results to our expected format if needed
    apiResults = apiResults.map(course => {
      // Handle different API response formats - using proper typings for our interface
      const mappedCourse: GolfCourse = {
        id: course.id || (course as any).courseId || (course as any).course_id,
        club_name: (course as any).clubName || course.club_name || (course as any).name,
        course_name: (course as any).courseName || course.course_name,
        location: {
          city: (course as any).city || (course.location && course.location.city),
          state: (course as any).state || (course.location && course.location.state),
          country: (course as any).country || (course.location && course.location.country) || 'USA',
          address: (course.location && course.location.address) || (course as any).address
        }
      };
      return mappedCourse;
    });
  } catch (error) {
    console.error(`Error calling golf course API:`, error);
    throw new Error(`Failed to search for courses: ${(error as Error).message}`);
  }
  
  // Return empty array for mockCourses as we've removed all mock data
  return { mockCourses: [], results: apiResults };
}

// Get course details function - now only using the live API
export async function getCourseDetails(courseId: number | string): Promise<CourseDetail> {
  console.log(`Fetching details for course ID: ${courseId}`);
  
  try {
    // Request course details from the API
    console.log(`Making live API request to ${API_CONFIG.API_URL}/courses/${courseId}`);
    
    // Make API request for course details with the correct authorization header format
    const response = await fetch(
      `${API_CONFIG.API_URL}/courses/${courseId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Key ${API_CONFIG.API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        signal: AbortSignal.timeout(15000) // 15 second timeout
      }
    );
    
    console.log(`Live API response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`API returned error status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Live API course details data:`, data);
    
    // The API should return a Course object directly according to the spec
    let courseDetail: CourseDetail = data;
    
    // If the API returns a nested structure, handle it
    if (data.course) {
      courseDetail = data.course;
    } else if (data.data) {
      courseDetail = data.data;
    }
    
    // Make sure the response has the expected properties
    // If any required properties are missing, map them from what's available
    courseDetail = {
      id: courseDetail.id || courseId,
      club_name: courseDetail.club_name || (courseDetail as any).clubName || (courseDetail as any).name,
      course_name: courseDetail.course_name || (courseDetail as any).courseName,
      description: courseDetail.description,
      website: courseDetail.website,
      location: courseDetail.location || {
        city: (courseDetail as any).city,
        state: (courseDetail as any).state,
        country: (courseDetail as any).country || 'USA',
        address: (courseDetail as any).address
      },
      holes: courseDetail.holes || 18,
      tees: courseDetail.tees || processTees(courseDetail),
      features: courseDetail.features || [],
      price_range: courseDetail.price_range || (courseDetail as any).priceRange || '$$$'
    };
    
    return courseDetail;
  } catch (error) {
    console.error(`Error fetching course details from API:`, error);
    throw new Error(`Failed to get course details: ${(error as Error).message}`);
  }
}

// Helper function to process tees from different API response formats
function processTees(courseData: any): { male?: TeeBox[], female?: TeeBox[] } {
  if (courseData.tees) {
    return courseData.tees;
  }
  
  // If the API has a different structure for tees, try to map it
  const maleTees: TeeBox[] = [];
  const femaleTees: TeeBox[] = [];
  
  // Check for teeBoxes array
  if (courseData.teeBoxes && Array.isArray(courseData.teeBoxes)) {
    courseData.teeBoxes.forEach((teeBox: any, index: number) => {
      const isFemale = teeBox.teeType === 'ladies' || 
                      teeBox.gender === 'female' || 
                      teeBox.teeColor?.toLowerCase() === 'red';
      
      const newTeeBox: TeeBox = {
        tee_name: teeBox.tee_name || teeBox.teeName || teeBox.teeType || `Tee ${index + 1}`,
        tee_color: teeBox.teeColor || (isFemale ? 'red' : ['blue', 'white', 'yellow', 'black', 'gold'][index % 5]),
        course_rating: teeBox.course_rating || teeBox.courseRating || teeBox.rating || 72,
        slope_rating: teeBox.slope_rating || teeBox.slopeRating || teeBox.slope || 113,
        bogey_rating: teeBox.bogey_rating || teeBox.bogeyRating,
        par_total: teeBox.par_total || teeBox.totalPar || 72,
        total_yards: teeBox.total_yards || teeBox.totalYards || 6500,
        total_meters: teeBox.total_meters || teeBox.totalMeters,
        number_of_holes: teeBox.number_of_holes || teeBox.numberOfHoles || 18,
        front_course_rating: teeBox.front_course_rating || teeBox.frontCourseRating,
        front_slope_rating: teeBox.front_slope_rating || teeBox.frontSlopeRating,
        front_bogey_rating: teeBox.front_bogey_rating || teeBox.frontBogeyRating,
        back_course_rating: teeBox.back_course_rating || teeBox.backCourseRating,
        back_slope_rating: teeBox.back_slope_rating || teeBox.backSlopeRating,
        back_bogey_rating: teeBox.back_bogey_rating || teeBox.backBogeyRating,
        holes: processTeeHoles(teeBox.holes)
      };
      
      if (isFemale) {
        femaleTees.push(newTeeBox);
      } else {
        maleTees.push(newTeeBox);
      }
    });
  }
  
  return {
    male: maleTees.length > 0 ? maleTees : undefined,
    female: femaleTees.length > 0 ? femaleTees : undefined
  };
}

// Process hole data to match our expected format
function processTeeHoles(holes: any[] | undefined): Array<{ number?: number, par?: number, yardage?: number, handicap?: number }> {
  if (!holes || !Array.isArray(holes)) {
    return [];
  }
  
  return holes.map((hole, idx) => ({
    number: hole.number || hole.holeNumber || idx + 1,
    par: hole.par || 4,
    yardage: hole.yardage || hole.yards || 400,
    handicap: hole.handicap || hole.hcp || hole.strokeIndex || idx + 1
  }));
}
