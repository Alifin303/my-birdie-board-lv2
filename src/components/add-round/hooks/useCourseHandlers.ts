
import { useCourseHandlers as useRefactoredCourseHandlers } from "./course-handlers";
export { useCourseHandlers };

/**
 * This file is a compatibility wrapper around the refactored useCourseHandlers functionality.
 * It preserves the old API for backward compatibility while using the new modularized implementation.
 */
function useCourseHandlers(props: Parameters<typeof useRefactoredCourseHandlers>[0]) {
  return useRefactoredCourseHandlers(props);
}
