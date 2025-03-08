
// Temporary implementation until the real functionality is available
import { supabase, parseCourseName } from "@/integrations/supabase/client";

// Add missing exports
export async function fetchUserCourses() {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching user courses:', error);
    return [];
  }
}

export async function getUserCourseTees(courseId: number) {
  try {
    const { data, error } = await supabase
      .from('course_tees')
      .select('*')
      .eq('course_id', courseId);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching course tees:', error);
    return [];
  }
}

export async function searchForCourses(query: string) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(50);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error searching for courses:', error);
    return [];
  }
}
