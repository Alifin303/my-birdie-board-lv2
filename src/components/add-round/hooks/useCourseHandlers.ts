
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
  
  // Call the refactored handlers with the proper props
  const handlers = useRefactoredCourseHandlers({
    ...props,
    selectedTeeId: props.selectedTeeId
  });
  
  // Log the handlers' results without trying to access non-existent properties
  console.log("useCourseHandlers - returning handlers object");
  
  // Return only the handlers object that matches the CourseHandlers interface
  return handlers;
}
