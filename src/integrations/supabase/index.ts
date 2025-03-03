
// This is a barrel file that re-exports everything from the modularized structure

export { supabase, getSiteUrl, logSupabaseOperation } from './core/client';

export {
  fetchCourseById,
  findCourseByApiId,
  findCourseByName,
  insertCourse,
  getCourseMetadataFromLocalStorage,
  updateCourseWithUserId
} from './course/course-queries';

export { findOrCreateCourseByApiId, ensureCourseExists } from './course/course-operations';

export { parseCourseName, formatCourseName, isUserAddedCourse } from './utils/course-utils';

export { calculateHandicapIndex } from './handicap/handicap-calculator';

export type { DatabaseError } from './types';
