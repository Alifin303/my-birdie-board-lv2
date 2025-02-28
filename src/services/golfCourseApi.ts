
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
  };
}

export interface TeeBox {
  tee_name?: string;
  tee_color?: string;
  par_total?: number;
  yards_total?: number;
  total_yards?: number;
  course_rating?: number;
  slope_rating?: number;
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
  };
  holes?: number;
  tees?: {
    male?: TeeBox[];
    female?: TeeBox[];
  };
  features?: string[];
  price_range?: string;
}

// Mock API functions for development
const mockCourses: GolfCourse[] = [
  {
    id: 1,
    club_name: "Pebble Beach Golf Links",
    course_name: "Pebble Beach",
    location: {
      city: "Pebble Beach",
      state: "CA",
      country: "USA"
    }
  },
  {
    id: 2,
    club_name: "St Andrews Links",
    course_name: "Old Course",
    location: {
      city: "St Andrews",
      state: "Fife",
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
      country: "USA"
    }
  },
  {
    id: 1001419,
    club_name: "Bentley Golf Club",
    course_name: "Bentley",
    location: {
      city: "Brentwood",
      state: "Essex",
      country: "United Kingdom"
    }
  },
  {
    id: 1000284,
    club_name: "Risebridge Golf Centre",
    course_name: "Risebridge",
    location: {
      city: "Romford",
      state: "Essex",
      country: "United Kingdom"
    }
  },
  {
    id: 1001285,
    club_name: "The Rayleigh Club",
    course_name: "Rayleigh",
    location: {
      city: "Rayleigh",
      state: "Essex",
      country: "United Kingdom"
    }
  },
  {
    id: 1001286,
    club_name: "Rayleigh Golf Club",
    course_name: "East Course",
    location: {
      city: "Rayleigh",
      state: "Essex",
      country: "United Kingdom"
    }
  },
  {
    id: 1001287,
    club_name: "Rayleigh Golf Range",
    course_name: "Main Course",
    location: {
      city: "Rayleigh",
      state: "Essex", 
      country: "United Kingdom"
    }
  }
];

// List of more extensive mock courses for popular locations
const extendedMockCourses: GolfCourse[] = [
  // Texas courses
  {
    id: 10001,
    club_name: "Dallas Country Club",
    course_name: "Main Course",
    location: {
      city: "Dallas",
      state: "TX",
      country: "USA"
    }
  },
  {
    id: 10002,
    club_name: "Trinity Forest Golf Club",
    course_name: "Championship",
    location: {
      city: "Dallas",
      state: "TX",
      country: "USA"
    }
  },
  {
    id: 10003,
    club_name: "TPC Craig Ranch",
    course_name: "Championship",
    location: {
      city: "McKinney",
      state: "TX",
      country: "USA"
    }
  },
  {
    id: 10004,
    club_name: "Austin Country Club",
    course_name: "ACC",
    location: {
      city: "Austin",
      state: "TX",
      country: "USA"
    }
  },
  // Florida courses
  {
    id: 10005,
    club_name: "TPC Sawgrass",
    course_name: "Players Stadium",
    location: {
      city: "Ponte Vedra Beach",
      state: "FL",
      country: "USA"
    }
  },
  {
    id: 10006,
    club_name: "Bay Hill Club & Lodge",
    course_name: "Championship",
    location: {
      city: "Orlando",
      state: "FL",
      country: "USA"
    }
  },
  // California courses
  {
    id: 10007,
    club_name: "Torrey Pines Golf Course",
    course_name: "South Course",
    location: {
      city: "La Jolla",
      state: "CA",
      country: "USA"
    }
  },
  {
    id: 10008,
    club_name: "Riviera Country Club",
    course_name: "Riviera",
    location: {
      city: "Pacific Palisades",
      state: "CA",
      country: "USA"
    }
  },
  // New York courses
  {
    id: 10009,
    club_name: "Bethpage State Park",
    course_name: "Black Course",
    location: {
      city: "Farmingdale",
      state: "NY",
      country: "USA"
    }
  },
  {
    id: 10010,
    club_name: "Shinnecock Hills Golf Club",
    course_name: "Shinnecock Hills",
    location: {
      city: "Southampton",
      state: "NY",
      country: "USA"
    }
  }
];

// Configuration for API options
const API_CONFIG = {
  // Set to true to use real API instead of mock data
  USE_REAL_API: false,
  // The base URL for the golf course API
  API_URL: "https://api.golfcourseapi.com/v1",
  // API key for authentication
  API_KEY: "YOUR_API_KEY_HERE",
  // Toggle extended mock data for testing
  USE_EXTENDED_MOCK: true
};

// Helper function to check if a string includes a substring case-insensitively
const includesToLowerCase = (source: string | undefined, searchTerm: string): boolean => {
  if (!source) return false;
  return source.toLowerCase().includes(searchTerm);
};

// Helper to filter courses based on search term
const filterCoursesByTerm = (courses: GolfCourse[], normalizedQuery: string): GolfCourse[] => {
  return courses.filter(course => {
    const clubNameMatch = includesToLowerCase(course.club_name, normalizedQuery);
    const courseNameMatch = includesToLowerCase(course.course_name, normalizedQuery);
    const cityMatch = includesToLowerCase(course.location?.city, normalizedQuery);
    const stateMatch = includesToLowerCase(course.location?.state, normalizedQuery);
    const countryMatch = includesToLowerCase(course.location?.country, normalizedQuery);
    
    // Also match against full formatted name to catch partial phrases
    const fullNameLower = `${course.club_name || ''} ${course.course_name || ''}`.toLowerCase();
    const fullNameMatch = fullNameLower.includes(normalizedQuery);
    
    return clubNameMatch || courseNameMatch || cityMatch || stateMatch || countryMatch || fullNameMatch;
  });
};

// Search courses function - now tries live API first, then falls back to mock data
export async function searchCourses(query: string, includeMockData: boolean = false): Promise<{ mockCourses: GolfCourse[], results: GolfCourse[] }> {
  console.log(`Searching for courses with query: ${query}`);
  const normalizedQuery = query.toLowerCase().trim();
  
  // Determine which mock data set to use
  const mockDataSet = API_CONFIG.USE_EXTENDED_MOCK 
    ? [...mockCourses, ...extendedMockCourses] 
    : mockCourses;
  
  let apiResults: GolfCourse[] = [];
  let apiError: Error | null = null;
  
  // Only attempt real API call if configured to do so
  if (API_CONFIG.USE_REAL_API) {
    try {
      console.log(`Making live API request to ${API_CONFIG.API_URL}/search`);
      
      // Build query parameters
      const searchParams = new URLSearchParams({
        search_query: normalizedQuery
      });
      
      // Make API request
      const response = await fetch(
        `${API_CONFIG.API_URL}/search?${searchParams}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Key ${API_CONFIG.API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors',
          signal: AbortSignal.timeout(10000) // 10 second timeout
        }
      );
      
      console.log(`API response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`API returned error status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`API response data:`, data);
      
      // Assuming the API returns a courses array in the response
      if (data.courses && Array.isArray(data.courses)) {
        apiResults = data.courses;
        console.log(`Found ${apiResults.length} courses from live API`);
      } else {
        throw new Error('API response format did not match expected structure');
      }
    } catch (error) {
      console.error(`Error calling golf course API:`, error);
      apiError = error as Error;
    }
  }
  
  // Process the results - use API results if available, otherwise filter mock data
  let results: GolfCourse[];
  
  if (apiResults.length > 0) {
    // We have API results, use those
    results = apiResults;
    console.log(`Using ${results.length} results from live API`);
  } else {
    // Either API call failed or we're configured to use mock data
    if (apiError) {
      console.log(`API call failed: ${apiError.message}, falling back to mock data`);
    } else if (!API_CONFIG.USE_REAL_API) {
      console.log(`Using mock data (API calls disabled in config)`);
    }
    
    // Filter mock data based on the search query
    results = filterCoursesByTerm(mockDataSet, normalizedQuery);
    console.log(`Found ${results.length} courses in mock data matching "${query}"`);
  }
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (includeMockData) {
    return { mockCourses: mockDataSet, results };
  }
  
  return { mockCourses: [], results };
}

// Get course details function
export async function getCourseDetails(courseId: number | string): Promise<CourseDetail> {
  console.log(`Fetching details for course ID: ${courseId}`);
  
  if (API_CONFIG.USE_REAL_API) {
    try {
      console.log(`Making live API request to ${API_CONFIG.API_URL}/courses/${courseId}`);
      
      // Make API request for course details
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
          signal: AbortSignal.timeout(10000) // 10 second timeout
        }
      );
      
      console.log(`API response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`API returned error status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`API response data:`, data);
      
      return data;
    } catch (error) {
      console.error(`Error fetching course details from API:`, error);
      console.log(`Falling back to mock data for course ID ${courseId}`);
      // Fall back to mock data if API call fails
    }
  }
  
  // For development or API fallback, find the course in mock data
  const allMockCourses = API_CONFIG.USE_EXTENDED_MOCK 
    ? [...mockCourses, ...extendedMockCourses] 
    : mockCourses;
  
  const course = allMockCourses.find(c => c.id.toString() === courseId.toString());
  
  if (!course) {
    console.log(`Course ID ${courseId} not found in mock data`);
    throw new Error(`Course with ID ${courseId} not found`);
  }
  
  console.log(`Found course in mock data: ${course.club_name} - ${course.course_name}`);
  
  // Generate mock details for this course
  const courseDetail = generateMockCourseDetails(course);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return courseDetail;
}

// Generate mock course details
export function generateMockCourseDetails(course: GolfCourse): CourseDetail {
  console.log(`Generating mock details for: ${course.club_name} - ${course.course_name}`);
  
  // Special case for Risebridge to include different pars across tees
  if (course.id.toString() === "1000284") {
    // Generate different tee boxes with specific par variations for hole 2
    const maleTees: TeeBox[] = [
      {
        tee_name: "White",
        tee_color: "white",
        par_total: 72,
        yards_total: 6800,
        course_rating: 72.1,
        slope_rating: 131,
        holes: Array(18).fill(null).map((_, idx) => {
          // Hole 2 is par 5 for white tees
          if (idx === 1) {  // idx 1 is hole 2
            return {
              number: idx + 1,
              par: 5,
              yardage: 520,
              handicap: 4
            };
          }
          return {
            number: idx + 1,
            par: idx % 9 === 0 || idx % 9 === 8 ? 5 : (idx % 9 === 2 || idx % 9 === 6) ? 3 : 4,
            yardage: idx % 9 === 0 || idx % 9 === 8 ? 525 + Math.floor(Math.random() * 50) : 
                     (idx % 9 === 2 || idx % 9 === 6) ? 170 + Math.floor(Math.random() * 30) : 
                     400 + Math.floor(Math.random() * 50),
            handicap: (idx % 2 === 0) ? idx + 1 : 18 - idx
          };
        })
      },
      {
        tee_name: "Yellow",
        tee_color: "yellow",
        par_total: 72,
        yards_total: 6500,
        course_rating: 71.3,
        slope_rating: 128,
        holes: Array(18).fill(null).map((_, idx) => {
          // Hole 2 is also par 5 for yellow tees
          if (idx === 1) {  // idx 1 is hole 2
            return {
              number: idx + 1,
              par: 5,
              yardage: 500,
              handicap: 4
            };
          }
          return {
            number: idx + 1,
            par: idx % 9 === 0 || idx % 9 === 8 ? 5 : (idx % 9 === 2 || idx % 9 === 6) ? 3 : 4,
            yardage: idx % 9 === 0 || idx % 9 === 8 ? 505 + Math.floor(Math.random() * 50) : 
                     (idx % 9 === 2 || idx % 9 === 6) ? 160 + Math.floor(Math.random() * 30) : 
                     380 + Math.floor(Math.random() * 50),
            handicap: (idx % 2 === 0) ? idx + 1 : 18 - idx
          };
        })
      }
    ];
    
    const femaleTees: TeeBox[] = [
      {
        tee_name: "Red",
        tee_color: "red",
        par_total: 71,  // Different total par for red tees
        yards_total: 5800,
        course_rating: 73.1,
        slope_rating: 125,
        holes: Array(18).fill(null).map((_, idx) => {
          // Hole 2 is par 4 for red tees
          if (idx === 1) {  // idx 1 is hole 2
            return {
              number: idx + 1,
              par: 4,  // Different par!
              yardage: 380,
              handicap: 4
            };
          }
          return {
            number: idx + 1,
            par: idx % 9 === 0 || idx % 9 === 8 ? 5 : (idx % 9 === 2 || idx % 9 === 6) ? 3 : 4,
            yardage: idx % 9 === 0 || idx % 9 === 8 ? 450 + Math.floor(Math.random() * 30) : 
                     (idx % 9 === 2 || idx % 9 === 6) ? 140 + Math.floor(Math.random() * 20) : 
                     340 + Math.floor(Math.random() * 40),
            handicap: (idx % 2 === 0) ? idx + 1 : 18 - idx
          };
        })
      }
    ];
    
    return {
      id: course.id,
      club_name: course.club_name,
      course_name: course.course_name,
      description: `${course.club_name} is a beautiful golf course located in ${course.location?.city}, ${course.location?.state}.`,
      website: "https://www.risebridge.co.uk",
      location: course.location,
      holes: 18,
      tees: {
        male: maleTees,
        female: femaleTees
      },
      features: ["Pro Shop", "Restaurant", "Driving Range", "Putting Green"],
      price_range: "$$"
    };
  }
  
  // Special case for Bentley Golf Club
  if (course.id.toString() === "1001419") {
    // Generate different tee boxes with specific variations
    const maleTees: TeeBox[] = [
      {
        tee_name: "White",
        tee_color: "white",
        par_total: 72,
        yards_total: 6925,
        course_rating: 72.3,
        slope_rating: 133,
        holes: Array(18).fill(null).map((_, idx) => {
          return {
            number: idx + 1,
            par: idx % 9 === 0 || idx % 9 === 8 ? 5 : (idx % 9 === 2 || idx % 9 === 6) ? 3 : 4,
            yardage: idx % 9 === 0 || idx % 9 === 8 ? 545 + Math.floor(Math.random() * 50) : 
                     (idx % 9 === 2 || idx % 9 === 6) ? 180 + Math.floor(Math.random() * 30) : 
                     415 + Math.floor(Math.random() * 50),
            handicap: (idx % 2 === 0) ? idx + 1 : 18 - idx
          };
        })
      },
      {
        tee_name: "Yellow",
        tee_color: "yellow",
        par_total: 72,
        yards_total: 6723,
        course_rating: 71.6,
        slope_rating: 129,
        holes: Array(18).fill(null).map((_, idx) => {
          return {
            number: idx + 1,
            par: idx % 9 === 0 || idx % 9 === 8 ? 5 : (idx % 9 === 2 || idx % 9 === 6) ? 3 : 4,
            yardage: idx % 9 === 0 || idx % 9 === 8 ? 525 + Math.floor(Math.random() * 50) : 
                     (idx % 9 === 2 || idx % 9 === 6) ? 170 + Math.floor(Math.random() * 30) : 
                     395 + Math.floor(Math.random() * 50),
            handicap: (idx % 2 === 0) ? idx + 1 : 18 - idx
          };
        })
      }
    ];
    
    const femaleTees: TeeBox[] = [
      {
        tee_name: "Red",
        tee_color: "red",
        par_total: 73,  // Different total par
        yards_total: 5955,
        course_rating: 74.2,
        slope_rating: 127,
        holes: Array(18).fill(null).map((_, idx) => {
          return {
            number: idx + 1,
            par: idx === 3 ? 5 : // Make hole 4 a par 5 for red tees
                 idx % 9 === 0 || idx % 9 === 8 ? 5 : 
                 (idx % 9 === 2 || idx % 9 === 6) ? 3 : 4,
            yardage: idx % 9 === 0 || idx % 9 === 8 ? 460 + Math.floor(Math.random() * 30) : 
                     (idx % 9 === 2 || idx % 9 === 6) ? 150 + Math.floor(Math.random() * 20) : 
                     350 + Math.floor(Math.random() * 40),
            handicap: (idx % 2 === 0) ? idx + 1 : 18 - idx
          };
        })
      }
    ];
    
    return {
      id: course.id,
      club_name: course.club_name,
      course_name: course.course_name,
      description: `${course.club_name} is a beautiful golf course located in ${course.location?.city}, ${course.location?.state}.`,
      website: "https://www.bentleygolfclub.co.uk",
      location: course.location,
      holes: 18,
      tees: {
        male: maleTees,
        female: femaleTees
      },
      features: ["Pro Shop", "Restaurant", "Driving Range", "Putting Green", "Practice Area"],
      price_range: "$$$"
    };
  }
  
  // Special case for The Rayleigh Club and other Rayleigh courses
  if (course.id.toString() === "1001285" || 
      course.id.toString() === "1001286" || 
      course.id.toString() === "1001287") {
    
    // Generate different tee boxes for Rayleigh courses
    const maleTees: TeeBox[] = [
      {
        tee_name: "White",
        tee_color: "white",
        par_total: 72,
        yards_total: 6800,
        course_rating: 72.1,
        slope_rating: 131,
        holes: Array(18).fill(null).map((_, idx) => {
          return {
            number: idx + 1,
            par: idx % 9 === 0 || idx % 9 === 8 ? 5 : (idx % 9 === 2 || idx % 9 === 6) ? 3 : 4,
            yardage: idx % 9 === 0 || idx % 9 === 8 ? 525 + Math.floor(Math.random() * 50) : 
                     (idx % 9 === 2 || idx % 9 === 6) ? 170 + Math.floor(Math.random() * 30) : 
                     400 + Math.floor(Math.random() * 50),
            handicap: (idx % 2 === 0) ? idx + 1 : 18 - idx
          };
        })
      },
      {
        tee_name: "Yellow",
        tee_color: "yellow",
        par_total: 72,
        yards_total: 6500,
        course_rating: 71.3,
        slope_rating: 128,
        holes: Array(18).fill(null).map((_, idx) => {
          return {
            number: idx + 1,
            par: idx % 9 === 0 || idx % 9 === 8 ? 5 : (idx % 9 === 2 || idx % 9 === 6) ? 3 : 4,
            yardage: idx % 9 === 0 || idx % 9 === 8 ? 505 + Math.floor(Math.random() * 50) : 
                     (idx % 9 === 2 || idx % 9 === 6) ? 160 + Math.floor(Math.random() * 30) : 
                     380 + Math.floor(Math.random() * 50),
            handicap: (idx % 2 === 0) ? idx + 1 : 18 - idx
          };
        })
      }
    ];
    
    const femaleTees: TeeBox[] = [
      {
        tee_name: "Red",
        tee_color: "red",
        par_total: 73,
        yards_total: 5900,
        course_rating: 73.1,
        slope_rating: 125,
        holes: Array(18).fill(null).map((_, idx) => {
          return {
            number: idx + 1,
            par: idx % 9 === 0 || idx % 9 === 8 ? 5 : (idx % 9 === 2 || idx % 9 === 6) ? 3 : 4,
            yardage: idx % 9 === 0 || idx % 9 === 8 ? 450 + Math.floor(Math.random() * 30) : 
                     (idx % 9 === 2 || idx % 9 === 6) ? 140 + Math.floor(Math.random() * 20) : 
                     340 + Math.floor(Math.random() * 40),
            handicap: (idx % 2 === 0) ? idx + 1 : 18 - idx
          };
        })
      }
    ];
    
    // Create website based on club name
    let website = "https://www.";
    if (course.club_name?.toLowerCase().includes("rayleigh")) {
      website += "rayleighclub.co.uk";
    } else {
      website += "golfcourse.co.uk";
    }
    
    return {
      id: course.id,
      club_name: course.club_name,
      course_name: course.course_name,
      description: `${course.club_name} is a beautiful golf course located in ${course.location?.city}, ${course.location?.state}.`,
      website: website,
      location: course.location,
      holes: 18,
      tees: {
        male: maleTees,
        female: femaleTees
      },
      features: ["Pro Shop", "Restaurant", "Driving Range", "Putting Green"],
      price_range: "£££"
    };
  }
  
  // Handle Dallas and other major cities' courses
  if (course.location?.city === "Dallas" || 
      course.location?.city === "Austin" || 
      course.location?.state === "TX") {
      
    // Generate Texas course tees
    const maleTees: TeeBox[] = [
      {
        tee_name: "Championship",
        tee_color: "black",
        par_total: 72,
        yards_total: 7100,
        course_rating: 74.5,
        slope_rating: 138,
        holes: Array(18).fill(null).map((_, idx) => {
          return {
            number: idx + 1,
            par: idx === 1 || idx === 7 || idx === 12 || idx === 15 ? 3 : 
                 idx === 5 || idx === 9 || idx === 14 || idx === 18 ? 5 : 4,
            yardage: idx === 1 || idx === 7 || idx === 12 || idx === 15 ? 180 + Math.floor(Math.random() * 40) : 
                     idx === 5 || idx === 9 || idx === 14 || idx === 18 ? 540 + Math.floor(Math.random() * 60) :
                     400 + Math.floor(Math.random() * 70),
            handicap: (idx * 3) % 18 + 1
          };
        })
      },
      {
        tee_name: "Blue",
        tee_color: "blue",
        par_total: 72,
        yards_total: 6700,
        course_rating: 72.8,
        slope_rating: 132,
        holes: Array(18).fill(null).map((_, idx) => {
          return {
            number: idx + 1,
            par: idx === 1 || idx === 7 || idx === 12 || idx === 15 ? 3 : 
                 idx === 5 || idx === 9 || idx === 14 || idx === 18 ? 5 : 4,
            yardage: idx === 1 || idx === 7 || idx === 12 || idx === 15 ? 160 + Math.floor(Math.random() * 40) : 
                     idx === 5 || idx === 9 || idx === 14 || idx === 18 ? 510 + Math.floor(Math.random() * 50) :
                     380 + Math.floor(Math.random() * 60),
            handicap: (idx * 3) % 18 + 1
          };
        })
      }
    ];
      
    const femaleTees: TeeBox[] = [
      {
        tee_name: "Gold",
        tee_color: "gold",
        par_total: 72,
        yards_total: 5800,
        course_rating: 73.4,
        slope_rating: 126,
        holes: Array(18).fill(null).map((_, idx) => {
          return {
            number: idx + 1,
            par: idx === 1 || idx === 7 || idx === 12 || idx === 15 ? 3 : 
                 idx === 5 || idx === 9 || idx === 14 || idx === 18 ? 5 : 4,
            yardage: idx === 1 || idx === 7 || idx === 12 || idx === 15 ? 140 + Math.floor(Math.random() * 30) : 
                     idx === 5 || idx === 9 || idx === 14 || idx === 18 ? 450 + Math.floor(Math.random() * 40) :
                     330 + Math.floor(Math.random() * 50),
            handicap: (idx * 3) % 18 + 1
          };
        })
      }
    ];
      
    const features = ["Pro Shop", "Restaurant", "Driving Range", "Putting Green", "Private Club", "Golf Carts"];
    
    if (course.location.city === "Dallas") {
      features.push("Lake Views", "Downtown Skyline Views");
    } else if (course.location.city === "Austin") {
      features.push("Hill Country Views", "Lake Access");
    }
      
    return {
      id: course.id,
      club_name: course.club_name,
      course_name: course.course_name,
      description: `${course.club_name} is a premier golf destination located in beautiful ${course.location.city}, ${course.location.state}.`,
      website: `https://www.${course.club_name?.toLowerCase().replace(/\s+/g, '')}golf.com`,
      location: course.location,
      holes: 18,
      tees: {
        male: maleTees,
        female: femaleTees
      },
      features: features,
      price_range: "$$$"
    };
  }
  
  // Standard mock data for other courses
  // Generate different tee boxes
  const maleTees: TeeBox[] = [
    generateMockTeeBox("Black", "black", 74, 7500),
    generateMockTeeBox("Blue", "blue", 72, 6800),
    generateMockTeeBox("White", "white", 70, 6200)
  ];
  
  const femaleTees: TeeBox[] = [
    generateMockTeeBox("Red", "red", 73, 5800),
    generateMockTeeBox("Gold", "gold", 71, 5400)
  ];
  
  return {
    id: course.id,
    club_name: course.club_name,
    course_name: course.course_name,
    description: `${course.club_name} is a beautiful golf course located in ${course.location?.city}, ${course.location?.state}.`,
    website: "https://www.example.com",
    location: course.location,
    holes: 18,
    tees: {
      male: maleTees,
      female: femaleTees
    },
    features: ["Pro Shop", "Restaurant", "Driving Range", "Putting Green"],
    price_range: "$$$"
  };
}

// Generate a mock tee box with random hole data
function generateMockTeeBox(name: string, color: string, par: number, totalYards: number): TeeBox {
  const holeCount = 18;
  const frontNineYards = Math.round(totalYards * 0.45);
  const backNineYards = totalYards - frontNineYards;
  
  // Generate hole data
  const holes = [];
  const parValues = [3, 4, 4, 5, 4, 3, 4, 5, 4]; // Common par distribution for 9 holes
  
  for (let i = 0; i < holeCount; i++) {
    const holeNumber = i + 1;
    const parIndex = i % 9;
    const holePar = parValues[parIndex];
    
    // Calculate yardage based on par and some randomness
    let baseYardage;
    switch (holePar) {
      case 3: baseYardage = 150 + Math.random() * 50; break;
      case 4: baseYardage = 350 + Math.random() * 100; break;
      case 5: baseYardage = 500 + Math.random() * 100; break;
      default: baseYardage = 350;
    }
    
    // Adjust yardage based on total yards to maintain proportion
    const adjustedYardage = Math.round(baseYardage * (totalYards / 6500));
    
    // Random handicap (stroke index)
    let handicap = i < 9 ? (i * 2) + 1 : (i - 9) * 2 + 2;
    if (handicap > 18) handicap = handicap - 18;
    
    holes.push({
      number: holeNumber,
      par: holePar,
      yardage: adjustedYardage,
      handicap: handicap
    });
  }
  
  const calculatedYardsTotal = holes.reduce((sum, hole) => sum + (hole.yardage || 0), 0);
  
  return {
    tee_name: name,
    tee_color: color,
    par_total: par,
    yards_total: totalYards,
    total_yards: calculatedYardsTotal,
    course_rating: Math.round((totalYards / 113) * 10) / 10,
    slope_rating: Math.round(113 + (totalYards - 6000) / 100),
    front_nine_yards: frontNineYards,
    back_nine_yards: backNineYards,
    holes: holes
  };
}
