
// Export everything from client core
export { supabase, getSiteUrl, logSupabaseOperation, type DatabaseError } from './core/client';

// Export course query functions
export {
  fetchCourseById,
  findCourseByApiId,
  findCourseByName,
  insertCourse,
  getCourseMetadataFromLocalStorage,
  updateCourseWithUserId
} from './course/course-queries';

// Export course operation functions
export {
  findOrCreateCourseByApiId,
  ensureCourseExists
} from './course/course-operations';

// Export course utility functions
export {
  parseCourseName,
  formatCourseName,
  isUserAddedCourse
} from './utils/course-utils';

// Export handicap calculator
export { calculateHandicapIndex } from './handicap/handicap-calculator';
