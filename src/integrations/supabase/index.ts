
// Export everything from client core
export { supabase, getSiteUrl, logSupabaseOperation, type DatabaseError } from './core/client';

// Export course utils
export { 
  parseCourseName, 
  formatCourseName, 
  isUserAddedCourse 
} from './utils/course-utils';

// Export course query functions
export {
  fetchCourseById,
  findCourseByApiId,
  findCourseByName,
  insertCourse,
  getCourseMetadataFromLocalStorage
} from './course/course-queries';

// Export course operation functions
export {
  findOrCreateCourseByApiId,
  ensureCourseExists
} from './course/course-operations';

// Export handicap calculator
export { calculateHandicapIndex } from './handicap/handicap-calculator';
