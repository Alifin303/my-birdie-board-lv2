
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
  
  // Log the validated tee data for debugging
  console.log(`Validated tee data for ${validatedTee.name}:`, {
    id: validatedTee.id,
    name: validatedTee.name,
    par: validatedTee.par,
    rating: validatedTee.rating,
    slope: validatedTee.slope,
    holesCount: validatedTee.holes?.length || 0
  });
  
  return validatedTee;
}

// New helper function to handle loading all course tees with better error handling
export function loadAndValidateCourseTees(courseId: number | string): any[] {
  try {
    // Try to get the course details from localStorage
    const courseDetailsKey = `course_details_${courseId}`;
    const storedDetails = localStorage.getItem(courseDetailsKey);
    
    if (!storedDetails) {
      console.log(`No course details found in localStorage for course ID: ${courseId}`);
      return createDefaultTees();
    }
    
    const courseDetails = JSON.parse(storedDetails);
    
    // Check if we have tees data
    if (!courseDetails.tees || !Array.isArray(courseDetails.tees) || courseDetails.tees.length === 0) {
      console.log(`No tees found in course details for course ID: ${courseId}, creating defaults`);
      return createDefaultTees();
    }
    
    // Validate each tee
    const validatedTees = courseDetails.tees.map((tee: any) => validateTeeData(tee)).filter(Boolean);
    
    if (validatedTees.length === 0) {
      console.log(`All tees were invalid for course ID: ${courseId}, creating defaults`);
      return createDefaultTees();
    }
    
    console.log(`Successfully loaded and validated ${validatedTees.length} tees for course ID: ${courseId}`);
    
    // Save the validated tees back to localStorage
    courseDetails.tees = validatedTees;
    localStorage.setItem(courseDetailsKey, JSON.stringify(courseDetails));
    
    return validatedTees;
  } catch (error) {
    console.error(`Error loading tees for course ID: ${courseId}`, error);
    return createDefaultTees();
  }
}

// Helper function to create default tees
function createDefaultTees(): any[] {
  const defaultHoles = Array(18).fill(null).map((_, idx) => ({
    number: idx + 1,
    par: 4,
    yards: 400,
    handicap: idx + 1
  }));
  
  const defaultTeeId = `tee-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  const defaultTee = {
    id: defaultTeeId,
    name: 'White',
    rating: 72,
    slope: 113,
    par: 72,
    gender: 'male',
    originalIndex: 0,
    holes: defaultHoles
  };
  
  console.log('Created default tee:', defaultTee);
  
  return [defaultTee];
}
