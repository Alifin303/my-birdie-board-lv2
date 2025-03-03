
import { supabase, logSupabaseOperation } from '../core/client';
import { TeeData, HoleData } from '@/components/course-form/types';

// Save course tees and holes to the database
export async function saveCourseTeesToDatabase(
  courseId: number,
  tees: TeeData[]
): Promise<boolean> {
  logSupabaseOperation('saveCourseTeesToDatabase', { courseId, teesCount: tees.length });
  
  try {
    // For each tee, insert the tee data and then its holes
    for (const tee of tees) {
      const { data: teeData, error: teeError } = await supabase
        .from('course_tees')
        .insert({
          course_id: courseId,
          tee_id: tee.id,
          name: tee.name,
          color: tee.color,
          gender: tee.gender,
          rating: tee.rating || 72,
          slope: tee.slope || 113,
          par: tee.par,
          yards: tee.holes?.reduce((sum, hole) => sum + (hole.yards || 0), 0) || 0
        })
        .select('id')
        .single();
        
      if (teeError) {
        console.error("Error saving tee to database:", teeError);
        continue;
      }
      
      if (!teeData || !teeData.id) {
        console.error("No tee ID returned from database");
        continue;
      }
      
      // Insert holes for this tee
      if (tee.holes && tee.holes.length > 0) {
        const holesData = tee.holes.map(hole => ({
          tee_id: teeData.id,
          hole_number: hole.number,
          par: hole.par,
          yards: hole.yards,
          handicap: hole.handicap
        }));
        
        const { error: holesError } = await supabase
          .from('course_holes')
          .insert(holesData);
          
        if (holesError) {
          console.error("Error saving holes to database:", holesError);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error("Exception in saveCourseTeesToDatabase:", error);
    return false;
  }
}

// Retrieve course tees and holes from the database
export async function getCourseTeesByIdFromDatabase(courseId: number): Promise<TeeData[]> {
  logSupabaseOperation('getCourseTeesByIdFromDatabase', { courseId });
  
  try {
    // Get all tees for this course
    const { data: tees, error: teesError } = await supabase
      .from('course_tees')
      .select('*')
      .eq('course_id', courseId);
      
    if (teesError) {
      console.error("Error fetching tees from database:", teesError);
      return [];
    }
    
    if (!tees || tees.length === 0) {
      console.log("No tees found for course:", courseId);
      return [];
    }
    
    // For each tee, fetch its holes
    const teesWithHoles: TeeData[] = [];
    
    for (const tee of tees) {
      const { data: holes, error: holesError } = await supabase
        .from('course_holes')
        .select('*')
        .eq('tee_id', tee.id)
        .order('hole_number', { ascending: true });
        
      if (holesError) {
        console.error("Error fetching holes for tee:", tee.id, holesError);
        continue;
      }
      
      // Map database tee and holes to TeeData format
      const formattedHoles: HoleData[] = (holes || []).map(hole => ({
        number: hole.hole_number,
        par: hole.par,
        yards: hole.yards || 0,
        handicap: hole.handicap || 0
      }));
      
      // If we have less than 18 holes, fill in the missing ones
      if (formattedHoles.length < 18) {
        const existingHoleNumbers = formattedHoles.map(h => h.number);
        for (let i = 1; i <= 18; i++) {
          if (!existingHoleNumbers.includes(i)) {
            formattedHoles.push({
              number: i,
              par: 4,
              yards: 350,
              handicap: i
            });
          }
        }
        // Sort by hole number
        formattedHoles.sort((a, b) => a.number - b.number);
      }
      
      teesWithHoles.push({
        id: tee.tee_id,
        name: tee.name,
        color: tee.color || '#FFFFFF',
        gender: tee.gender as 'male' | 'female' || 'male',
        rating: tee.rating,
        slope: tee.slope,
        par: tee.par,
        holes: formattedHoles
      });
    }
    
    return teesWithHoles;
  } catch (error) {
    console.error("Exception in getCourseTeesByIdFromDatabase:", error);
    return [];
  }
}

// Delete all tees for a course (used when updating a course)
export async function deleteCourseTees(courseId: number): Promise<boolean> {
  logSupabaseOperation('deleteCourseTees', { courseId });
  
  try {
    // The holes will be deleted automatically due to the CASCADE constraint
    const { error } = await supabase
      .from('course_tees')
      .delete()
      .eq('course_id', courseId);
      
    if (error) {
      console.error("Error deleting tees for course:", courseId, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception in deleteCourseTees:", error);
    return false;
  }
}
