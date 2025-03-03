
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
      
      // First, check if the course exists in the database 
      // and create it if it doesn't exist or get the correct ID
      let courseDbId;
      try {
        // First try to find by ID if it's a numeric ID (existing course)
        if (!isNaN(Number(selectedCourse.id)) && Number(selectedCourse.id) > 0) {
          // Check if course exists with this ID
          const { data: existingCourse } = await supabase
            .from('courses')
            .select('id, name')
            .eq('id', selectedCourse.id)
            .maybeSingle();
            
          if (existingCourse) {
            courseDbId = existingCourse.id;
            console.log("Using existing course with ID:", courseDbId);
          }
        }
        
        // If we didn't find by ID, try by API course ID
        if (!courseDbId && selectedCourse.apiCourseId) {
          const { data: apiIdCourse } = await supabase
            .from('courses')
            .select('id')
            .eq('api_course_id', selectedCourse.apiCourseId)
            .maybeSingle();
            
          if (apiIdCourse) {
            courseDbId = apiIdCourse.id;
            console.log("Found existing course by API ID:", courseDbId);
          }
        }
        
        // If we still don't have a course, create a new one
        if (!courseDbId) {
          console.log("Creating new course:", selectedCourse.name);
          
          const { data: newCourse, error: insertError } = await supabase
            .from('courses')
            .insert({
              name: selectedCourse.name || selectedCourse.clubName || 'Unknown Course',
              city: selectedCourse.city,
              state: selectedCourse.state,
              api_course_id: selectedCourse.apiCourseId,
              user_id: session.user.id
            })
            .select('id')
            .single();
            
          if (insertError) {
            console.error("Error creating course:", insertError);
            throw new Error("Failed to create course: " + insertError.message);
          }
          
          if (newCourse) {
            courseDbId = newCourse.id;
            console.log("Created new course with ID:", courseDbId);
            
            // Save course details to localStorage for future use
            try {
              const courseDetails = {
                ...selectedCourse,
                id: courseDbId
              };
              localStorage.setItem(`course_details_${courseDbId}`, JSON.stringify(courseDetails));
              console.log("Saved course details to localStorage for ID:", courseDbId);
            } catch (e) {
              console.warn("Could not save course details to localStorage:", e);
            }
          } else {
            throw new Error("Failed to create course - no ID returned");
          }
        }
      } catch (courseError) {
        console.error("Error ensuring course exists:", courseError);
        throw new Error("Unable to save round - course data could not be verified");
      }
      
      if (!courseDbId) {
        throw new Error("Could not verify or create course in database");
      }
      
      // Insert round into database with the verified course ID and tee information
      const { data: roundData, error } = await supabase
        .from('rounds')
        .insert({
          user_id: session.user.id,
          course_id: courseDbId,  // Use the verified course ID
          date: roundDate.toISOString(),
          gross_score: totalStrokes,
          to_par_gross: toPar,
          tee_id: selectedTeeId,  // Save the tee ID
          tee_name: selectedTee.name,  // Save the tee name
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
