
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
  }
];

// Search courses function
export async function searchCourses(query: string): Promise<GolfCourse[]> {
  console.log(`Searching for courses with query: ${query}`);
  
  // For development, return filtered mock data
  const normalizedQuery = query.toLowerCase();
  const results = mockCourses.filter(course => {
    return (course.club_name?.toLowerCase().includes(normalizedQuery) || 
           course.course_name?.toLowerCase().includes(normalizedQuery) ||
           course.location?.city?.toLowerCase().includes(normalizedQuery) ||
           course.location?.state?.toLowerCase().includes(normalizedQuery));
  });
  
  console.log(`Found ${results.length} courses matching "${query}"`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return results;
}

// Get course details function
export async function getCourseDetails(courseId: number | string): Promise<CourseDetail> {
  console.log(`Fetching details for course ID: ${courseId}`);
  
  // For development, find the course in mock data
  const course = mockCourses.find(c => c.id.toString() === courseId.toString());
  
  if (!course) {
    console.log(`Course ID ${courseId} not found in mock data`);
    throw new Error(`Course with ID ${courseId} not found`);
  }
  
  console.log(`Found course: ${course.club_name} - ${course.course_name}`);
  
  // Generate mock details for this course
  const courseDetail = generateMockCourseDetails(course);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return courseDetail;
}

// Generate mock course details
export function generateMockCourseDetails(course: GolfCourse): CourseDetail {
  console.log(`Generating mock details for: ${course.club_name} - ${course.course_name}`);
  
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
