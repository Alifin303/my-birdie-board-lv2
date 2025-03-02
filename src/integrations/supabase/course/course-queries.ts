
import { supabase } from '../core/client';

// Helper function to fetch a course by ID
export async function fetchCourseById(courseId: number): Promise<any> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();
  
  if (error) {
    console.error("Error fetching course by ID:", error);
    throw error;
  }
  
  return data;
}

// Helper function to find a course by API ID
export async function findCourseByApiId(apiCourseId: string): Promise<{ id: number } | null> {
  const { data, error } = await supabase
    .from('courses')
    .select('id')
    .eq('api_course_id', apiCourseId)
    .maybeSingle();
    
  if (error) {
    console.error("Error finding course by API ID:", error);
    return null;
  }
  
  return data;
}

// Helper function to find a course by name
export async function findCourseByName(name: string): Promise<{ id: number } | null> {
  const { data, error } = await supabase
    .from('courses')
    .select('id')
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
  api_course_id?: string;
}): Promise<{ id: number } | null> {
  const { data, error } = await supabase
    .from('courses')
    .insert([course])
    .select('id')
    .single();
    
  if (error) {
    console.error("Error inserting course:", error);
    return null;
  }
  
  return data;
}

// Helper function to get course metadata from localStorage
export function getCourseMetadataFromLocalStorage(courseId: number | string): any {
  try {
    // Normalize courseId to string for consistent key lookup
    const courseIdStr = courseId.toString();
    
    // Try different possible storage keys
    const courseDetailsKey = `course_details_${courseIdStr}`;
    const courseMetadataKey = `course_metadata_${courseIdStr}`;
    
    // Get stored details
    const storedDetails = localStorage.getItem(courseDetailsKey) || localStorage.getItem(courseMetadataKey);
    
    if (!storedDetails) {
      return null;
    }
    
    return JSON.parse(storedDetails);
  } catch (error) {
    console.error("Error getting course metadata from localStorage:", error);
    return null;
  }
}
