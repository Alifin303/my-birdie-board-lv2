
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
    if (!selectedCourse || !selectedTeeId) {
      toast.toast({
        title: "Error",
        description: "Required course or tee information is missing.",
        variant: "destructive",
      });
      return false;
    }
    
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');
      
      // Find the selected tee using the current selectedTeeId from props
      console.log("Looking for tee with ID:", selectedTeeId);
      console.log("Available tees:", selectedCourse.tees.map(t => ({ id: t.id, name: t.name })));
      
      const selectedTee = selectedCourse.tees.find(tee => tee.id === selectedTeeId);
      if (!selectedTee) {
        console.error('CRITICAL ERROR: Selected tee not found in course tees array', {
          selectedTeeId,
          availableTees: selectedCourse.tees.map(t => ({ id: t.id, name: t.name }))
        });
        throw new Error('Selected tee not found - this is a critical error');
      }
      
      console.log("SAVING ROUND - CRITICAL TEE INFO:");
      console.log("Selected tee ID:", selectedTeeId);
      console.log("Selected tee object:", selectedTee);
      console.log("Selected tee name:", selectedTee.name);
      console.log("Tee name type:", typeof selectedTee.name);
      
      const totalStrokes = scores.reduce((sum, score) => sum + (score.strokes || 0), 0);
      const totalPar = scores.reduce((sum, score) => sum + score.par, 0);
      const toParGross = totalStrokes - totalPar;
      
      // Get the user's handicap to calculate net score
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('handicap')
        .eq('id', session.user.id)
        .single();
        
      if (userError) {
        console.error("Error fetching user handicap:", userError);
      }
      
      const handicapIndex = userData?.handicap || 0;
      
      // Calculate net score and to par net
      const netScore = Math.max(0, totalStrokes - handicapIndex);
      const toParNet = netScore - totalPar;
      
      console.log("Ensuring course exists in database:", selectedCourse);
      let dbCourseId: number;
      
      const normalizedCourseName = selectedCourse.name.replace(/\s+/g, ' ').trim();
      const normalizedClubName = selectedCourse.clubName.replace(/\s+/g, ' ').trim();
      
      console.log(`Course name: "${normalizedCourseName}", Club name: "${normalizedClubName}"`);
      
      if (selectedCourse.apiCourseId) {
        console.log("Ensuring API course exists:", selectedCourse.apiCourseId);
        
        const courseId = await findOrCreateCourseByApiId(
          selectedCourse.apiCourseId,
          normalizedCourseName,
          normalizedClubName,
          selectedCourse.city,
          selectedCourse.state,
          false // No special handling
        );
        
        if (!courseId) {
          throw new Error("Failed to find or create course in database");
        }
        
        dbCourseId = courseId;
        console.log("Using course_id for API course:", dbCourseId);
      } else {
        console.log("Ensuring user-added course exists:", selectedCourse.id);
        
        dbCourseId = await ensureCourseExists(
          selectedCourse.id,
          undefined,
          normalizedCourseName,
          normalizedClubName,
          selectedCourse.city,
          selectedCourse.state,
          false // No special handling
        );
        
        console.log("Using course_id for user-added course:", dbCourseId);
      }
      
      // Ensure we're using the correct tee
      console.log("Final selected tee for saving:", selectedTee);
      
      // Store the tee name and ID in constants to make debugging easier
      const teeName = String(selectedTee.name);
      const teeId = selectedTeeId;
      
      console.log(`FINAL TEE VALUES FOR SAVING:`);
      console.log(`- tee_name: "${teeName}" (${typeof teeName})`);
      console.log(`- tee_id: "${teeId}" (${typeof teeId})`);
      
      const roundData = {
        user_id: session.user.id,
        course_id: dbCourseId,
        date: roundDate.toISOString(),
        tee_name: teeName,
        tee_id: teeId,
        gross_score: totalStrokes,
        to_par_gross: toParGross,
        net_score: netScore,
        to_par_net: toParNet,
        hole_scores: JSON.stringify(scores)
      };
      
      console.log("Saving round data:", roundData);
      
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
