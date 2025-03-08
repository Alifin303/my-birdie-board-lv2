
// Utility functions for course name formatting and parsing

/**
 * Formats a course name by properly capitalizing and formatting it
 */
export function formatCourseName(name: string): string {
  if (!name) return '';
  
  // Split by spaces, capitalize first letter of each word
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Parses a course name to extract relevant components
 * This could be used to extract things like course name, location, etc.
 */
export function parseCourseName(name: string): { clubName: string; courseName: string } {
  if (!name) return { clubName: '', courseName: '' };
  
  // If the name contains a separator like " - ", split it into club name and course name
  if (name.includes(' - ')) {
    const [clubName, courseName] = name.split(' - ', 2);
    return { clubName, courseName };
  }
  
  // If no separator, return the entire name as both club and course name
  return { clubName: name, courseName: name };
}

/**
 * Checks if a course name indicates a user-added course
 */
export function isUserAddedCourse(name: string): boolean {
  return name.includes('[User added course]');
}
