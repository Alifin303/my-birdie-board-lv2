
// Helper function to parse course name
export function parseCourseName(fullName: string): { clubName: string; courseName: string } {
  if (!fullName) return { clubName: 'Unknown Club', courseName: 'Unknown Course' };
  
  // Check if the name contains " - " which separates club name from course name
  const parts = fullName.split(' - ');
  
  if (parts.length > 1) {
    // If we have multiple parts, first part is club name, rest combined is course name
    const clubName = parts[0].trim();
    const courseName = parts.slice(1).join(' - ').trim();
    return { clubName, courseName };
  } else {
    // If no separator, use the whole string as both club and course name
    return { clubName: fullName.trim(), courseName: fullName.trim() };
  }
}

// Helper function to format course name for database storage
export function formatCourseName(clubName: string, courseName: string): string {
  if (!clubName && !courseName) return '';
  if (!clubName) return courseName;
  if (!courseName || clubName === courseName) return clubName;
  
  return `${clubName} - ${courseName}`;
}

// Helper function to check if a course is user-added
export function isUserAddedCourse(courseName: string): boolean {
  return courseName && courseName.includes('[User added course]');
}

// Helper function to ensure tee data is valid
export function validateTeeData(tee: any): any {
  if (!tee) return null;
  
  // Create a deep copy to avoid modifying the original object
  const validatedTee = JSON.parse(JSON.stringify(tee));
  
  // Ensure it has a valid ID
  if (!validatedTee.id || typeof validatedTee.id !== 'string' || validatedTee.id.trim() === '') {
    validatedTee.id = `tee-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    console.log(`Generated new ID for tee ${validatedTee.name || 'unnamed'}: ${validatedTee.id}`);
  }
  
  // Ensure it has a name
  if (!validatedTee.name || typeof validatedTee.name !== 'string' || validatedTee.name.trim() === '') {
    validatedTee.name = 'Standard';
  }
  
  // Ensure it has valid rating and slope
  validatedTee.rating = validatedTee.rating && !isNaN(validatedTee.rating) ? Number(validatedTee.rating) : 72;
  validatedTee.slope = validatedTee.slope && !isNaN(validatedTee.slope) ? Number(validatedTee.slope) : 113;
  
  // Ensure holes array exists
  if (!validatedTee.holes || !Array.isArray(validatedTee.holes)) {
    validatedTee.holes = Array(18).fill(0).map((_, idx) => ({
      number: idx + 1,
      par: 4,
      yards: 400,
      handicap: idx + 1
    }));
  }
  
  // Ensure it has valid par
  if (!validatedTee.par || isNaN(validatedTee.par) || validatedTee.par <= 0) {
    // Calculate par from holes if available
    if (validatedTee.holes && Array.isArray(validatedTee.holes) && validatedTee.holes.length > 0) {
      validatedTee.par = validatedTee.holes.reduce((sum: number, hole: any) => sum + (hole.par || 4), 0);
      console.log(`Calculated par for tee ${validatedTee.name}: ${validatedTee.par}`);
    } else {
      validatedTee.par = 72; // Default par
    }
  }
  
  // Ensure holes have valid data
  if (validatedTee.holes && Array.isArray(validatedTee.holes)) {
    validatedTee.holes = validatedTee.holes.map((hole: any, idx: number) => ({
      number: hole.number || (idx + 1),
      par: hole.par || 4,
      yards: hole.yards || 400,
      handicap: hole.handicap || (idx + 1)
    }));
  }
  
  return validatedTee;
}
