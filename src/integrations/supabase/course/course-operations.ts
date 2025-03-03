
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
    console.log(`Finding or creating course by API ID: ${apiCourseId}, name: ${courseName}, club: ${clubName}`);
    
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
    console.log(`Ensuring course exists: ID=${courseId}, apiId=${apiCourseId}, name=${courseName}, clubName=${clubName}`);
    
    // First, check if the course with the numeric ID exists
    if (courseId > 0) {
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
        }
      } catch (checkError) {
        console.error("Error checking if course exists by ID:", checkError);
      }
    }
    
    // If we're here and have an API course ID, try to find the course by API ID
    if (apiCourseId) {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('id')
          .eq('api_course_id', apiCourseId)
          .maybeSingle();
          
        if (!error && data) {
          console.log("Found course by API ID:", data.id);
          return data.id;
        }
      } catch (apiIdError) {
        console.error("Error checking if course exists by API ID:", apiIdError);
      }
    }
    
    // If we get here, the course doesn't exist - create a new course
    console.log("Course doesn't exist, attempting to create it");
    
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
    
    const insertedCourse = await insertCourse({
      name: fullName,
      city,
      state,
      api_course_id: apiCourseId,
      user_id: userId
    });
    
    if (insertedCourse) {
      console.log("Created new course:", insertedCourse);
      
      // Store course metadata in localStorage
      try {
        const courseDetails = {
          id: insertedCourse.id,
          name: fullName,
          clubName: clubName,
          city: city,
          state: state,
          apiCourseId: apiCourseId,
          isUserAdded: true
        };
        localStorage.setItem(`course_details_${insertedCourse.id}`, JSON.stringify(courseDetails));
        console.log("Saved new course details to localStorage");
      } catch (e) {
        console.warn("Could not save course details to localStorage:", e);
      }
      
      return insertedCourse.id;
    }
    
    throw new Error(`Failed to create course "${fullName}"`);
  } catch (error) {
    console.error("Error ensuring course exists:", error);
    throw new Error(`Course with ID ${courseId} not found and could not be created: ${error}`);
  }
}
