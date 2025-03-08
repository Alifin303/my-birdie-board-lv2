
import { supabase } from "@/integrations/supabase/client";
import { parseCourseName } from "@/integrations/supabase/client";

class CourseDataService {
  async fetchCoursesByName(searchTerm: string) {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .ilike("name", `%${searchTerm}%`)
      .order("name", { ascending: true });

    return { data, error };
  }

  async fetchCourseById(courseId: number) {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    return { data, error };
  }

  async fetchTeesByCourseId(courseId: number) {
    const { data, error } = await supabase
      .from("course_tees")
      .select("*")
      .eq("course_id", courseId)
      .order("name", { ascending: true });

    return { data, error };
  }

  async searchCourses(searchTerm: string) {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .ilike("name", `%${searchTerm}%`)
      .order("name", { ascending: true });

    return { data, error };
  }
}

export default new CourseDataService();
