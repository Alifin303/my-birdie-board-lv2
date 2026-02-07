
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
  // Edge function URL for proxying API requests (keeps API key server-side)
  EDGE_FUNCTION_URL: "https://rbhzesocmhazynkfyhst.supabase.co/functions/v1/golf-course-api",
};

// Search courses function - proxied through edge function
export async function searchCourses(query: string, includeMockData: boolean = false): Promise<{ mockCourses: GolfCourse[], results: GolfCourse[] }> {
  console.log(`Searching for courses with query: ${query}`);
  const normalizedQuery = query.toLowerCase().trim();
  
  let apiResults: GolfCourse[] = [];
  
  try {
    const apiUrl = `${API_CONFIG.EDGE_FUNCTION_URL}?action=search&q=${encodeURIComponent(normalizedQuery)}`;
    
    console.log(`Making API request via edge function`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(15000)
    });
    
    console.log(`API response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`API returned error status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`API response data:`, data);
    
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
    console.error(`Error calling golf course API:`, error);
    apiResults = [];
    console.warn("API error occurred, returning empty results");
  }
  
  return { mockCourses: [], results: apiResults };
}

// Get course details function - proxied through edge function
export async function getCourseDetails(courseId: number | string): Promise<CourseDetail> {
  console.log(`Fetching details for course ID: ${courseId}`);
  
  try {
    const apiUrl = `${API_CONFIG.EDGE_FUNCTION_URL}?action=course&id=${courseId}`;
    
    console.log(`Making API request via edge function`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(15000)
    });
    
    if (!response.ok) {
      throw new Error(`API returned error status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`API course details data:`, data);
    
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
      throw new Error('Empty response from API');
    }
    
    let courseDetail: CourseDetail = data;
    
    if (data.course) {
      courseDetail = data.course;
    } else if (data.data) {
      courseDetail = data.data;
    }
    
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
    console.error(`Error fetching course details:`, error);
    throw new Error(`Failed to get course details: ${(error as Error).message}`);
  }
}
// Check API health status - proxied through edge function
export async function checkApiHealth(): Promise<{status: string, available: boolean}> {
  try {
    const apiUrl = `${API_CONFIG.EDGE_FUNCTION_URL}?action=health`;
    
    console.log(`Checking API health via edge function`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(5000)
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
    return { 
      status: `Network Error: ${(error as Error).message}`, 
      available: false 
    };
  }
}
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
