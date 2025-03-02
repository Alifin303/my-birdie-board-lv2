
import { supabase } from "@/integrations/supabase/client";
import { UseCourseHandlersProps } from "./types";

export function createSaveRoundHandler({
  selectedCourse,
  selectedTeeId,
  roundDate,
  scores,
  setIsLoading,
  toast,
  queryClient,
  lastTeeChangeTimestamp
}: Pick<UseCourseHandlersProps, 
  'selectedCourse' | 
  'selectedTeeId' | 
  'roundDate' | 
  'scores' | 
  'setIsLoading' | 
  'toast' | 
  'queryClient'
> & { lastTeeChangeTimestamp?: number }) {
  
  const handleSaveRound = async (): Promise<boolean> => {
    if (!selectedCourse) {
      toast.toast({
        title: "Error",
        description: "Please select a course first",
        variant: "destructive",
      });
      return false;
    }
    
    if (!roundDate) {
      toast.toast({
        title: "Error",
        description: "Please select a date for your round",
        variant: "destructive",
      });
      return false;
    }
    
    // Validate that all holes have strokes entered
    const incompleteScores = scores.some(score => score.strokes === 0 || score.strokes === undefined);
    if (incompleteScores) {
      toast.toast({
        title: "Incomplete Scorecard",
        description: "Please enter scores for all holes",
        variant: "destructive",
      });
      return false;
    }
    
    // Start the loading state
    setIsLoading(true);
    
    try {
      // Check for logged in user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        throw new Error("You must be logged in to save a round");
      }
      
      // Get selected tee information
      if (!selectedTeeId) {
        console.error('No tee selected');
        throw new Error('No tee selected');
      }
      
      const selectedTee = selectedCourse.tees.find(tee => tee.id === selectedTeeId);
      if (!selectedTee) {
        console.error('BUG: Selected tee not found in course tees array', {
          selectedTeeId,
          availableTees: selectedCourse.tees.map(t => ({ id: t.id, name: t.name })),
          lastTeeChangeTime: lastTeeChangeTimestamp ? new Date(lastTeeChangeTimestamp).toISOString() : "Not available"
        });
        throw new Error('Selected tee not found');
      }
      
      console.log("=================== SAVING ROUND WITH TEE ===================");
      console.log("Selected tee ID to save:", selectedTeeId);
      console.log("Last tee change timestamp:", lastTeeChangeTimestamp ? new Date(lastTeeChangeTimestamp).toISOString() : "Not available");
      console.log("Selected tee object to save:", selectedTee);
      console.log("Selected tee name to save:", selectedTee.name);
      console.log("Available tees in course at save time:", selectedCourse.tees.map(t => ({ id: t.id, name: t.name })));
      console.log("===========================================================");
      
      // Calculate total score and stats
      const totalStrokes = scores.reduce((total, score) => total + (score.strokes || 0), 0);
      const totalPar = scores.reduce((total, score) => total + score.par, 0);
      const toParGross = totalStrokes - totalPar;
      
      // Determine if we need to create or fetch the course in the database
      let dbCourseId: number;
      
      if (selectedCourse.isUserAdded && typeof selectedCourse.id === "number") {
        console.log("Course is user-added, using existing course ID");
        dbCourseId = selectedCourse.id; 
      } else {
        // Check if the course exists in our database first
        console.log("Checking if this course already exists in our database");
        const apiCourseId = selectedCourse.apiCourseId || selectedCourse.id.toString();
        
        console.log("Looking up course with API ID:", apiCourseId);
        const { data: existingCourses, error: lookupError } = await supabase
          .from('golf_courses')
          .select('id')
          .eq('api_course_id', apiCourseId)
          .limit(1);
        
        if (lookupError) {
          console.error("Error looking up course:", lookupError);
          throw new Error("Error looking up course: " + lookupError.message);
        }
        
        if (existingCourses && existingCourses.length > 0) {
          console.log("Course already exists in database, using existing ID:", existingCourses[0].id);
          dbCourseId = existingCourses[0].id;
        } else {
          console.log("Course doesn't exist yet, creating new record");
          
          const { data: newCourse, error: createError } = await supabase
            .from('golf_courses')
            .insert({
              club_name: selectedCourse.clubName,
              course_name: selectedCourse.name,
              city: selectedCourse.city || null,
              state: selectedCourse.state || null,
              country: 'United States',
              api_course_id: apiCourseId,
              is_user_added: false,
              hole_count: scores.length
            })
            .select('id')
            .single();
          
          if (createError) {
            console.error("Error creating course:", createError);
            throw new Error("Error creating course: " + createError.message);
          }
          
          console.log("Created new course in database:", newCourse);
          dbCourseId = newCourse.id;
        }
      }
      
      console.log("Using course_id for round insertion:", dbCourseId);
      console.log("Final selected tee for saving:", selectedTee);
      
      const roundData = {
        user_id: session.user.id,
        course_id: dbCourseId,
        date: roundDate.toISOString(),
        tee_name: selectedTee.name,
        tee_id: selectedTeeId,
        gross_score: totalStrokes,
        to_par_gross: toParGross,
        net_score: null,
        to_par_net: null,
        hole_count: scores.length
      };
      
      console.log("Inserting round data:", roundData);
      
      // Insert the round
      const { data: newRound, error: roundError } = await supabase
        .from('golf_rounds')
        .insert(roundData)
        .select('id')
        .single();
      
      if (roundError) {
        console.error("Error saving round:", roundError);
        throw new Error("Error saving round: " + roundError.message);
      }
      
      console.log("Round saved successfully:", newRound);
      
      // Now save the hole scores
      const holeScores = scores.map(score => ({
        round_id: newRound.id,
        hole_number: score.hole,
        par: score.par,
        strokes: score.strokes || 0,
        putts: score.putts || null
      }));
      
      console.log("Saving hole scores:", holeScores);
      
      const { error: scoresError } = await supabase
        .from('hole_scores')
        .insert(holeScores);
      
      if (scoresError) {
        console.error("Error saving hole scores:", scoresError);
        throw new Error("Error saving hole scores: " + scoresError.message);
      }
      
      console.log("Hole scores saved successfully");
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['rounds'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      
      toast.toast({
        title: "Success",
        description: "Round saved successfully",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error saving round:", error);
      
      toast.toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return { handleSaveRound };
}
