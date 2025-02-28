
import { useState, useEffect } from 'react';
import { supabase, logSupabaseOperation } from '@/integrations/supabase/client';

interface DbCourse {
  id: number;
  name: string;
  city?: string;
  state?: string;
  api_course_id?: string;
  created_at?: string;
  updated_at?: string;
}

export function useCourses() {
  const [courses, setCourses] = useState<DbCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all courses from the database
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      logSupabaseOperation('fetchCourses', data);
      setCourses(data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching courses'));
    } finally {
      setLoading(false);
    }
  };

  // Check if a course exists by name
  const checkCourseExists = async (courseName: string): Promise<DbCourse | null> => {
    try {
      console.log("Checking if course exists:", courseName);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('name', courseName)
        .maybeSingle();

      if (error) {
        console.error("Error checking course existence:", error);
        return null;
      }

      console.log("Course existence check result:", data);
      return data;
    } catch (err) {
      console.error('Error in checkCourseExists:', err);
      return null;
    }
  };

  // Add a new course to the database
  const addCourse = async (
    courseName: string, 
    apiCourseId: string, 
    city?: string, 
    state?: string
  ): Promise<DbCourse | null> => {
    try {
      console.log("Adding new course:", {
        name: courseName,
        api_course_id: apiCourseId,
        city,
        state
      });

      const { data, error } = await supabase
        .from('courses')
        .insert({
          name: courseName,
          api_course_id: apiCourseId,
          city,
          state
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding course:", error);
        return null;
      }

      console.log("New course added:", data);
      
      // Refresh the courses list
      fetchCourses();
      
      return data;
    } catch (err) {
      console.error('Error in addCourse:', err);
      return null;
    }
  };

  // Initialize by fetching courses
  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    error,
    refreshCourses: fetchCourses,
    checkCourseExists,
    addCourse
  };
}
