
import { TeeBox, CourseDetail } from './types';

// Helper function to process tees from different API response formats
export function processTees(courseData: any): { male?: TeeBox[], female?: TeeBox[] } {
  if (courseData.tees) {
    return courseData.tees;
  }
  
  // If the API has a different structure for tees, try to map it
  const maleTees: TeeBox[] = [];
  const femaleTees: TeeBox[] = [];
  
  // Check for teeBoxes array
  if (courseData.teeBoxes && Array.isArray(courseData.teeBoxes)) {
    courseData.teeBoxes.forEach((teeBox: any, index: number) => {
      const isFemale = teeBox.teeType === 'ladies' || 
                      teeBox.gender === 'female' || 
                      teeBox.teeColor?.toLowerCase() === 'red';
      
      const newTeeBox: TeeBox = {
        tee_name: teeBox.tee_name || teeBox.teeName || teeBox.teeType || `Tee ${index + 1}`,
        tee_color: teeBox.teeColor || (isFemale ? 'red' : ['blue', 'white', 'yellow', 'black', 'gold'][index % 5]),
        course_rating: teeBox.course_rating || teeBox.courseRating || teeBox.rating || 72,
        slope_rating: teeBox.slope_rating || teeBox.slopeRating || teeBox.slope || 113,
        bogey_rating: teeBox.bogey_rating || teeBox.bogeyRating,
        par_total: teeBox.par_total || teeBox.totalPar || 72,
        total_yards: teeBox.total_yards || teeBox.totalYards || 6500,
        total_meters: teeBox.total_meters || teeBox.totalMeters,
        number_of_holes: teeBox.number_of_holes || teeBox.numberOfHoles || 18,
        front_course_rating: teeBox.front_course_rating || teeBox.frontCourseRating,
        front_slope_rating: teeBox.front_slope_rating || teeBox.frontSlopeRating,
        front_bogey_rating: teeBox.front_bogey_rating || teeBox.frontBogeyRating,
        back_course_rating: teeBox.back_course_rating || teeBox.backCourseRating,
        back_slope_rating: teeBox.back_slope_rating || teeBox.backSlopeRating,
        back_bogey_rating: teeBox.back_bogey_rating || teeBox.backBogeyRating,
        holes: processTeeHoles(teeBox.holes)
      };
      
      if (isFemale) {
        femaleTees.push(newTeeBox);
      } else {
        maleTees.push(newTeeBox);
      }
    });
  }
  
  return {
    male: maleTees.length > 0 ? maleTees : undefined,
    female: femaleTees.length > 0 ? femaleTees : undefined
  };
}

// Process hole data to match our expected format
export function processTeeHoles(holes: any[] | undefined): Array<{ number?: number, par?: number, yardage?: number, handicap?: number }> {
  if (!holes || !Array.isArray(holes)) {
    return [];
  }
  
  return holes.map((hole, idx) => ({
    number: hole.number || hole.holeNumber || idx + 1,
    par: hole.par || 4,
    yardage: hole.yardage || hole.yards || 400,
    handicap: hole.handicap || hole.hcp || hole.strokeIndex || idx + 1
  }));
}
