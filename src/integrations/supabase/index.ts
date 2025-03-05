
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

export { 
  calculateHandicapIndex, 
  calculateNetScore,
  calculateNetToPar,
  updateUserHandicap 
} from './handicap/handicap-calculator';

// Export subscription utils
export { isSubscriptionValid, fetchUserSubscription } from './subscription/subscription-utils';

// Define DatabaseError type directly in this file since it's not in types.ts
export type DatabaseError = {
  code: string;
  details?: string;
  hint?: string;
  message: string;
};
