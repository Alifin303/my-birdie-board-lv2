
import { supabase } from "@/integrations/supabase/client";

export async function fetchUserCourses() {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    // Ensure consistent data format with normalized IDs
    return (data || []).map(course => ({
      ...course,
      id: typeof course.id === 'string' ? parseInt(course.id, 10) : course.id,
      isUserAdded: true
    }));
  } catch (error) {
    console.error('Error fetching user courses:', error);
    return [];
  }
}

export async function getUserCourseTees(courseId: number) {
  try {
    console.log("Getting tees for course ID:", courseId);
    
    // First, get the course details
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
      
    if (courseError) {
      console.error("Error fetching course:", courseError);
      throw courseError;
    }
    
    // Then get the tees
    const { data: teesData, error: teesError } = await supabase
      .from('course_tees')
      .select('*')
      .eq('course_id', courseId);
    
    if (teesError) {
      console.error("Error fetching course tees:", teesError);
      throw teesError;
    }
    
    // Try to get course data from localStorage as fallback
    const metadataKey = `golf_course_${courseId}`;
    const storedMetadata = typeof window !== "undefined" ? localStorage.getItem(metadataKey) : null;
    let localStorageTees = [];
    
    if (storedMetadata) {
      try {
        const parsedData = JSON.parse(storedMetadata);
        localStorageTees = parsedData.tees || [];
        console.log("Found localStorage tees:", localStorageTees);
      } catch (e) {
        console.error("Error parsing localStorage data:", e);
      }
    }
    
    // Combine DB tees and localStorage tees
    const tees = teesData?.length ? teesData : localStorageTees;
    
    return {
      id: courseId, // Ensure ID is a number
      name: courseData.name || `Course ${courseId}`,
      clubName: courseData.name || `Course ${courseId}`,
      city: courseData.city || '',
      state: courseData.state || '',
      isUserAdded: true,
      tees: tees || []
    };
  } catch (error) {
    console.error('Error fetching course tees:', error);
    
    // Fallback to localStorage completely if database fetch fails
    try {
      const metadataKey = `golf_course_${courseId}`;
      const storedMetadata = typeof window !== "undefined" ? localStorage.getItem(metadataKey) : null;
      
      if (storedMetadata) {
        const parsedData = JSON.parse(storedMetadata);
        console.log("Fallback: Using localStorage data for course:", parsedData);
        return {
          id: courseId,
          name: parsedData.name || `Course ${courseId}`,
          clubName: parsedData.clubName || parsedData.name || `Course ${courseId}`,
          city: parsedData.city || '',
          state: parsedData.state || '',
          isUserAdded: true,
          tees: parsedData.tees || []
        };
      }
    } catch (e) {
      console.error("Error with localStorage fallback:", e);
    }
    
    return {
      id: courseId,
      name: `Course ${courseId}`,
      clubName: `Course ${courseId}`,
      isUserAdded: true,
      tees: []
    };
  }
}

export async function searchForCourses(query: string) {
  try {
    // Normalize the search query
    const normalizedQuery = query.trim().toLowerCase();
    
    // Search across name, city, and state fields
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .or(`name.ilike.%${normalizedQuery}%,city.ilike.%${normalizedQuery}%,state.ilike.%${normalizedQuery}%`)
      .limit(50);
    
    if (error) throw error;
    
    // Ensure all retrieved courses have consistent ID format and isUserAdded flag
    return (data || []).map(course => ({
      ...course,
      id: typeof course.id === 'string' ? parseInt(course.id, 10) : course.id,
      isUserAdded: true,
      club_name: course.name.split(' - ')[0] || course.name,
      course_name: course.name.split(' - ')[1] || '',
      location: {
        city: course.city || '',
        state: course.state || '',
        country: 'United States'
      }
    }));
  } catch (error) {
    console.error('Error searching for courses:', error);
    return [];
  }
}
