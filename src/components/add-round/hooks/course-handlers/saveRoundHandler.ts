
import { supabase } from "@/integrations/supabase";
import { UseCourseHandlersProps } from "./types";
import { ensureCourseExists, findOrCreateCourseByApiId } from "@/integrations/supabase";
import { getCourseTeesByIdFromDatabase } from "@/integrations/supabase/course/course-db-operations";

export function createSaveRoundHandler({
  selectedCourse,
  roundDate,
  selectedTeeId,
  scores,
  setIsLoading,
  toast,
  queryClient
}: Pick<UseCourseHandlersProps, 
  'selectedCourse' | 
  'roundDate' | 
  'selectedTeeId' | 
  'scores' | 
  'setIsLoading' | 
  'toast' | 
  'queryClient'
>) {
  
  const handleSaveRound = async (): Promise<boolean> => {
    if (!selectedCourse) {
      toast.toast({
        title: "Error",
        description: "No course selected.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!roundDate) {
      toast.toast({
        title: "Error",
        description: "Please select a date.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!selectedTeeId) {
      toast.toast({
        title: "Error",
        description: "No tee selected.",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');
      
      // Get the selected tee information
      const selectedTee = selectedCourse.tees.find(tee => tee.id === selectedTeeId);
      if (!selectedTee) {
        console.error('BUG: Selected tee not found in course tees array', {
          selectedTeeId,
          availableTees: selectedCourse.tees.map(t => ({ id: t.id, name: t.name }))
        });
        throw new Error('Selected tee not found');
      }
      
      // CRITICAL DEBUGGING: Log the exact tee information being used
      console.log("SAVING ROUND - CRITICAL TEE INFO:");
      console.log("Selected tee ID:", selectedTeeId);
      console.log("Selected tee object:", selectedTee);
      console.log("Selected tee name:", selectedTee.name);
      console.log("Tee name type:", typeof selectedTee.name);
      
      const totalStrokes = scores.reduce((sum, score) => sum + (score.strokes || 0), 0);
      const totalPar = scores.reduce((sum, score) => sum + score.par, 0);
      const toParGross = totalStrokes - totalPar;
      
      console.log("Ensuring course exists in database:", selectedCourse);
      let dbCourseId: number;
      
      // Fix for the Bentley Golf Club issue - normalize the course name
      const normalizedCourseName = selectedCourse.name.replace(/\s+/g, ' ').trim();
      const normalizedClubName = selectedCourse.clubName.replace(/\s+/g, ' ').trim();
      
      // Check if it's specifically Bentley Golf Club to apply special handling
      const isBentleyGolfClub = normalizedCourseName.toLowerCase().includes('bentley') || 
                               normalizedClubName.toLowerCase().includes('bentley');
      
      console.log(`Course name: "${normalizedCourseName}", Club name: "${normalizedClubName}"`);
      console.log(`Is Bentley Golf Club: ${isBentleyGolfClub}`);
      
      if (selectedCourse.apiCourseId) {
        // For API courses, use findOrCreateCourseByApiId to avoid duplicates
        console.log("Ensuring API course exists:", selectedCourse.apiCourseId);
        
        // Pass additional normalization flag for Bentley Golf Club
        const courseId = await findOrCreateCourseByApiId(
          selectedCourse.apiCourseId,
          normalizedCourseName, // Use normalized name
          normalizedClubName,   // Use normalized club name
          selectedCourse.city,
          selectedCourse.state,
          isBentleyGolfClub     // Pass the flag for special handling
        );
        
        if (!courseId) {
          throw new Error("Failed to find or create course in database");
        }
        
        dbCourseId = courseId;
        console.log("Using course_id for API course:", dbCourseId);
      } else {
        // For user-added courses, ensure the course exists
        console.log("Ensuring user-added course exists:", selectedCourse.id);
        
        // Use ensureCourseExists to avoid duplicates, with special handling for Bentley
        dbCourseId = await ensureCourseExists(
          selectedCourse.id,
          undefined,
          normalizedCourseName, // Use normalized name
          normalizedClubName,   // Use normalized club name
          selectedCourse.city,
          selectedCourse.state,
          isBentleyGolfClub     // Pass the flag for special handling
        );
        
        console.log("Using course_id for user-added course:", dbCourseId);
      }
      
      // CRITICAL FIX: Make sure we're using the selected tee, not another one
      console.log("Final selected tee for saving:", selectedTee);
      
      // CRITICAL FIX: Explicitly capture the exact tee name as a string value
      // Make sure we're using the exact name from the tee that was selected
      const teeName = String(selectedTee.name);
      const teeId = selectedTeeId;
      
      console.log(`FINAL TEE VALUES FOR SAVING:`);
      console.log(`- tee_name: "${teeName}" (${typeof teeName})`);
      console.log(`- tee_id: "${teeId}" (${typeof teeId})`);
      
      // Prepare the data we're sending to Supabase
      const roundData = {
        user_id: session.user.id,
        course_id: dbCourseId,
        date: roundDate.toISOString(),
        tee_name: teeName,
        tee_id: teeId,
        gross_score: totalStrokes,
        to_par_gross: toParGross,
        net_score: null,
        to_par_net: null,
        hole_scores: JSON.stringify(scores)
      };
      
      console.log("Saving round data:", roundData);
      
      // Insert the round into the database
      const { data: round, error: roundError } = await supabase
        .from('rounds')
        .insert([roundData])
        .select('id, tee_name, tee_id')
        .single();
        
      if (roundError) {
        console.error("Error inserting round:", roundError);
        throw new Error(`Failed to save round: ${roundError.message}`);
      }
      
      if (!round) {
        throw new Error("Failed to save round, no round ID returned");
      }
      
      console.log("Round saved successfully:", round);
      console.log(`Saved tee_name: "${round.tee_name}" and tee_id: "${round.tee_id}"`);
      
      // Invalidate queries to refresh data in UI
      queryClient.invalidateQueries({ queryKey: ['userRounds'] });
      
      toast.toast({
        title: "Success",
        description: "Round saved successfully!",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error saving round:", error);
      toast.toast({
        title: "Error",
        description: error.message || "Failed to save round. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { handleSaveRound };
}
