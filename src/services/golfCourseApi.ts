
import { toast } from "@/hooks/use-toast";

// Types for Golf Course API responses
export interface GolfCourse {
  id: number;
  club_name: string;
  course_name: string;
  location: {
    address?: string;
    city: string;
    state: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface TeeBox {
  tee_name: string;
  course_rating: number;
  slope_rating: number;
  bogey_rating?: number;
  total_yards: number;
  total_meters?: number;
  number_of_holes: number;
  par_total: number;
  holes: Array<{
    par: number;
    yardage: number;
    handicap: number;
  }>;
}

export interface CourseDetail {
  id: number;
  club_name: string;
  course_name: string;
  location: {
    address?: string;
    city: string;
    state: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  tees: {
    female?: TeeBox[];
    male?: TeeBox[];
  };
}

// API configuration for golfcourseapi.com - UPDATED BASED ON SPECIFICATION
const API_CONFIG = {
  baseUrl: 'https://api.golfcourseapi.com',
  searchEndpoint: '/v1/search',
  courseDetailsEndpoint: '/v1/courses',
  headers: {
    'Authorization': 'Key GZQVPVDJB4DPZAQYIR6M64J2NQ',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Mock data for when the API is unavailable
const MOCK_COURSES = [
  {
    id: 1,
    club_name: "Pebble Beach Golf Links",
    course_name: "Pebble Beach Golf Links",
    location: {
      city: "Pebble Beach",
      state: "CA",
      country: "United States"
    }
  },
  {
    id: 2,
    club_name: "St Andrews Links",
    course_name: "Old Course",
    location: {
      city: "St Andrews",
      state: "",
      country: "Scotland"
    }
  },
  {
    id: 3,
    club_name: "Augusta National Golf Club",
    course_name: "Augusta National",
    location: {
      city: "Augusta",
      state: "GA",
      country: "United States"
    }
  },
  {
    id: 4,
    club_name: "Torrey Pines Golf Course",
    course_name: "South Course",
    location: {
      city: "La Jolla",
      state: "CA",
      country: "United States"
    }
  },
  {
    id: 5,
    club_name: "TPC Sawgrass",
    course_name: "THE PLAYERS Stadium Course",
    location: {
      city: "Ponte Vedra Beach",
      state: "FL",
      country: "United States"
    }
  }
];

/**
 * Search for golf courses by name
 * @param query Course name query
 * @returns Array of matching golf courses
 */
export const searchCourses = async (query: string): Promise<GolfCourse[]> => {
  if (!query || query.trim().length < 3) {
    console.warn('Search query must be at least 3 characters');
    return [];
  }

  try {
    console.log(`Searching for courses with query: ${query}`);
    
    // Build search URL with proper parameter name according to API spec
    const searchParams = new URLSearchParams({
      search_query: query.trim()
    });
    
    const requestUrl = `${API_CONFIG.baseUrl}${API_CONFIG.searchEndpoint}?${searchParams}`;
    console.log('API Request URL:', requestUrl);
    console.log('API Request Headers:', API_CONFIG.headers);

    // Make the API request with proper CORS handling
    const response = await fetch(
      requestUrl,
      { 
        method: 'GET',
        headers: API_CONFIG.headers,
        mode: 'cors',
        credentials: 'omit',
        signal: AbortSignal.timeout(10000)
      }
    );
    
    // Log detailed response information
    console.log('API Response Status:', response.status);
    console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));
    
    // Handle specific HTTP status codes
    if (response.status === 404) {
      console.warn('No courses found for the search term');
      return getMockSearchResults(query);
    }
    
    if (response.status === 401) {
      console.error('Invalid or expired API key. Please check your authorization.');
      toast({
        title: "Authorization Error",
        description: "Invalid API key. Using sample data instead.",
        variant: "destructive",
      });
      return getMockSearchResults(query);
    }
    
    if (response.status === 429) {
      console.error('API rate limit exceeded.');
      toast({
        title: "Rate Limit Exceeded",
        description: "Too many requests. Using sample data instead.",
        variant: "destructive",
      });
      return getMockSearchResults(query);
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}):`, errorText);
      toast({
        title: `API Error: ${response.status}`,
        description: "Using sample data instead.",
        variant: "destructive",
      });
      return getMockSearchResults(query);
    }

    // Parse and validate response
    const responseText = await response.text();
    console.log('API Raw Response:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Parsed API Response:', data);
    } catch (parseError) {
      console.error('Failed to parse API response:', parseError);
      toast({
        title: "Data Error",
        description: "Invalid API response format. Using sample data instead.",
        variant: "destructive",
      });
      return getMockSearchResults(query);
    }
    
    // Validate response structure according to API spec
    if (!data.courses || !Array.isArray(data.courses)) {
      console.warn('Unexpected API response format:', data);
      toast({
        title: "Data Error",
        description: "Unexpected response format. Using sample data instead.",
        variant: "destructive",
      });
      return getMockSearchResults(query);
    }
    
    // Map API response to our interface
    const courses: GolfCourse[] = data.courses.map((course: any) => ({
      id: course.id,
      club_name: course.club_name || "Unknown Club",
      course_name: course.course_name || "Unknown Course",
      location: {
        address: course.location?.address,
        city: course.location?.city || '',
        state: course.location?.state || '',
        country: course.location?.country || 'United States',
        latitude: course.location?.latitude,
        longitude: course.location?.longitude
      }
    }));
    
    if (courses.length === 0) {
      console.log(`No courses found matching "${query}"`);
    }
    
    return courses;
  } catch (error) {
    console.error('Golf course search error:', error);
    
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Network error - API may be unreachable');
      toast({
        title: "Connection Error",
        description: "Unable to connect to the golf course database. Using sample data instead.",
        variant: "destructive",
      });
    } else {
      // For other errors, provide a more specific message
      toast({
        title: "Search Error",
        description: `Error searching courses: ${error instanceof Error ? error.message : 'Unknown error'}. Using sample data instead.`,
        variant: "destructive",
      });
    }
    
    // Fall back to mock data
    return getMockSearchResults(query);
  }
};

/**
 * Filter mock courses based on search query
 * @param query Search query
 * @returns Filtered mock courses
 */
const getMockSearchResults = (query: string): GolfCourse[] => {
  console.log('Using mock data for search results');
  
  if (!query) return [];
  
  const normalizedQuery = query.toLowerCase();
  return MOCK_COURSES.filter(course => 
    course.club_name.toLowerCase().includes(normalizedQuery) ||
    course.course_name.toLowerCase().includes(normalizedQuery) ||
    course.location.city.toLowerCase().includes(normalizedQuery)
  );
};

/**
 * Get detailed information about a specific golf course
 * @param courseId Course ID
 * @returns Course details including holes and tees
 */
export const getCourseDetails = async (courseId: number | string): Promise<CourseDetail | null> => {
  try {
    console.log(`Fetching details for course ID: ${courseId}`);
    
    // Check if we're using a mock course ID
    const mockCourse = MOCK_COURSES.find(course => course.id.toString() === courseId.toString());
    if (mockCourse) {
      console.log('Using mock data for course details');
      return generateMockCourseDetails(mockCourse);
    }
    
    // Log the complete request details for debugging
    const requestUrl = `${API_CONFIG.baseUrl}${API_CONFIG.courseDetailsEndpoint}/${courseId}`;
    console.log('API Request URL:', requestUrl);
    console.log('API Request Headers:', API_CONFIG.headers);
    
    // Make the API request with proper CORS handling
    const response = await fetch(
      requestUrl,
      { 
        method: 'GET',
        headers: API_CONFIG.headers,
        mode: 'cors',
        credentials: 'omit',
        signal: AbortSignal.timeout(10000)
      }
    );
    
    // Log the response status and headers for debugging
    console.log('API Response Status:', response.status);
    console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}): ${errorText}`);
      toast({
        title: `API Error: ${response.status}`,
        description: "Using sample data instead.",
        variant: "destructive",
      });
      
      if (mockCourse) {
        return generateMockCourseDetails(mockCourse);
      }
      return null;
    }
    
    const responseText = await response.text();
    console.log('API Response Body:', responseText);
    
    // Try to parse the response as JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log("Parsed API response data:", data);
    } catch (parseError) {
      console.error("Failed to parse API response as JSON:", parseError);
      toast({
        title: "Data Error",
        description: "Invalid API response format. Using sample data instead.",
        variant: "destructive",
      });
      
      if (mockCourse) {
        return generateMockCourseDetails(mockCourse);
      }
      return null;
    }
    
    // Map API response to our CourseDetail interface based on API spec
    const courseDetail: CourseDetail = {
      id: data.id,
      club_name: data.club_name || "Unknown Club",
      course_name: data.course_name || "Unknown Course",
      location: {
        address: data.location?.address,
        city: data.location?.city || '',
        state: data.location?.state || '',
        country: data.location?.country || 'United States',
        latitude: data.location?.latitude,
        longitude: data.location?.longitude
      },
      tees: {
        male: data.tees?.male?.map((tee: any) => ({
          tee_name: tee.tee_name || "Unknown Tee",
          course_rating: tee.course_rating || 72.0,
          slope_rating: tee.slope_rating || 113,
          bogey_rating: tee.bogey_rating,
          total_yards: tee.total_yards || 6500,
          total_meters: tee.total_meters,
          number_of_holes: tee.number_of_holes || 18,
          par_total: tee.par_total || 72,
          holes: Array.isArray(tee.holes) ? tee.holes.map((hole: any) => ({
            par: hole.par || 4,
            yardage: hole.yardage || 400,
            handicap: hole.handicap || 1
          })) : []
        })) || [],
        female: data.tees?.female?.map((tee: any) => ({
          tee_name: tee.tee_name || "Unknown Tee",
          course_rating: tee.course_rating || 72.0,
          slope_rating: tee.slope_rating || 113,
          bogey_rating: tee.bogey_rating,
          total_yards: tee.total_yards || 5800,
          total_meters: tee.total_meters,
          number_of_holes: tee.number_of_holes || 18,
          par_total: tee.par_total || 72,
          holes: Array.isArray(tee.holes) ? tee.holes.map((hole: any) => ({
            par: hole.par || 4,
            yardage: hole.yardage || 400,
            handicap: hole.handicap || 1
          })) : []
        })) || []
      }
    };
    
    return courseDetail;
  } catch (error) {
    console.error('Golf course details error:', error);
    
    // Log specific error details for debugging
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Network error - This may be a CORS issue or the API may be unavailable');
      toast({
        title: "Connection Error",
        description: "Unable to connect to the golf course database. Using sample data instead.",
        variant: "destructive",
      });
    } else {
      // For other errors, provide a more specific message
      toast({
        title: "API Error",
        description: `Error retrieving course details: ${error instanceof Error ? error.message : 'Unknown error'}. Using sample data instead.`,
        variant: "destructive",
      });
    }
    
    // Find if we have a mock course that matches
    const mockCourse = MOCK_COURSES.find(course => course.id.toString() === courseId.toString());
    if (mockCourse) {
      return generateMockCourseDetails(mockCourse);
    }
    
    // Return null on error if no mock data available
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
  const holes = Array(18).fill(null).map((_, i) => ({
    par: i % 3 === 0 ? 5 : (i % 3 === 1 ? 3 : 4), // Mix of par 3, 4, 5
    yardage: 350 + (i * 15), // Varying yardages
    handicap: i + 1, // Handicap 1-18
  }));
  
  const courseDetail: CourseDetail = {
    id: course.id,
    club_name: course.club_name,
    course_name: course.course_name,
    location: course.location,
    tees: {
      male: [
        {
          tee_name: "Blue",
          course_rating: 72.5,
          slope_rating: 133,
          bogey_rating: 98.6,
          total_yards: 6800,
          total_meters: 6219,
          number_of_holes: 18,
          par_total: 72,
          holes: holes.map((hole, i) => ({
            ...hole,
            yardage: hole.yardage + 20 // Blue tees are longer
          }))
        },
        {
          tee_name: "White",
          course_rating: 70.8,
          slope_rating: 128,
          bogey_rating: 94.2,
          total_yards: 6400,
          total_meters: 5852,
          number_of_holes: 18,
          par_total: 72,
          holes: holes
        }
      ],
      female: [
        {
          tee_name: "Red",
          course_rating: 69.2,
          slope_rating: 123,
          bogey_rating: 93.1,
          total_yards: 5800,
          total_meters: 5305,
          number_of_holes: 18,
          par_total: 72,
          holes: holes.map((hole, i) => ({
            ...hole,
            yardage: hole.yardage - 30 // Red tees are shorter
          }))
        }
      ]
    }
  };
  
  return courseDetail;
};
