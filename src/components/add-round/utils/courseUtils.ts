import { getCourseMetadataFromLocalStorage } from "@/integrations/supabase";
import { CourseDetail } from "@/services/golfCourseApi";
import { SimplifiedCourseDetail, SimplifiedTee } from "../types";

/**
 * Loads course details for a user-added course
 * 
 * @param courseId The ID of the course to load
 * @returns The course details or null if not found
 */
export function loadUserAddedCourseDetails(courseId: number | string): SimplifiedCourseDetail | null {
  try {
    console.log(`Loading user-added course details for course ID: ${courseId}`);
    
    // Try to get course details from localStorage
    const courseDetailsKey = `course_details_${courseId}`;
    const storedDetails = localStorage.getItem(courseDetailsKey);
    
    if (!storedDetails) {
      console.log(`No details found in localStorage for course ID: ${courseId}`);
      
      // Try getting metadata using the utility function as fallback
      const metadata = getCourseMetadataFromLocalStorage(courseId);
      if (metadata) {
        console.log("Found course metadata through utility function");
        
        // Convert metadata to our expected format
        const simplifiedCourseDetail: SimplifiedCourseDetail = {
          id: typeof courseId === 'string' ? parseInt(courseId, 10) : courseId,
          name: metadata.name || 'Unknown Course',
          clubName: metadata.clubName || metadata.name || 'Unknown Club',
          city: metadata.city,
          state: metadata.state,
          tees: metadata.tees || [],
          holes: metadata.holes || [],
          isUserAdded: true // Mark as user-added course
        };
        
        // Save it back to localStorage in our expected format
        try {
          localStorage.setItem(courseDetailsKey, JSON.stringify(simplifiedCourseDetail));
          console.log("Saved converted metadata to localStorage");
        } catch (e) {
          console.error("Error saving to localStorage:", e);
        }
        
        return simplifiedCourseDetail;
      }
      
      return null;
    }
    
    // Parse the stored details
    let courseDetails: SimplifiedCourseDetail;
    try {
      courseDetails = JSON.parse(storedDetails);
      console.log("Successfully parsed course details from localStorage");
      
      // Ensure isUserAdded flag is set
      courseDetails.isUserAdded = true;
      
      // Save the updated course data back to localStorage
      localStorage.setItem(courseDetailsKey, JSON.stringify(courseDetails));
      
    } catch (parseError) {
      console.error("Error parsing course details:", parseError);
      return null;
    }
    
    return courseDetails;
  } catch (error) {
    console.error("Error loading user-added course details:", error);
    return null;
  }
}

/**
 * Converts a CourseDetail object from the Golf Course API to our SimplifiedCourseDetail format
 * 
 * @param courseDetail The course detail from the API
 * @returns A simplified course detail object
 */
export function convertToSimplifiedCourseDetail(courseDetail: CourseDetail): SimplifiedCourseDetail {
  const tees: SimplifiedTee[] = [];

  // Process male tees
  if (courseDetail.tees?.male) {
    courseDetail.tees.male.forEach((tee, index) => {
      tees.push({
        id: `male-${index}-${tee.tee_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name: tee.tee_name || 'Unknown Tee',
        par: tee.par_total || 72,
        rating: tee.course_rating || 72.0,
        slope: tee.slope_rating || 113,
        gender: 'male',
        originalIndex: index,
        holes: tee.holes
      });
    });
  }

  // Process female tees
  if (courseDetail.tees?.female) {
    courseDetail.tees.female.forEach((tee, index) => {
      tees.push({
        id: `female-${index}-${tee.tee_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name: tee.tee_name || 'Unknown Tee',
        par: tee.par_total || 72,
        rating: tee.course_rating || 72.0,
        slope: tee.slope_rating || 113,
        gender: 'female',
        originalIndex: index,
        holes: tee.holes
      });
    });
  }

  const simplified: SimplifiedCourseDetail = {
    id: courseDetail.id,
    name: courseDetail.course_name || 'Unknown Course',
    clubName: courseDetail.club_name || 'Unknown Club',
    city: courseDetail.location?.city,
    state: courseDetail.location?.state,
    holes: courseDetail.holes,
    tees: tees,
    isUserAdded: false
  };

  return simplified;
}

/**
 * Formats a course name by combining the club name and course name
 * @param clubName The name of the golf club
 * @param courseName The name of the golf course
 * @returns A formatted course name
 */
export function formatCourseName(clubName: string, courseName: string): string {
  if (!clubName || !courseName) {
    return clubName || courseName || "Unknown Course";
  }
  
  if (clubName === courseName) {
    return clubName;
  }
  
  return `${clubName} - ${courseName}`;
}
