
/**
 * Utility functions for handling tee names
 */

/**
 * Returns the tee name exactly as stored in the database
 * This ensures we display the exact tee name without any modifications
 */
export const getExactTeeName = (teeName: string | null | undefined): string => {
  if (teeName === null || teeName === undefined) {
    return 'Standard';
  }
  return teeName;
};
