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

// API configuration for golfcourseapi.com - FIXED ENDPOINT
const API_CONFIG = {
  baseUrl: 'https://api.golfcourseapi.com/v1',  // Removed extra 'api' from path
  searchEndpoint: '/search/courses',  // Changed to correct search endpoint
  courseDetailsEndpoint: '/courses',
  headers: {
    'Authorization': 'Key 7GG4N6R5NOXNHW7H5A7EQVGL2U',
    'Content-Type': 'application/json',
    'Accept': 'application/json'  // Added Accept header
  }
};

// Mock data for when the API is unavailable
const MOCK_COURSES = [
  {
    id: "1",
    name: "Pebble Beach Golf Links",
    city: "Pebble Beach",
    state: "CA",
    country: "USA"
  },
  {
    id: "2",
    name: "St Andrews Links - Old Course",
    city: "St Andrews",
    state: "",
    country: "Scotland"
  },
  {
    id: "3",
    name: "Augusta National Golf Club",
    city: "Augusta",
    state: "GA",
    country: "USA"
  },
  {
    id: "4",
    name: "Torrey Pines Golf Course",
    city: "La Jolla",
    state: "CA",
    country: "USA"
  },
  {
    id: "5",
    name: "TPC Sawgrass",
    city: "Ponte Vedra Beach",
    state: "FL",
    country: "USA"
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
    
    // Build search URL with proper encoding
    const searchParams = new URLSearchParams({
      q: query.trim(),
      limit: '20'  // Added limit parameter
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
      return [];
    }
    
    if (response.status === 401) {
      throw new Error('Invalid or expired API key. Please check your authorization.');
    }
    
    if (response.status === 429) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}):`, errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
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
      throw new Error('Invalid API response format');
    }
    
    // Validate response structure
    if (!data.courses || !Array.isArray(data.courses)) {
      console.warn('Unexpected API response format:', data);
      throw new Error('API response missing courses array');
    }
    
    // Map API response to our interface
    const courses: GolfCourse[] = data.courses.map((course: any) => ({
      id: course.id?.toString() || "",
      name: course.name || "Unknown Course",
      city: course.city || '',
      state: course.state || '',
      country: course.country || 'USA'
    }));
    
    if (courses.length === 0) {
      console.log(`No courses found matching "${query}"`);
    }
    
    return courses;
  } catch (error) {
    console.error('Golf course search error:', error);
    
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Network error - API may be unreachable');
      throw new Error('Unable to connect to the golf course database. Please check your internet connection.');
    }
    
    throw error; // Re-throw the error for the component to handle
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
    course.name.toLowerCase().includes(normalizedQuery) ||
    course.city.toLowerCase().includes(normalizedQuery)
  );
};

/**
 * Get detailed information about a specific golf course
 * @param courseId Course ID
 * @returns Course details including holes and tees
 */
export const getCourseDetails = async (courseId: string): Promise<CourseDetail | null> => {
  try {
    console.log(`Fetching details for course ID: ${courseId}`);
    
    // Check if we're using a mock course ID
    const mockCourse = MOCK_COURSES.find(course => course.id === courseId);
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
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
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
      throw new Error("Invalid API response format");
    }
    
    // Check the response structure
    if (!data.data) {
      console.warn("Unexpected API response format:", data);
      throw new Error("API response missing expected data object");
    }
    
    const course = data.data;
    
    // Map API response to our CourseDetail interface
    const courseDetail: CourseDetail = {
      id: course.id ? course.id.toString() : "",
      name: course.name || "Unknown Course",
      city: course.city || '',
      state: course.state || '',
      country: course.country || 'USA',
      
      // Map tees
      tees: Array.isArray(course.tees) ? course.tees.map((tee: any) => ({
        id: tee.id ? tee.id.toString() : "",
        name: tee.name || "Unknown Tee",
        gender: tee.gender || 'M',
        rating: parseFloat(tee.rating) || 72,
        slope: parseInt(tee.slope) || 113,
        par: parseInt(tee.par) || 72
      })) : [],
      
      // Map holes
      holes: Array.isArray(course.holes) ? course.holes.map((hole: any) => {
        const yards: {[teeId: string]: number} = {};
        
        // Create yards object with each tee's yardage for this hole
        if (Array.isArray(course.tees)) {
          course.tees.forEach((tee: any) => {
            const teeId = tee.id ? tee.id.toString() : "";
            if (hole.teeBoxes && hole.teeBoxes[teeId] !== undefined) {
              yards[teeId] = parseInt(hole.teeBoxes[teeId]) || 0;
            } else {
              yards[teeId] = 0;
            }
          });
        }
        
        return {
          id: hole.number ? hole.number.toString() : "",
          number: parseInt(hole.number) || 0,
          par: parseInt(hole.par) || 4,
          handicap: parseInt(hole.handicap) || 0,
          yards: yards
        };
      }) : []
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
    const mockCourse = MOCK_COURSES.find(course => course.id === courseId);
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
