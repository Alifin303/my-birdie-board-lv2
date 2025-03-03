
import { useCourseHandlers as useRefactoredCourseHandlers } from "./course-handlers";
export { useCourseHandlers };

/**
 * This file is a compatibility wrapper around the refactored useCourseHandlers functionality.
 * It preserves the old API for backward compatibility while using the new modularized implementation.
 */
function useCourseHandlers(props: Parameters<typeof useRefactoredCourseHandlers>[0]) {
  console.log("useCourseHandlers wrapper - selectedTeeId:", props.selectedTeeId);
  console.log("useCourseHandlers wrapper - courseAndTeeReady:", props.courseAndTeeReady);
  
  // Enhanced logging for debugging tee selection issues
  if (props.selectedCourse && props.selectedTeeId) {
    const tee = props.selectedCourse.tees.find(t => t.id === props.selectedTeeId);
    console.log("Selected tee in wrapper:", tee ? { id: tee.id, name: tee.name, par: tee.par } : "Tee not found");
  }
  
  return useRefactoredCourseHandlers(props);
}
