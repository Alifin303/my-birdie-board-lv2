
import { SimplifiedTee, SimplifiedCourseDetail } from "../types";

/**
 * Ensures tee data is valid for user-added courses
 * 
 * @param courseDetail The course detail object to validate
 * @returns The course detail with validated tee data
 */
export function validateAndRepairTeeData(courseDetail: SimplifiedCourseDetail): SimplifiedCourseDetail {
  console.log("Validating tee data for course:", courseDetail.name);
  
  let tees = courseDetail.tees || [];
  const courseId = courseDetail.id;
  
  // Check if we have valid tees
  if (!tees || tees.length === 0) {
    console.log("No tees found, creating default tee data");
    
    // Create a default set of holes
    const defaultHoles = Array(18).fill(null).map((_, idx) => ({
      number: idx + 1,
      par: 4,
      yards: 400,
      handicap: idx + 1
    }));
    
    // Create a default tee
    const defaultTeeId = `tee-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const whiteTee = {
      id: defaultTeeId,
      name: 'White',
      rating: 72.0,
      slope: 113,
      par: 72,
      gender: 'male' as const,
      originalIndex: 0,
      holes: defaultHoles
    };
    
    tees = [whiteTee];
    
    // Also set course holes to use these default holes
    courseDetail.holes = defaultHoles;
  } else {
    // Fix any tees with missing or invalid data
    tees = tees.map((tee, index) => {
      if (!tee) return null;
      
      // Generate a valid ID if missing
      if (!tee.id || tee.id.trim() === '') {
        tee.id = `tee-${courseId}-${Date.now()}-${index}`;
        console.log(`Generated new ID for tee ${tee.name || 'unnamed'}: ${tee.id}`);
      }
      
      // Ensure name exists
      if (!tee.name || tee.name.trim() === '') {
        const teeNames = ['White', 'Blue', 'Red', 'Gold', 'Black'];
        tee.name = teeNames[index % teeNames.length];
        console.log(`Assigned name to unnamed tee: ${tee.name}`);
      }
      
      // Ensure rating, slope, and par exist
      tee.rating = tee.rating || 72.0;
      tee.slope = tee.slope || 113;
      
      // Calculate par from holes if available, or set default
      if (!tee.par || tee.par <= 0) {
        if (tee.holes && tee.holes.length > 0) {
          tee.par = tee.holes.reduce((sum, hole) => sum + (hole.par || 4), 0);
          console.log(`Calculated par for tee ${tee.name}: ${tee.par}`);
        } else {
          tee.par = 72;
          console.log(`Set default par for tee ${tee.name}: ${tee.par}`);
        }
      }
      
      // Fix missing holes data
      if (!tee.holes || tee.holes.length === 0) {
        console.log(`Generating default holes for tee ${tee.name}`);
        tee.holes = Array(18).fill(null).map((_, idx) => ({
          number: idx + 1,
          par: 4,
          yards: 400,
          handicap: idx + 1
        }));
      }
      
      // Fix holes with missing data
      if (tee.holes) {
        tee.holes = tee.holes.map((hole, holeIdx) => ({
          number: hole.number || holeIdx + 1,
          par: hole.par || 4,
          yards: hole.yards || 400,
          handicap: hole.handicap || holeIdx + 1
        }));
      }
      
      return tee;
    }).filter(Boolean) as SimplifiedTee[];
  }
  
  // Update the course with fixed tees
  courseDetail.tees = tees;
  
  // Save the updated course data to localStorage for future use
  try {
    localStorage.setItem(`course_details_${courseId}`, JSON.stringify(courseDetail));
    console.log("Saved validated course details to localStorage:", courseDetail.name);
  } catch (e) {
    console.warn("Could not save validated course details to localStorage:", e);
  }
  
  return courseDetail;
}

/**
 * Gets the default tee ID for a course
 * 
 * @param courseDetail The course detail object
 * @returns The ID of the default tee, or null if no tees available
 */
export function getDefaultTeeId(courseDetail: SimplifiedCourseDetail): string | null {
  if (!courseDetail.tees || courseDetail.tees.length === 0) {
    return null;
  }
  
  // Look for tees in this preferred order: White, Blue, Gold, Red, Black
  const preferredTeeOrder = ['white', 'blue', 'gold', 'red', 'black'];
  
  for (const preferredColor of preferredTeeOrder) {
    const matchingTee = courseDetail.tees.find(
      tee => tee.name?.toLowerCase().includes(preferredColor)
    );
    
    if (matchingTee) {
      return matchingTee.id;
    }
  }
  
  // If no preferred tee found, return the first tee
  return courseDetail.tees[0].id;
}
