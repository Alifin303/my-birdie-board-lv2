
// This file now re-exports everything from the modularized structure
// to maintain backward compatibility with existing imports

export {
  supabase,
  getSiteUrl,
  logSupabaseOperation,
  fetchCourseById,
  findCourseByApiId,
  findCourseByName,
  insertCourse,
  findOrCreateCourseByApiId,
  ensureCourseExists,
  parseCourseName,
  formatCourseName,
  isUserAddedCourse,
  getCourseMetadataFromLocalStorage,
  calculateHandicapIndex,
  updateCourseWithUserId,
  isSubscriptionValid,
  fetchUserSubscription,
  clearSubscriptionCache,
  type DatabaseError
} from './index';
