
// Export everything from client core
export { supabase, getSiteUrl, logSupabaseOperation, type DatabaseError } from './core/client';

// Export course query functions
export {
  fetchCourseById,
  findCourseByApiId,
  findCourseByName,
  insertCourse,
  getCourseMetadataFromLocalStorage,
  parseCourseName,
  formatCourseName,
  isUserAddedCourse
} from './client';

// Export course operation functions
export {
  findOrCreateCourseByApiId,
  ensureCourseExists
} from './client';

// Export handicap calculator
export { calculateHandicapIndex } from './handicap/handicap-calculator';
