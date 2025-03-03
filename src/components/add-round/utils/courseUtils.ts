
import { getCourseMetadataFromLocalStorage } from "@/integrations/supabase";
import { CourseDetail } from "@/services/golfCourseApi";
import { SimplifiedCourseDetail, SimplifiedTee, SimplifiedGolfCourse, SimplifiedHole } from "../types";

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
      // Convert API hole structure to our SimplifiedHole structure
      const convertedHoles: SimplifiedHole[] = (tee.holes || []).map(hole => ({
        number: hole.number || 0, // Ensure number is not optional
        par: hole.par || 4,
        yards: hole.yardage || 0,
        handicap: hole.handicap || 0
      }));

      tees.push({
        id: `male-${index}-${tee.tee_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name: tee.tee_name || 'Unknown Tee',
        par: tee.par_total || 72,
        rating: tee.course_rating || 72.0,
        slope: tee.slope_rating || 113,
        gender: 'male',
        originalIndex: index,
        holes: convertedHoles
      });
    });
  }

  // Process female tees
  if (courseDetail.tees?.female) {
    courseDetail.tees.female.forEach((tee, index) => {
      // Convert API hole structure to our SimplifiedHole structure
      const convertedHoles: SimplifiedHole[] = (tee.holes || []).map(hole => ({
        number: hole.number || 0, // Ensure number is not optional
        par: hole.par || 4,
        yards: hole.yardage || 0,
        handicap: hole.handicap || 0
      }));

      tees.push({
        id: `female-${index}-${tee.tee_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name: tee.tee_name || 'Unknown Tee',
        par: tee.par_total || 72,
        rating: tee.course_rating || 72.0,
        slope: tee.slope_rating || 113,
        gender: 'female',
        originalIndex: index,
        holes: convertedHoles
      });
    });
  }

  // Create default holes array if none exists
  const defaultHoles: SimplifiedHole[] = Array(18).fill(null).map((_, idx) => ({
    number: idx + 1,
    par: 4,
    yards: 400,
    handicap: idx + 1
  }));

  // Fix: Ensure courseDetail.id is properly converted to a number
  const courseId = typeof courseDetail.id === 'string' ? 
    parseInt(courseDetail.id, 10) : 
    (courseDetail.id || 0); // Default to 0 if undefined

  // Fix: Ensure holes is always an array of SimplifiedHole objects
  const courseHoles: SimplifiedHole[] = courseDetail.holes ? 
    courseDetail.holes.map(hole => ({
      number: hole.number || 0, // Ensure number is not optional
      par: hole.par || 4,
      yards: hole.yardage || 0,
      handicap: hole.handicap || 0
    })) : 
    defaultHoles;

  const simplified: SimplifiedCourseDetail = {
    id: courseId,
    name: courseDetail.course_name || 'Unknown Course',
    clubName: courseDetail.club_name || 'Unknown Club',
    city: courseDetail.location?.city,
    state: courseDetail.location?.state,
    holes: courseHoles,
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

/**
 * Fetches user-added courses from localStorage that match a search query
 * 
 * @param query The search query to match against course names
 * @returns An array of simplified golf courses
 */
export function fetchUserAddedCourses(query: string): SimplifiedGolfCourse[] {
  try {
    const courses: SimplifiedGolfCourse[] = [];
    
    // Iterate through localStorage to find course details
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      // Only process keys that match our course details pattern
      if (key && key.startsWith('course_details_')) {
        try {
          const courseId = key.replace('course_details_', '');
          const storedCourse = localStorage.getItem(key);
          
          if (storedCourse) {
            const courseData = JSON.parse(storedCourse);
            
            // Check if the course name or club name matches the query
            const courseName = courseData.name || '';
            const clubName = courseData.clubName || courseName;
            const cityState = `${courseData.city || ''} ${courseData.state || ''}`;
            
            const searchableText = `${courseName} ${clubName} ${cityState}`.toLowerCase();
            
            if (searchableText.includes(query.toLowerCase())) {
              courses.push({
                id: parseInt(courseId, 10) || 0,
                name: courseName,
                clubName: clubName,
                city: courseData.city,
                state: courseData.state,
                isUserAdded: true
              });
            }
          }
        } catch (error) {
          console.error("Error parsing course from localStorage:", error);
        }
      }
    }
    
    console.log("User-added courses matching query:", courses);
    return courses;
  } catch (error) {
    console.error("Error fetching user-added courses:", error);
    return [];
  }
}

/**
 * Enhances course search results with additional metadata
 * 
 * @param courses The array of courses to enhance
 * @returns The enhanced array of courses
 */
export function enhanceCourseResults(courses: SimplifiedGolfCourse[]): SimplifiedGolfCourse[] {
  try {
    return courses.map(course => {
      // If it's already a user-added course, just return it as is
      if (course.isUserAdded) {
        return course;
      }
      
      // Check if this course exists as a user-added course with the same api_course_id
      // This would happen if a user has previously added this course from the API
      const userAddedKey = `course_details_${course.id}`;
      const userAddedData = localStorage.getItem(userAddedKey);
      
      if (userAddedData) {
        try {
          const courseData = JSON.parse(userAddedData);
          
          return {
            ...course,
            isUserAdded: true, // Mark as user-added since we have local data for it
            id: course.id, // Keep the original ID
            name: courseData.name || course.name,
            clubName: courseData.clubName || course.clubName,
            city: courseData.city || course.city,
            state: courseData.state || course.state
          };
        } catch (error) {
          console.error("Error parsing user-added course data:", error);
        }
      }
      
      return course;
    });
  } catch (error) {
    console.error("Error enhancing course results:", error);
    return courses;
  }
}
