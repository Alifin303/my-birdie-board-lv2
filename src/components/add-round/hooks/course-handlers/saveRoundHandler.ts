
import { supabase } from "@/integrations/supabase";
import { UseCourseHandlersProps } from "./types";
import { ensureCourseExists } from "@/integrations/supabase/course/course-operations";

export function createSaveRoundHandler({
  toast,
  queryClient,
  scores,
  roundDate,
  selectedCourse,
  selectedTeeId,
  holeSelection,
  courseAndTeeReady,
  setIsLoading
}: Pick<UseCourseHandlersProps, 
  'toast' | 
  'queryClient' | 
  'scores' | 
  'roundDate' | 
  'selectedCourse' | 
  'selectedTeeId' | 
  'holeSelection' |
  'courseAndTeeReady' |
  'setIsLoading'
>) {

  const handleSaveRound = async (): Promise<boolean> => {
    if (!selectedCourse || !scores || !roundDate) {
      toast.toast({
        title: "Missing information",
        description: "Please ensure all fields are filled out correctly.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!courseAndTeeReady) {
      console.error("Cannot save round - course and tee data not fully loaded");
      toast.toast({
        title: "Error",
        description: "Course data not fully loaded. Please try selecting the course again.",
        variant: "destructive",
      });
      return false;
    }
    
    // Validate the selected tee
    if (!selectedTeeId) {
      console.error("Cannot save round - no tee selected");
      toast.toast({
        title: "Missing tee information",
        description: "Please select a tee box before saving the round.",
        variant: "destructive",
      });
      return false;
    }
    
    // Find the selected tee
    const selectedTee = selectedCourse.tees.find(tee => tee.id === selectedTeeId);
    
    if (!selectedTee) {
      console.error("Cannot save round - selected tee not found in course data");
      toast.toast({
        title: "Error",
        description: "Selected tee not found in course data. Please try selecting a different tee.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setIsLoading(true);
      
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("You must be logged in to save rounds");
      }
      
      // Calculate totals
      const totalStrokes = scores.reduce((sum, score) => sum + (score.strokes || 0), 0);
      const totalPar = scores.reduce((sum, score) => sum + score.par, 0);
      const toPar = totalStrokes - totalPar;
      
      // Debug the tee data being saved
      console.log("Saving round with tee data:", {
        id: selectedTeeId,
        name: selectedTee.name,
        par: selectedTee.par,
        rating: selectedTee.rating,
        slope: selectedTee.slope
      });
      
      console.log("Selected course data:", {
        id: selectedCourse.id,
        name: selectedCourse.name,
        clubName: selectedCourse.clubName,
        isUserAdded: selectedCourse.isUserAdded
      });
      
      // We need to ensure the course exists in the database before saving the round
      let courseId;
      try {
        // First, try to fetch the course directly (most efficient)
        const { data, error } = await supabase
          .from('courses')
          .select('id')
          .eq('id', selectedCourse.id)
          .maybeSingle();
          
        if (data && data.id) {
          // Course exists, use its ID
          courseId = data.id;
          console.log("Course verified to exist with ID:", courseId);
        } else {
          // Course doesn't exist, need to create it
          console.log("Course not found in database, will create it:", selectedCourse.id);
          
          // For user-added courses, we need to create a new entry
          // IMPORTANT: We don't try to use the original ID since that might conflict
          const newCourseId = await ensureCourseExists(
            0, // Using 0 forces creation of a new course with auto-generated ID
            selectedCourse.apiCourseId,
            selectedCourse.name,
            selectedCourse.clubName,
            selectedCourse.city,
            selectedCourse.state
          );
          
          courseId = newCourseId;
          console.log("Created new course with ID:", courseId);
        }
      } catch (courseError) {
        console.error("Error ensuring course exists:", courseError);
        throw new Error("Unable to save round - course data could not be verified.");
      }
      
      if (!courseId) {
        throw new Error("Could not verify or create course in database.");
      }
      
      // Insert round into database
      const { data: roundData, error } = await supabase
        .from('rounds')
        .insert({
          user_id: session.user.id,
          course_id: courseId, // Use the verified course ID
          date: roundDate.toISOString(),
          gross_score: totalStrokes,
          to_par_gross: toPar,
          tee_id: selectedTeeId, 
          tee_name: selectedTee.name,
          hole_scores: JSON.stringify(scores)
        })
        .select()
        .single();
        
      if (error) {
        console.error("Database error saving round:", error);
        throw error;
      }
      
      // Refresh queries
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
