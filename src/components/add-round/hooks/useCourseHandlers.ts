
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
  
  // Ensure we have a valid default for selectedTeeId if it's null but we have a course with tees
  if (!props.selectedTeeId && props.selectedCourse && props.selectedCourse.tees && props.selectedCourse.tees.length > 0) {
    console.log("Setting default selectedTeeId in wrapper from first available tee");
    props.setSelectedTeeId(props.selectedCourse.tees[0].id);
    
    // Ensure courseAndTeeReady gets set properly once we have both course and tee
    if (!props.courseAndTeeReady) {
      setTimeout(() => {
        props.setCourseAndTeeReady(true);
      }, 0);
    }
  }
  
  return useRefactoredCourseHandlers(props);
}
