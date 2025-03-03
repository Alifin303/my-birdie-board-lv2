
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
export async function findCourseByApiId(apiCourseId: string): Promise<{ id: number } | null> {
  logSupabaseOperation('findCourseByApiId', { apiCourseId });
  
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
  logSupabaseOperation('findCourseByName', { name });
  
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
  logSupabaseOperation('insertCourse', { course });
  
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
      console.log(`No metadata found in localStorage for course ID: ${courseIdStr}`);
      return null;
    }
    
    const parsedDetails = JSON.parse(storedDetails);
    console.log("Loaded course metadata from localStorage:", parsedDetails);
    
    // Ensure each tee has proper hole configuration
    if (parsedDetails.tees) {
      parsedDetails.tees = parsedDetails.tees.map(tee => {
        // Calculate total par if it's not already set
        if (!tee.par && tee.holes && tee.holes.length > 0) {
          tee.par = tee.holes.reduce((sum, hole) => sum + (hole.par || 4), 0);
          console.log(`Calculated par for tee ${tee.name}: ${tee.par}`);
        } else if (!tee.par) {
          tee.par = 72; // Default only if no holes are available
          console.log(`Using default par (72) for tee ${tee.name} as no holes are available`);
        }
        
        // Validate holes data
        if (tee.holes && tee.holes.length > 0) {
          console.log(`Tee ${tee.name} has ${tee.holes.length} holes with par data:`, 
            tee.holes.map(h => ({ number: h.number, par: h.par })));
        } else {
          console.log(`Tee ${tee.name} has no hole data`);
        }
        
        return tee;
      });
    }
    
    return parsedDetails;
  } catch (error) {
    console.error("Error getting course metadata from localStorage:", error);
    return null;
  }
}
