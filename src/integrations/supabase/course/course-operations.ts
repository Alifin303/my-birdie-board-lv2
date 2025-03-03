
import { formatCourseName } from '../utils/course-utils';
import { findCourseByApiId, insertCourse, fetchCourseById } from './course-queries';
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
    // First try to find by API ID
    const existingCourse = await findCourseByApiId(apiCourseId);
    if (existingCourse) {
      console.log("Found existing course by API ID:", existingCourse);
      return existingCourse.id;
    }
    
    // If not found, create a new course
    const fullName = formatCourseName(clubName, courseName);
    
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
    console.log(`Ensuring course exists: ID=${courseId}, name=${courseName}, clubName=${clubName}`);
    
    // First, check if the course with this ID exists
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, user_id')
        .eq('id', courseId)
        .maybeSingle();
      
      if (!error && data) {
        console.log("Course exists with ID:", courseId, "name:", data.name);
        
        // If the course exists but doesn't have a user_id, try to update it with the current user's ID
        if (!data.user_id) {
          try {
            const { data: session } = await supabase.auth.getSession();
            if (session && session.session && session.session.user) {
              const userId = session.session.user.id;
              await supabase
                .from('courses')
                .update({ user_id: userId })
                .eq('id', courseId);
              console.log(`Updated course ${courseId} with user_id ${userId}`);
            }
          } catch (updateError) {
            console.error("Error updating course user_id:", updateError);
          }
        }
        
        return courseId;
      } else {
        console.log("Course not found with ID:", courseId, "Error:", error?.message);
      }
    } catch (checkError) {
      console.error("Error checking if course exists:", checkError);
    }
    
    // If we get here, the course doesn't exist with the provided ID
    // Try to create a new course
    console.log("Course doesn't exist with ID:", courseId, "attempting to create it");
    
    if (!courseName) {
      courseName = clubName ? `${clubName} Course` : "Unknown Course";
    }
    
    if (!clubName) {
      clubName = courseName;
    }
    
    const fullName = formatCourseName(clubName, courseName);
    console.log("Creating new course with name:", fullName);
    
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
    
    // CRITICAL FIX: DO NOT TRY TO USE THE ORIGINAL COURSE ID FOR THE NEW COURSE
    // Let the database assign a new ID instead
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
    
    throw new Error(`Failed to create course "${fullName}"`);
  } catch (error) {
    console.error("Error ensuring course exists:", error);
    throw new Error(`Course with ID ${courseId} not found and could not be created: ${error}`);
  }
}
