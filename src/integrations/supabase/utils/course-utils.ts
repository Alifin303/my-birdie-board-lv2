
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
  return courseName.includes('[User added course]');
}

// Helper function to ensure tee data is valid
export function validateTeeData(tee: any): any {
  if (!tee) return null;
  
  // Ensure it has a valid ID
  if (!tee.id || typeof tee.id !== 'string' || tee.id.trim() === '') {
    tee.id = `tee-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    console.log(`Generated new ID for tee ${tee.name || 'unnamed'}: ${tee.id}`);
  }
  
  // Ensure it has a name
  if (!tee.name || typeof tee.name !== 'string' || tee.name.trim() === '') {
    tee.name = 'Standard';
  }
  
  // Ensure it has valid rating and slope
  tee.rating = tee.rating && !isNaN(tee.rating) ? tee.rating : 72;
  tee.slope = tee.slope && !isNaN(tee.slope) ? tee.slope : 113;
  
  // Ensure it has valid par
  if (!tee.par || isNaN(tee.par) || tee.par <= 0) {
    // Calculate par from holes if available
    if (tee.holes && Array.isArray(tee.holes) && tee.holes.length > 0) {
      tee.par = tee.holes.reduce((sum: number, hole: any) => sum + (hole.par || 4), 0);
    } else {
      tee.par = 72; // Default par
    }
  }
  
  // Ensure holes have valid data if present
  if (tee.holes && Array.isArray(tee.holes)) {
    tee.holes = tee.holes.map((hole: any, idx: number) => ({
      number: hole.number || (idx + 1),
      par: hole.par || 4,
      yards: hole.yards || 400,
      handicap: hole.handicap || (idx + 1)
    }));
  }
  
  return tee;
}
