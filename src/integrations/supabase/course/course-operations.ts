
import { supabase, findCourseByApiId, findCourseByName, insertCourse, logSupabaseOperation } from '../index';
import { parseCourseName } from '../utils/course-utils';

// This function finds or creates a course by the API course ID
export async function findOrCreateCourseByApiId(
  apiCourseId: string, 
  courseName: string,
  clubName: string,
  city?: string,
  state?: string,
  isSpecialHandling: boolean = false // Flag for Bentley or other special cases
): Promise<number | null> {
  try {
    logSupabaseOperation('findOrCreateCourseByApiId', { apiCourseId, courseName, clubName, city, state });
    
    // Normalize the course name and club name for consistent lookups
    const normalizedCourseName = courseName.replace(/\s+/g, ' ').trim();
    const normalizedClubName = clubName.replace(/\s+/g, ' ').trim();
    
    // Special handling for Bentley Golf Club
    if (isSpecialHandling || 
        normalizedCourseName.toLowerCase().includes('bentley') || 
        normalizedClubName.toLowerCase().includes('bentley')) {
      console.log("Special handling for Bentley Golf Club (or similar)");
      
      // Try to find by API course ID first
      const existingCourseByApiId = await findCourseByApiId(apiCourseId);
      if (existingCourseByApiId) {
        console.log(`Found existing course by API ID: ${existingCourseByApiId.id}, ${existingCourseByApiId.name}`);
        return existingCourseByApiId.id;
      }
      
      // Then try to find by normalized name
      const formattedName = `${normalizedClubName} - ${normalizedCourseName}`;
      const existingCourseByName = await findCourseByName(formattedName);
      if (existingCourseByName) {
        console.log(`Found existing course by name: ${existingCourseByName.id}, ${existingCourseByName.name}`);
        
        // Update the API course ID if it's not set
        if (!existingCourseByName.api_course_id) {
          const { error } = await supabase
            .from('courses')
            .update({ api_course_id: apiCourseId })
            .eq('id', existingCourseByName.id);
            
          if (error) {
            console.error('Error updating API course ID:', error);
          } else {
            console.log(`Updated API course ID for course ${existingCourseByName.id}`);
          }
        }
        
        return existingCourseByName.id;
      }
      
      // If no exact match was found, try a broader search for Bentley
      const { data: bentleyCourses, error: bentleyError } = await supabase
        .from('courses')
        .select('*')
        .or(`name.ilike.%Bentley%,api_course_id.eq.${apiCourseId}`);
        
      if (!bentleyError && bentleyCourses && bentleyCourses.length > 0) {
        // Use the first matching Bentley course
        console.log(`Found Bentley course from similar search: ${bentleyCourses[0].id}, ${bentleyCourses[0].name}`);
        return bentleyCourses[0].id;
      }
    } else {
      // Standard course lookup by API ID
      const existingCourse = await findCourseByApiId(apiCourseId);
      if (existingCourse) {
        console.log(`Found existing course by API ID: ${existingCourse.id}, ${existingCourse.name}`);
        return existingCourse.id;
      }
    }
    
    // No existing course found, create a new one
    console.log(`Creating new course: ${normalizedClubName} - ${normalizedCourseName}`);
    const formattedName = `${normalizedClubName} - ${normalizedCourseName}`;
    
    // Get the current user ID for better course tracking
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    const newCourseId = await insertCourse({
      name: formattedName,
      api_course_id: apiCourseId,
      city: city || '',
      state: state || '',
      user_id: userId || null
    });
    
    return newCourseId;
  } catch (error) {
    console.error('Error in findOrCreateCourseByApiId:', error);
    return null;
  }
}

// This function ensures a course exists in the database
export async function ensureCourseExists(
  courseId: number | string,
  apiCourseId?: string,
  courseName?: string,
  clubName?: string,
  city?: string,
  state?: string,
  isSpecialHandling: boolean = false // Flag for Bentley or other special cases
): Promise<number> {
  try {
    logSupabaseOperation('ensureCourseExists', { courseId, apiCourseId, courseName, clubName, city, state });
    
    // Normalize the course name and club name for consistent lookups
    const normalizedCourseName = courseName?.replace(/\s+/g, ' ').trim() || '';
    const normalizedClubName = clubName?.replace(/\s+/g, ' ').trim() || '';
    
    // Convert string ID to number if needed
    const numericCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;
    
    // Special handling for Bentley Golf Club
    if (isSpecialHandling || 
        normalizedCourseName.toLowerCase().includes('bentley') || 
        normalizedClubName.toLowerCase().includes('bentley')) {
      console.log("Special handling for Bentley Golf Club (or similar)");
      
      // Try to find by API course ID first if provided
      if (apiCourseId) {
        const existingCourseByApiId = await findCourseByApiId(apiCourseId);
        if (existingCourseByApiId) {
          console.log(`Found existing Bentley course by API ID: ${existingCourseByApiId.id}`);
          return existingCourseByApiId.id;
        }
      }
      
      // Try to find by normalized name if provided
      if (normalizedCourseName && normalizedClubName) {
        const formattedName = `${normalizedClubName} - ${normalizedCourseName}`;
        const existingCourseByName = await findCourseByName(formattedName);
        if (existingCourseByName) {
          console.log(`Found existing Bentley course by name: ${existingCourseByName.id}`);
          return existingCourseByName.id;
        }
      }
      
      // If no exact match was found, try a broader search for Bentley
      const { data: bentleyCourses, error: bentleyError } = await supabase
        .from('courses')
        .select('*')
        .or(`name.ilike.%Bentley%${apiCourseId ? `,api_course_id.eq.${apiCourseId}` : ''}`);
        
      if (!bentleyError && bentleyCourses && bentleyCourses.length > 0) {
        // Use the first matching Bentley course
        console.log(`Found Bentley course from similar search: ${bentleyCourses[0].id}`);
        return bentleyCourses[0].id;
      }
    }
    
    // Check if the course exists by ID
    const { data: existingCourse, error: fetchError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', numericCourseId)
      .single();
      
    if (!fetchError && existingCourse) {
      console.log(`Found existing course by ID: ${existingCourse.id}, ${existingCourse.name}`);
      return existingCourse.id;
    }
    
    // If API course ID is provided, try to find by that
    if (apiCourseId) {
      const existingApiCourse = await findCourseByApiId(apiCourseId);
      if (existingApiCourse) {
        console.log(`Found existing course by API ID: ${existingApiCourse.id}, ${existingApiCourse.name}`);
        return existingApiCourse.id;
      }
    }
    
    // If course name and club name are provided, try to find by formatted name
    if (normalizedCourseName && normalizedClubName) {
      const formattedName = `${normalizedClubName} - ${normalizedCourseName}`;
      const existingNameCourse = await findCourseByName(formattedName);
      if (existingNameCourse) {
        console.log(`Found existing course by name: ${existingNameCourse.id}, ${existingNameCourse.name}`);
        return existingNameCourse.id;
      }
    }
    
    // No existing course found, create a new one
    console.log("Creating new course with data:", { 
      courseId: numericCourseId, 
      apiCourseId, 
      courseName: normalizedCourseName, 
      clubName: normalizedClubName 
    });
    
    // Get the current user ID for better course tracking
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    // Format the course name according to our standard format
    let formattedName: string;
    if (normalizedClubName && normalizedCourseName) {
      formattedName = `${normalizedClubName} - ${normalizedCourseName}`;
    } else {
      // Try to parse from the course ID (for user-added courses)
      const existingCourseData = await getCourseMetadataFromLocalStorage(numericCourseId);
      if (existingCourseData && existingCourseData.name) {
        // For user-added courses with [User added course] suffix
        formattedName = existingCourseData.name;
      } else {
        // Fallback to a generic name with the course ID
        formattedName = `Course ID ${numericCourseId}`;
      }
    }
    
    const newCourseId = await insertCourse({
      id: numericCourseId,
      name: formattedName,
      api_course_id: apiCourseId || null,
      city: city || '',
      state: state || '',
      user_id: userId || null
    });
    
    return newCourseId;
  } catch (error) {
    console.error('Error in ensureCourseExists:', error);
    // Fall back to the provided course ID
    return typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;
  }
}

// Helper function to get course metadata from localStorage
async function getCourseMetadataFromLocalStorage(courseId: number): Promise<any> {
  try {
    const courseDetailsKey = `course_details_${courseId}`;
    const storedDetails = localStorage.getItem(courseDetailsKey);
    
    if (storedDetails) {
      return JSON.parse(storedDetails);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting course metadata from localStorage:', error);
    return null;
  }
}
