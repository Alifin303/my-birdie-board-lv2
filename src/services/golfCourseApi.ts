
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
  courseDetailsEndpoint: '/courses',
  headers: {
    'Authorization': 'Key 7GG4N6R5NOXNHW7H5A7EQVGL2U',
    'Content-Type': 'application/json'
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
  try {
    console.log(`Searching for courses with query: ${query}`);
    
    // Log the complete request details for debugging
    const requestUrl = `${API_CONFIG.baseUrl}${API_CONFIG.searchEndpoint}?search=${encodeURIComponent(query)}`;
    console.log('API Request URL:', requestUrl);
    console.log('API Request Headers:', API_CONFIG.headers);
    
    // Original API endpoint with authorization header
    const response = await fetch(
      requestUrl,
      { 
        method: 'GET',
        headers: API_CONFIG.headers,
        // Add a timeout to prevent long waiting times
        signal: AbortSignal.timeout(5000),
        // Explicitly set mode to cors to ensure CORS handling
        mode: 'cors',
        // Don't include credentials
        credentials: 'omit'
      }
    );
    
    // Log the response status and headers for debugging
    console.log('API Response Status:', response.status);
    console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}): ${errorText}`);
      
      // Check if API is down or returning errors
      if (response.status === 404 || response.status === 500) {
        console.log('API is unavailable, falling back to mock data');
        return getMockSearchResults(query);
      }
      
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("API response data:", data);
    
    // Map API response to our GolfCourse interface
    if (!data.data || !Array.isArray(data.data)) {
      console.warn("Unexpected API response format:", data);
      return getMockSearchResults(query);
    }
    
    const courses: GolfCourse[] = data.data.map((course: any) => ({
      id: course.id.toString(),
      name: course.name,
      city: course.city || '',
      state: course.state || '',
      country: course.country || 'USA'
    }));
    
    if (courses.length === 0) {
      console.log('No courses found in API response, falling back to mock data');
      const mockResults = getMockSearchResults(query);
      if (mockResults.length > 0) {
        toast({
          title: "Using Sample Data",
          description: "No courses found in the database. Showing sample courses instead.",
          variant: "default",
        });
        return mockResults;
      }
    }
    
    console.log('Successfully retrieved', courses.length, 'courses from API');
    return courses;
  } catch (error) {
    console.error('Golf course search error:', error);
    
    // Log the specific error type and message for debugging
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Network error - This may be a CORS issue or the API may be unavailable');
    }
    
    // Provide a user-friendly notification
    toast({
      title: "API Connection Issue",
      description: "Unable to connect to the golf course database. Using sample data instead.",
      variant: "destructive",
    });
    
    // Return mock data when API is unavailable
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
    
    const response = await fetch(
      requestUrl,
      { 
        method: 'GET',
        headers: API_CONFIG.headers,
        // Add a timeout to prevent long waiting times
        signal: AbortSignal.timeout(5000),
        // Explicitly set mode to cors to handle CORS properly
        mode: 'cors',
        // Don't include credentials
        credentials: 'omit'
      }
    );
    
    // Log the response status and headers for debugging
    console.log('API Response Status:', response.status);
    console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}): ${errorText}`);
      
      // For any mock course, return generated data
      if (mockCourse) {
        return generateMockCourseDetails(mockCourse);
      }
      
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Course details API response:", data);
    
    // Original API response structure
    if (!data.data) {
      console.warn("Unexpected API response format:", data);
      return null;
    }
    
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
    
    // Find if we have a mock course that matches
    const mockCourse = MOCK_COURSES.find(course => course.id === courseId);
    if (mockCourse) {
      toast({
        title: "Using Sample Data",
        description: "We're using sample course data as the golf course database is currently unavailable.",
        variant: "default",
      });
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
