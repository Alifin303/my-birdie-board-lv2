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
export const API_CONFIG = {
  // Set to true to use real API instead of mock data - NOW ENABLED BY DEFAULT
  USE_REAL_API: true,
  // The base URL for the golf course API
  API_URL: "https://api.golfcourseapi.com/v1",
  // API key for authentication
  API_KEY: "golf-courses-api-key-2023",
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

// Search courses function - tries live API first, then falls back to mock data
export async function searchCourses(query: string, includeMockData: boolean = false): Promise<{ mockCourses: GolfCourse[], results: GolfCourse[] }> {
  console.log(`Searching for courses with query: ${query}`);
  const normalizedQuery = query.toLowerCase().trim();
  
  // Determine which mock data set to use
  const mockDataSet = API_CONFIG.USE_EXTENDED_MOCK 
    ? [...mockCourses, ...extendedMockCourses] 
    : mockCourses;
  
  let apiResults: GolfCourse[] = [];
  let apiError: Error | null = null;
  
  try {
    // Always attempt to use the live API first
    console.log(`Making live API request to ${API_CONFIG.API_URL}/search`);
    
    // Build query parameters according to the API spec
    const searchParams = new URLSearchParams({
      search_query: normalizedQuery
    });
    
    // Make API request
    const response = await fetch(
      `${API_CONFIG.API_URL}/search?${searchParams.toString()}`,
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
    
    // Process the API response based on its structure as defined in the OpenAPI spec
    if (data.courses && Array.isArray(data.courses)) {
      apiResults = data.courses;
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
        club_name: (course as any).club_name || (course as any).clubName || (course as any).name,
        course_name: (course as any).course_name || (course as any).courseName,
        location: {
          city: (course.location && course.location.city) || (course as any).city,
          state: (course.location && course.location.state) || (course as any).state,
          country: (course.location && course.location.country) || (course as any).country || 'USA',
          address: (course.location && course.location.address) || (course as any).address
        }
      };
      return mappedCourse;
    });
  } catch (error) {
    console.error(`Error calling live golf course API:`, error);
    apiError = error as Error;
    
    // Only fall back to mock data if configured or if live API fails
    if (!API_CONFIG.USE_REAL_API || apiError) {
      console.log(`${apiError ? 'Live API call failed' : 'Mock data configured'}, using mock data as fallback`);
      // Filter mock data based on the search query
      const mockResults = filterCoursesByTerm(mockDataSet, normalizedQuery);
      console.log(`Found ${mockResults.length} courses in mock data matching "${query}"`);
      apiResults = mockResults;
    } else {
      throw new Error(`Failed to search for courses: ${apiError.message}`);
    }
  }
  
  // Simulate API delay only for mock data
  if (!API_CONFIG.USE_REAL_API || apiError) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  if (includeMockData) {
    return { mockCourses: mockDataSet, results: apiResults };
  }
  
  return { mockCourses: [], results: apiResults };
}

// Get course details function
export async function getCourseDetails(courseId: number | string): Promise<CourseDetail> {
  console.log(`Fetching details for course ID: ${courseId}`);
  
  try {
    // Always try to get details from the live API first
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
    console.error(`Error fetching course details from live API:`, error);
    console.log(`Falling back to mock data for course ID ${courseId}`);
    
    // Fall back to mock data if API call fails or if configured to use mock
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
        tee_color: teeBox.teeColor || getDefaultTeeColor(index, isFemale),
        course_rating: teeBox.course_rating || teeBox.courseRating || teeBox.rating || 72,
        slope_rating: teeBox.slope_rating || teeBox.slopeRating || teeBox.slope || 113,
        bogey_rating: teeBox.bogey_rating || teeBox.bogeyRating,
        par_total: teeBox.par_total || teeBox.totalPar || calculateTotalPar(teeBox.holes),
        total_yards: teeBox.total_yards || teeBox.totalYards || calculateTotalYards(teeBox.holes),
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

// Helper to calculate total par from holes array
function calculateTotalPar(holes: any[] | undefined): number {
  if (!holes || !Array.isArray(holes)) return 72;
  return holes.reduce((sum, hole) => sum + (hole.par || 4), 0);
}

// Helper to calculate total yardage from holes array
function calculateTotalYards(holes: any[] | undefined): number {
  if (!holes || !Array.isArray(holes)) return 6500;
  return holes.reduce((sum, hole) => sum + (hole.yardage || hole.yards || 400), 0);
}

// Helper to get default tee color based on index and gender
function getDefaultTeeColor(index: number, isFemale: boolean): string {
  if (isFemale) return 'red';
  
  const maleColors = ['blue', 'white', 'yellow', 'black', 'gold'];
  return maleColors[index % maleColors.length];
}

// Process hole data to match our expected format
function processTeeHoles(holes: any[] | undefined): Array<{ number?: number, par?: number, yardage?: number, handicap?: number }> {
  if (!holes || !Array.isArray(holes)) {
    // Create default holes
    return Array(18).fill(null).map((_, idx) => ({
      number: idx + 1,
      par: 4,
      yardage: 400,
      handicap: idx + 1
    }));
  }
  
  return holes.map((hole, idx) => ({
    number: hole.number || hole.holeNumber || idx + 1,
    par: hole.par || 4,
    yardage: hole.yardage || hole.yards || 400,
    handicap: hole.handicap || hole.hcp || hole.strokeIndex || idx + 1
  }));
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
