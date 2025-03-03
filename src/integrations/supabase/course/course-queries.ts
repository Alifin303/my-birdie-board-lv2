import { supabase, logSupabaseOperation } from '../core/client';

// Helper function to fetch a course by ID
export async function fetchCourseById(courseId: number): Promise<any> {
  logSupabaseOperation('fetchCourseById', { courseId });
  
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();
  
  if (error) {
    console.error("Error fetching course by ID:", error);
    throw error;
  }
  
  console.log("Fetched course data:", data);
  return data;
}

// Helper function to find a course by API ID
export async function findCourseByApiId(apiCourseId: string): Promise<any> {
  logSupabaseOperation('findCourseByApiId', { apiCourseId });
  
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('api_course_id', apiCourseId)
    .maybeSingle();
    
  if (error) {
    console.error("Error finding course by API ID:", error);
    return null;
  }
  
  return data;
}

// Helper function to find a course by name
export async function findCourseByName(name: string): Promise<any> {
  logSupabaseOperation('findCourseByName', { name });
  
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('name', name)
    .maybeSingle();
    
  if (error) {
    console.error("Error finding course by name:", error);
    return null;
  }
  
  return data;
}

// Helper function to insert a course
export async function insertCourse(course: {
  name: string;
  city?: string;
  state?: string;
  api_course_id?: string | null;
  user_id?: string | null;
}): Promise<number> {
  logSupabaseOperation('insertCourse', { course });
  
  const { data, error } = await supabase
    .from('courses')
    .insert([course])
    .select('id')
    .single();
    
  if (error) {
    console.error("Error inserting course:", error);
    return 0; // Return invalid ID on error
  }
  
  return data.id;
}

// Helper function to get course metadata from localStorage
export function getCourseMetadataFromLocalStorage(courseId: number | string): any {
  try {
    // Normalize courseId to string for consistent key lookup
    const courseIdStr = courseId.toString();
    
    // Try different possible storage keys
    const courseDetailsKey = `course_details_${courseIdStr}`;
    const courseMetadataKey = `course_metadata_${courseIdStr}`;
    const legacyKey = `course-${courseIdStr}`;
    
    // Log all matching keys in localStorage for debugging
    console.log("Checking localStorage keys for course ID:", courseIdStr);
    const matchingKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes(courseIdStr) || key.includes('course'))) {
        matchingKeys.push(key);
      }
    }
    console.log("Matching localStorage keys:", matchingKeys);
    
    // Get stored details, trying all possible key formats
    const storedDetails = localStorage.getItem(courseDetailsKey) || 
                         localStorage.getItem(courseMetadataKey) ||
                         localStorage.getItem(legacyKey);
    
    if (!storedDetails) {
      console.log(`No metadata found in localStorage for course ID: ${courseIdStr}`);
      return null;
    }
    
    let parsedDetails;
    try {
      parsedDetails = JSON.parse(storedDetails);
      console.log("Successfully parsed course metadata from localStorage:", parsedDetails);
    } catch (parseError) {
      console.error("Error parsing course metadata JSON:", parseError);
      return null;
    }
    
    // Validate the parsed data has minimum required fields
    if (!parsedDetails) {
      console.error("Invalid course data: empty object after parsing");
      return null;
    }
    
    if (!parsedDetails.name) {
      console.warn("Course data missing name property, may be incomplete:", parsedDetails);
    }
    
    // Ensure each tee has proper hole configuration
    if (parsedDetails.tees && Array.isArray(parsedDetails.tees)) {
      console.log(`Processing ${parsedDetails.tees.length} tees for course`);
      
      parsedDetails.tees = parsedDetails.tees.map(tee => {
        if (!tee) {
          console.error("Null or undefined tee found in course data");
          return null;
        }
        
        console.log(`Processing tee: ${tee.name} (ID: ${tee.id})`);
        
        // Validate tee has holes data
        if (!tee.holes || !Array.isArray(tee.holes) || tee.holes.length === 0) {
          console.warn(`Tee ${tee.name} has no hole data. Using default holes.`);
          // Create default holes if none exist
          tee.holes = Array(18).fill(null).map((_, idx) => ({
            number: idx + 1,
            par: 4,
            yards: 400,
            handicap: idx + 1
          }));
        } else {
          console.log(`Tee ${tee.name} has ${tee.holes.length} holes with par data:`, 
            tee.holes.map(h => ({ number: h.number, par: h.par })));
        }
        
        // Calculate total par from hole data
        const calculatedPar = tee.holes.reduce((sum, hole) => sum + (hole.par || 4), 0);
        console.log(`Calculated par for tee ${tee.name}: ${calculatedPar}`);
        
        // Update tee with calculated par
        tee.par = calculatedPar;
        
        // Ensure all required tee properties exist
        tee.rating = tee.rating || 72.0;
        tee.slope = tee.slope || 113;
        tee.gender = tee.gender || 'male';
        
        return tee;
      }).filter(Boolean); // Remove any null tees
    } else {
      console.warn("No tees array found in course data:", parsedDetails);
      
      // Create default tee if none exists
      const defaultHoles = Array(18).fill(null).map((_, idx) => ({
        number: idx + 1,
        par: 4,
        yards: 400,
        handicap: idx + 1
      }));
      
      const defaultTeeId = `tee-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      parsedDetails.tees = [{
        id: defaultTeeId,
        name: 'White',
        rating: 72,
        slope: 113,
        par: 72,
        gender: 'male' as const,
        originalIndex: 0,
        holes: defaultHoles
      }];
      
      parsedDetails.holes = defaultHoles;
      console.log("Created default tee for course:", parsedDetails.tees[0]);
      
      // Update localStorage with the fixed data
      try {
        localStorage.setItem(courseDetailsKey, JSON.stringify(parsedDetails));
        console.log("Updated course details in localStorage with default tee");
      } catch (e) {
        console.error("Error saving fixed course data to localStorage:", e);
      }
    }
    
    // Ensure course has the holes array at the top level too
    if (!parsedDetails.holes || !Array.isArray(parsedDetails.holes)) {
      console.log("Setting course-level holes from first tee");
      if (parsedDetails.tees && parsedDetails.tees.length > 0 && parsedDetails.tees[0].holes) {
        parsedDetails.holes = parsedDetails.tees[0].holes;
      } else {
        console.warn("No tee holes found, creating default course holes");
        parsedDetails.holes = Array(18).fill(null).map((_, idx) => ({
          number: idx + 1,
          par: 4,
          yards: 400,
          handicap: idx + 1
        }));
      }
    }
    
    return parsedDetails;
  } catch (error) {
    console.error("Error getting course metadata from localStorage:", error);
    return null;
  }
}

// Helper function to update a course with the current user's ID
export async function updateCourseWithUserId(courseId: number): Promise<boolean> {
  logSupabaseOperation('updateCourseWithUserId', { courseId });
  
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session || !session.session || !session.session.user) {
      console.log("No authenticated user found when trying to update course user_id");
      return false;
    }
    
    const userId = session.session.user.id;
    console.log(`Updating course ${courseId} with user_id ${userId}`);
    
    const { data, error } = await supabase
      .from('courses')
      .update({ user_id: userId })
      .eq('id', courseId)
      .is('user_id', null); // Only update if user_id is null
      
    if (error) {
      console.error("Error updating course with user_id:", error);
      return false;
    }
    
    console.log("Course user_id update result:", data);
    return true;
  } catch (error) {
    console.error("Exception updating course with user_id:", error);
    return false;
  }
}
