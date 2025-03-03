
import { useCourseHandlers as useRefactoredCourseHandlers } from "./course-handlers";
export { useCourseHandlers };

/**
 * This file is a compatibility wrapper around the refactored useCourseHandlers functionality.
 * It preserves the old API for backward compatibility while using the new modularized implementation.
 */
function useCourseHandlers(props: Parameters<typeof useRefactoredCourseHandlers>[0]) {
  // Log key properties for debugging
  console.log("useCourseHandlers wrapper - selectedTeeId:", props.selectedTeeId);
  console.log("useCourseHandlers wrapper - selectedCourse:", 
    props.selectedCourse ? {
      id: props.selectedCourse.id,
      name: props.selectedCourse.name,
      tees: props.selectedCourse.tees?.length || 0
    } : null
  );
  
  if (props.selectedCourse && (!props.selectedCourse.tees || props.selectedCourse.tees.length === 0)) {
    console.error("Course has no tees in wrapper:", props.selectedCourse.name);
  }
  
  // Make sure the selectedTeeId is passed correctly to the refactored handler
  return useRefactoredCourseHandlers({
    ...props,
    selectedTeeId: props.selectedTeeId
  });
}
