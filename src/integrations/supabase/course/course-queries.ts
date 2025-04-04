
import { supabase } from '../core/client';

/**
 * Fetches a course by its ID
 */
export async function fetchCourseById(courseId: number) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching course by ID:', error);
    return { data: null, error };
  }
}

/**
 * Updates a course to associate it with a user ID
 */
export async function updateCourseWithUserId(courseId: number) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return { data: null, error: new Error('No user session found') };
    
    const { data, error } = await supabase
      .from('courses')
      .update({ user_id: session.user.id })
      .eq('id', courseId)
      .select();
    
    if (error) {
      // If updating with single() fails, just log and continue
      console.error('Error updating course with user ID:', error);
      // Try to fetch the course to confirm it exists and update was attempted
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .maybeSingle();
      
      if (courseData) {
        console.log(`Updated user_id for course ${courseId}`);
        return { data: courseData, error: null };
      }
      
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating course with user ID:', error);
    return { data: null, error };
  }
}

/**
 * Finds a course by its API ID
 */
export async function findCourseByApiId(apiCourseId: string) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('id')
      .eq('api_course_id', apiCourseId)
      .maybeSingle();
    
    if (error) throw error;
    
    return data?.id || null;
  } catch (error) {
    console.error('Error finding course by API ID:', error);
    return null;
  }
}

/**
 * Finds a course by its name
 */
export async function findCourseByName(name: string) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('id')
      .eq('name', name)
      .maybeSingle();
    
    if (error) throw error;
    
    return data?.id || null;
  } catch (error) {
    console.error('Error finding course by name:', error);
    return null;
  }
}

/**
 * Searches for courses by name, city, or state
 */
export async function searchCourses(query: string) {
  try {
    const normalizedQuery = query.trim().toLowerCase();
    
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .or(`name.ilike.%${normalizedQuery}%,city.ilike.%${normalizedQuery}%,state.ilike.%${normalizedQuery}%`)
      .limit(50);
    
    if (error) throw error;
    
    // Map each course to include a flag indicating if it's from the API
    if (data) {
      data.forEach(course => {
        // If the course has an api_course_id, it's from the API
        course.isApiCourse = !!course.api_course_id;
      });
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error searching for courses:', error);
    return { data: null, error };
  }
}

/**
 * Inserts a new course
 */
export async function insertCourse(courseData: {
  name: string;
  api_course_id: string | null;
  city: string;
  state: string;
  user_id: string | null;
}) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .insert(courseData)
      .select('id')
      .single();
    
    if (error) throw error;
    
    return data.id;
  } catch (error) {
    console.error('Error inserting course:', error);
    return null;
  }
}

/**
 * Gets course metadata from localStorage
 */
export function getCourseMetadataFromLocalStorage(courseId: number) {
  try {
    const metadataKey = `golf_course_${courseId}`;
    const storedMetadata = localStorage.getItem(metadataKey);
    
    if (!storedMetadata) return null;
    
    return JSON.parse(storedMetadata);
  } catch (error) {
    console.error('Error retrieving course metadata from localStorage:', error);
    return null;
  }
}
