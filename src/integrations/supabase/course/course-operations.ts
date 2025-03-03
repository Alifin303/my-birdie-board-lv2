
import { formatCourseName } from '../utils/course-utils';
import { findCourseByApiId, findCourseByName, insertCourse, updateCourseWithUserId } from './course-queries';
import { supabase } from '../core/client';

// Helper function to find or create a course by API ID
export async function findOrCreateCourseByApiId(
  apiCourseId: string,
  courseName: string,
  clubName: string,
  city?: string,
  state?: string
): Promise<number | null> {
  try {
    console.log(`Finding or creating course by API ID: ${apiCourseId}`);
    
    // First try to find by API ID
    const existingCourse = await findCourseByApiId(apiCourseId);
    if (existingCourse) {
      console.log("Found existing course by API ID:", existingCourse);
      
      // Update course with current user_id if needed
      await updateCourseWithUserId(existingCourse.id);
      
      return existingCourse.id;
    }
    
    // If not found by API ID, try by name
    const fullName = formatCourseName(clubName, courseName);
    console.log(`Checking for course by name: ${fullName}`);
    
    const existingByName = await findCourseByName(fullName);
    if (existingByName) {
      console.log("Found existing course by name:", existingByName);
      
      // Update course with current user_id if needed
      await updateCourseWithUserId(existingByName.id);
      
      // Update API ID if needed
      if (apiCourseId) {
        try {
          await supabase
            .from('courses')
            .update({ api_course_id: apiCourseId })
            .eq('id', existingByName.id);
          console.log(`Updated course ${existingByName.id} with API ID ${apiCourseId}`);
        } catch (error) {
          console.error("Error updating course API ID:", error);
        }
      }
      
      return existingByName.id;
    }
    
    // If not found, create a new course
    console.log(`Creating new course: ${fullName}`);
    
    // Get the current user ID if available
    let userId = null;
    try {
      const { data: session } = await supabase.auth.getSession();
      if (session && session.session && session.session.user) {
        userId = session.session.user.id;
      }
    } catch (error) {
      console.error("Error getting user session:", error);
    }
    
    const insertedCourse = await insertCourse({
      name: fullName,
      city,
      state,
      api_course_id: apiCourseId,
      user_id: userId
    });
    
    if (insertedCourse) {
      console.log("Inserted new course:", insertedCourse);
      return insertedCourse.id;
    }
    
    return null;
  } catch (error) {
    console.error("Error in findOrCreateCourseByApiId:", error);
    return null;
  }
}

// Helper function to ensure a course exists in the database
export async function ensureCourseExists(
  courseId: number,
  apiCourseId?: string,
  courseName?: string,
  clubName?: string,
  city?: string,
  state?: string
): Promise<number> {
  try {
    console.log(`Ensuring course exists with ID: ${courseId}`);
    
    // First, check if the course with this ID exists
    const { data, error } = await supabase
      .from('courses')
      .select('id, name, api_course_id, user_id')
      .eq('id', courseId)
      .maybeSingle();
      
    if (!error && data) {
      console.log("Course exists with ID:", courseId);
      
      // If the course exists but doesn't have a user_id, try to update it with the current user's ID
      if (!data.user_id) {
        await updateCourseWithUserId(courseId);
      }
      
      // If the course doesn't have an API ID but we have one, update it
      if (apiCourseId && !data.api_course_id) {
        try {
          await supabase
            .from('courses')
            .update({ api_course_id: apiCourseId })
            .eq('id', courseId);
          console.log(`Updated course ${courseId} with API ID ${apiCourseId}`);
        } catch (updateError) {
          console.error("Error updating course API ID:", updateError);
        }
      }
      
      return courseId;
    }
    
    // If the course doesn't exist by ID but we have a name, try to find by name
    if (courseName && clubName) {
      const fullName = formatCourseName(clubName, courseName);
      console.log(`Course not found by ID, checking by name: ${fullName}`);
      
      const existingByName = await findCourseByName(fullName);
      if (existingByName) {
        console.log("Found existing course by name:", existingByName);
        
        // Update course with current user_id if needed
        await updateCourseWithUserId(existingByName.id);
        
        return existingByName.id;
      }
    }
    
    // If the course doesn't exist and we have an API ID, try to find or create by API ID
    if (apiCourseId && courseName && clubName) {
      console.log(`Course not found by ID or name, trying by API ID: ${apiCourseId}`);
      const foundOrCreatedId = await findOrCreateCourseByApiId(
        apiCourseId,
        courseName,
        clubName,
        city,
        state
      );
      
      if (foundOrCreatedId) {
        return foundOrCreatedId;
      }
    }
    
    // If all else fails, create a new course with the provided ID
    if (courseName && clubName) {
      console.log(`Creating new course with name: ${courseName}`);
      
      let userId = null;
      try {
        const { data: session } = await supabase.auth.getSession();
        if (session && session.session && session.session.user) {
          userId = session.session.user.id;
        }
      } catch (error) {
        console.error("Error getting user session:", error);
      }
      
      const fullName = formatCourseName(clubName, courseName);
      const insertedCourse = await insertCourse({
        name: fullName,
        city,
        state,
        api_course_id: apiCourseId,
        user_id: userId
      });
      
      if (insertedCourse) {
        console.log("Created new course:", insertedCourse);
        return insertedCourse.id;
      }
    }
    
    // If we really can't find or create a course, throw an error
    throw new Error(`Course with ID ${courseId} not found and could not be created`);
  } catch (error) {
    console.error("Error ensuring course exists:", error);
    throw error;
  }
}
