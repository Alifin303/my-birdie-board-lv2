
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
  // Properties for courses from different sources
  isUserAdded?: boolean;
  isApiCourse?: boolean;
  apiCourseId?: string;
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

// Configuration for API options
export const API_CONFIG = {
  // Always use real API
  USE_REAL_API: true,
  // The base URL for the golf course API - updated based on OpenAPI spec
  API_URL: "https://api.golfcourseapi.com/v1",
  // API key for authentication
  API_KEY: "GZQVPVDJB4DPZAQYIR6M64J2NQ",
  // Proxy URL to avoid CORS issues (set to empty if not needed)
  PROXY_URL: ""
};

// Search courses function - updated to match OpenAPI spec
export async function searchCourses(query: string, includeMockData: boolean = false): Promise<{ mockCourses: GolfCourse[], results: GolfCourse[] }> {
  console.log(`Searching for courses with query: ${query}`);
  const normalizedQuery = query.toLowerCase().trim();
  
  let apiResults: GolfCourse[] = [];
  
  try {
    // Build query parameters according to the API spec
    const searchParams = new URLSearchParams({
      search_query: normalizedQuery
    });
    
    // API URL with search endpoint from the OpenAPI spec
    const apiUrl = `${API_CONFIG.API_URL}/search?${searchParams.toString()}`;
    
    console.log(`Making API request to: ${apiUrl}`);
    console.log(`Using authorization header: Key ${API_CONFIG.API_KEY}`);
    
    // Make the API request with the proper Authorization header format
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${API_CONFIG.API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors',
      signal: AbortSignal.timeout(15000) // 15 second timeout
    });
    
    console.log(`API response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`API returned error status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`API response data:`, data);
    
    // Process the API response based on its structure from the OpenAPI spec
    // Ensure we always have an array of courses, even if the API returns an empty array or has a different structure
    if (data.courses && Array.isArray(data.courses)) {
      apiResults = data.courses;
    } else if (Array.isArray(data)) {
      apiResults = data;
    } else {
      console.warn('API response format did not match expected structure, using empty array');
      apiResults = [];
    }
    
    console.log(`Found ${apiResults.length} courses from API`);
  } catch (error) {
    // Check if we received a network error
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error(`Network error calling golf course API:`, error);
      
      // Try alternative API URL (old one) as fallback in case new one doesn't work
      try {
        console.log("Trying alternative API URL as fallback...");
        
        const fallbackUrl = "https://golf-courses-api.herokuapp.com/api/v1/courses/search";
        const searchParams = new URLSearchParams({
          q: normalizedQuery,
          limit: '50'
        });
        
        const fallbackApiUrl = `${fallbackUrl}?${searchParams.toString()}`;
        
        console.log(`Making fallback API request to: ${fallbackApiUrl}`);
        
        const fallbackResponse = await fetch(fallbackApiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Key ${API_CONFIG.API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors',
          signal: AbortSignal.timeout(15000)
        });
        
        if (!fallbackResponse.ok) {
          throw new Error(`Fallback API returned error status: ${fallbackResponse.status}`);
        }
        
        const fallbackData = await fallbackResponse.json();
        
        if (fallbackData.courses && Array.isArray(fallbackData.courses)) {
          apiResults = fallbackData.courses;
        } else if (fallbackData.data && Array.isArray(fallbackData.data)) {
          apiResults = fallbackData.data;
        } else if (Array.isArray(fallbackData)) {
          apiResults = fallbackData;
        } else {
          console.warn('Fallback API response format did not match expected structure, using empty array');
          apiResults = [];
        }
        
        console.log(`Found ${apiResults.length} courses from fallback API`);
      } catch (fallbackError) {
        console.error(`Error calling fallback golf course API:`, fallbackError);
        // Even if both APIs fail, return an empty array instead of throwing an error
        apiResults = [];
        console.warn("Both primary and fallback APIs failed, returning empty results");
      }
    } else {
      // Add more context to other types of errors
      console.error(`Error calling golf course API:`, error);
      // Return empty array instead of throwing error to avoid breaking the UI
      apiResults = [];
      console.warn("API error occurred, returning empty results");
    }
  }
  
  // Always return a valid structure with empty arrays as fallback
  return { mockCourses: [], results: apiResults };
}

// Get course details function - updated to match OpenAPI spec
export async function getCourseDetails(courseId: number | string): Promise<CourseDetail> {
  console.log(`Fetching details for course ID: ${courseId}`);
  
  try {
    // API URL with course ID endpoint from the OpenAPI spec
    const apiUrl = `${API_CONFIG.API_URL}/courses/${courseId}`;
    
    console.log(`Making API request to: ${apiUrl}`);
    
    // Make the API request with the proper Authorization header format
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${API_CONFIG.API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors',
      signal: AbortSignal.timeout(15000) // 15 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`API returned error status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`API course details data:`, data);
    
    // Check if we need to try a fallback API
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
      throw new Error('Empty response from API');
    }
    
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
    // Check if we received a network error
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error(`Network error fetching course details:`, error);
      
      // Try alternative API URL (old one) as fallback
      try {
        console.log("Trying alternative API URL for course details as fallback...");
        
        const fallbackUrl = `https://golf-courses-api.herokuapp.com/api/v1/courses/${courseId}`;
        
        console.log(`Making fallback API request to: ${fallbackUrl}`);
        
        const fallbackResponse = await fetch(fallbackUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Key ${API_CONFIG.API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors',
          signal: AbortSignal.timeout(15000)
        });
        
        if (!fallbackResponse.ok) {
          throw new Error(`Fallback API returned error status: ${fallbackResponse.status}`);
        }
        
        const fallbackData = await fallbackResponse.json();
        
        let courseDetail: CourseDetail;
        
        if (fallbackData.course) {
          courseDetail = fallbackData.course;
        } else if (fallbackData.data) {
          courseDetail = fallbackData.data;
        } else {
          courseDetail = fallbackData;
        }
        
        // Map the response
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
      } catch (fallbackError) {
        console.error(`Error calling fallback course details API:`, fallbackError);
        throw new Error(`Failed to get course details: Network error. The Golf Course API servers might be down or unreachable.`);
      }
    } else {
      console.error(`Error fetching course details from API:`, error);
      const enhancedError = new Error(`Failed to get course details: ${(error as Error).message}. Please check your network connection and ensure the API is available.`);
      (enhancedError as any).originalError = error;
      throw enhancedError;
    }
  }
}

// Check API health status
export async function checkApiHealth(): Promise<{status: string, available: boolean}> {
  try {
    // API URL with healthcheck endpoint from the OpenAPI spec
    const apiUrl = `${API_CONFIG.API_URL}/healthcheck`;
    
    console.log(`Checking API health at: ${apiUrl}`);
    
    // Make the API request with the proper Authorization header format
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${API_CONFIG.API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    if (!response.ok) {
      return { status: `Error: ${response.status}`, available: false };
    }
    
    const data = await response.json();
    
    return { 
      status: data.status || 'unknown', 
      available: data.status === 'available'
    };
  } catch (error) {
    console.error(`Error checking API health:`, error);
    
    // Try alternative API URL as fallback
    try {
      const fallbackUrl = "https://golf-courses-api.herokuapp.com/api/v1/status";
      
      console.log(`Checking fallback API health at: ${fallbackUrl}`);
      
      const fallbackResponse = await fetch(fallbackUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Key ${API_CONFIG.API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        signal: AbortSignal.timeout(5000)
      });
      
      if (!fallbackResponse.ok) {
        return { status: `Fallback Error: ${fallbackResponse.status}`, available: false };
      }
      
      const fallbackData = await fallbackResponse.json();
      
      return { 
        status: fallbackData.status || 'unknown (fallback API)', 
        available: true
      };
    } catch (fallbackError) {
      console.error(`Error checking fallback API health:`, fallbackError);
      return { 
        status: `Network Error: ${(error as Error).message}`, 
        available: false 
      };
    }
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
