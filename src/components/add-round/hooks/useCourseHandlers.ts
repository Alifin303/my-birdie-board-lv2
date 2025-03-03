
import { useCourseHandlers as useRefactoredCourseHandlers } from "./course-handlers";
export { useCourseHandlers };

/**
 * This file is a compatibility wrapper around the refactored useCourseHandlers functionality.
 * It preserves the old API for backward compatibility while using the new modularized implementation.
 */
function useCourseHandlers(props: Parameters<typeof useRefactoredCourseHandlers>[0]) {
  console.log("useCourseHandlers wrapper - selectedTeeId:", props.selectedTeeId);
  // Make sure the selectedTeeId is passed correctly to the refactored handler
  return useRefactoredCourseHandlers({
    ...props,
    selectedTeeId: props.selectedTeeId
  });
}
