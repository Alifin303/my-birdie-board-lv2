import { supabase } from "@/integrations/supabase/client";
import { parseCourseName } from "@/integrations/supabase/client";

export async function searchCourses(query: string) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .ilike('name', `%${query}%`);
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error searching courses:', error);
    return [];
  }
}

export async function getCourseById(courseId: number) {
  if (!courseId) return null;
  
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching course by ID:', error);
    return null;
  }
}

export const getCourseMetadata = async (courseId: number) => {
  try {
    const course = await getCourseById(courseId);

    if (!course) {
      console.log(`Course with id ${courseId} not found`);
      return null;
    }

    const { clubName, courseName } = parseCourseName(course.name);

    return {
      id: course.id,
      name: courseName,
      clubName: clubName,
      city: course.city,
      state: course.state,
    };
  } catch (error) {
    console.error("Error fetching course metadata:", error);
    return null;
  }
};
