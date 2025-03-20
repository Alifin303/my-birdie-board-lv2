
// src/components/course-selector/CourseDataService.ts
import { supabase, parseCourseName } from "@/integrations/supabase/client";
import { getCourseTeesByIdFromDatabase } from "@/integrations/supabase/course/course-db-operations";

export async function fetchUserCourses() {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    // Process the courses to include isUserAdded flag
    const processedCourses = data?.map(course => {
      const isUserAdded = course.name.includes('[User added course]');
      let parsedNames = { clubName: "Unknown Club", courseName: "Unknown Course" };
      
      if (course.name) {
        parsedNames = parseCourseName(course.name);
      }
      
      return {
        ...course,
        isUserAdded,
        clubName: parsedNames.clubName,
        courseName: parsedNames.courseName
      };
    }) || [];
    
    return processedCourses;
  } catch (error) {
    console.error('Error fetching user courses:', error);
    return [];
  }
}

export async function getUserCourseTees(courseId: number) {
  try {
    // Get course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
      
    if (courseError) throw courseError;
    
    if (!course) {
      throw new Error(`Course with ID ${courseId} not found`);
    }
    
    // Parse the course name
    let parsedNames = { clubName: "Unknown Club", courseName: "Unknown Course" };
    if (course.name) {
      parsedNames = parseCourseName(course.name);
    }
    
    // Get tees from database first
    const tees = await getCourseTeesByIdFromDatabase(courseId);
    
    if (tees && tees.length > 0) {
      return {
        id: courseId,
        name: course.name,
        clubName: parsedNames.clubName,
        courseName: parsedNames.courseName,
        city: course.city || '',
        state: course.state || '',
        tees: tees,
        isUserAdded: course.name.includes('[User added course]')
      };
    }
    
    // If no tees found in database, try to get from localStorage
    const courseDetailsKey = `course_details_${courseId}`;
    const storedDetails = localStorage.getItem(courseDetailsKey);
    
    if (storedDetails) {
      try {
        const parsedDetails = JSON.parse(storedDetails);
        return {
          id: courseId,
          name: course.name,
          clubName: parsedNames.clubName,
          courseName: parsedNames.courseName,
          city: course.city || '',
          state: course.state || '',
          tees: parsedDetails.tees || [],
          isUserAdded: course.name.includes('[User added course]')
        };
      } catch (error) {
        console.error('Error parsing stored course details:', error);
      }
    }
    
    // If all else fails, return with empty tees
    return {
      id: courseId,
      name: course.name,
      clubName: parsedNames.clubName,
      courseName: parsedNames.courseName,
      city: course.city || '',
      state: course.state || '',
      tees: [],
      isUserAdded: course.name.includes('[User added course]')
    };
  } catch (error) {
    console.error('Error fetching course tees:', error);
    throw error;
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
    
    // Process the search results to include isUserAdded flag
    const processedCourses = data?.map(course => {
      const isUserAdded = course.name.includes('[User added course]');
      let parsedNames = { clubName: "Unknown Club", courseName: "Unknown Course" };
      
      if (course.name) {
        parsedNames = parseCourseName(course.name);
      }
      
      return {
        ...course,
        isUserAdded,
        club_name: parsedNames.clubName, 
        course_name: parsedNames.courseName,
        location: {
          city: course.city || '',
          state: course.state || ''
        }
      };
    }) || [];
    
    return processedCourses;
  } catch (error) {
    console.error('Error searching for courses:', error);
    return [];
  }
}
