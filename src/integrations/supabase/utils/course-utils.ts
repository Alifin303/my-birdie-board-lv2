
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
export function parseCourseName(name: string): { name: string } {
  // For now, just return the name itself
  // This can be expanded later to extract more structured data from course names
  return { name: name || '' };
}
