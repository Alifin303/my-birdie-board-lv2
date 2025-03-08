
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
export async function updateCourseWithUserId(courseId: number, userId: string) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .update({ user_id: userId })
      .eq('id', courseId)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating course with user ID:', error);
    return { data: null, error };
  }
}
