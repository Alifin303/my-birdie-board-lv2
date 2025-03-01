
import { supabase, parseCourseName } from '@/integrations/supabase/client';
import { searchCourses, GolfCourse } from '@/services/golfCourseApi';

// Get tee data for a user-added course
export const getUserCourseTees = async (courseId: number | string) => {
  console.log(`Loading user-added course from database: ${courseId}`);
  
  try {
    // Get course data from supabase
    const { data: course, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
      
    if (error) {
      throw error;
    }
    
    // Get tee data from localStorage (original approach)
    const courseDetailsKey = `course_details_${courseId}`;
    const storedDetails = localStorage.getItem(courseDetailsKey);
    
    if (storedDetails) {
      try {
        const parsedDetails = JSON.parse(storedDetails);
        console.log("Found stored course details:", parsedDetails);
        
        // Format the course with the tees
        const courseWithTees = {
          ...course,
          clubName: parseCourseName(course.name).clubName,
          tees: parsedDetails.tees || [],
          isUserAdded: true
        };
        
        return courseWithTees;
      } catch (e) {
        console.error("Error parsing stored course details:", e);
      }
    } else {
      console.log(`No course details found in localStorage for course ID: ${courseId}`);
    }
    
    // Create default course details
    console.log("No cached details found for user-added course, creating defaults");
    const defaultTee = {
      id: `tee-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
      name: "White",
      rating: 72,
      slope: 113,
      par: 72,
      gender: "male",
      originalIndex: 0,
      holes: Array.from({ length: 18 }, (_, i) => ({
        number: i + 1,
        par: 4,
        yards: 400,
        handicap: i + 1
      }))
    };
    
    const defaultCourseDetails = {
      id: courseId,
      name: course.name.replace(' [User added course]', ''),
      tees: [defaultTee]
    };
    
    // Save default details to localStorage
    localStorage.setItem(courseDetailsKey, JSON.stringify(defaultCourseDetails));
    console.log("Saved default course details to localStorage");
    
    // Return the course with default tees
    return {
      ...course,
      clubName: parseCourseName(course.name).clubName,
      tees: [defaultTee],
      isUserAdded: true
    };
  } catch (error) {
    console.error("Error loading user-added course:", error);
    throw error;
  }
};

// Fetch user-added courses from database
export const fetchUserCourses = async () => {
  console.log("Fetching user-added courses...");
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('name');
    
  if (error) {
    throw error;
  }
  
  console.log("User-added courses:", data);
  return data || [];
};

// Search for courses in API and database
export const searchForCourses = async (query: string, userCourses: any[]) => {
  if (!query.trim()) {
    return [];
  }
  
  // Search API for courses
  const { results } = await searchCourses(query, false);
  console.log(`Found ${results.length} courses from API`);
  
  // Search user-added courses
  const filteredUserCourses = userCourses.filter(course => 
    course.name.toLowerCase().includes(query.toLowerCase()) ||
    (course.city && course.city.toLowerCase().includes(query.toLowerCase())) ||
    (course.state && course.state.toLowerCase().includes(query.toLowerCase()))
  );
  
  // Combine results, putting user courses first
  const combinedResults = [
    ...filteredUserCourses.map(course => ({
      ...course,
      isUserAdded: true,
      course_name: parseCourseName(course.name).courseName,
      club_name: parseCourseName(course.name).clubName,
      location: {
        city: course.city,
        state: course.state,
        country: course.country || 'United States'
      }
    })),
    ...results
  ];
  
  return combinedResults;
};
