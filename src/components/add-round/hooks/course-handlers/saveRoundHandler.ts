
import { supabase } from "@/integrations/supabase";
import { UseCourseHandlersProps } from "./types";
import { QueryClient } from "@tanstack/react-query";

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
      
      console.log("=================== SAVING ROUND WITH TEE ===================");
      console.log("Selected tee ID to save:", selectedTeeId);
      console.log("Selected tee object to save:", selectedTee);
      console.log("Selected tee name to save:", selectedTee.name);
      console.log("Available tees in course at save time:", selectedCourse.tees.map(t => ({ id: t.id, name: t.name })));
      
      const totalStrokes = scores.reduce((sum, score) => sum + (score.strokes || 0), 0);
      const totalPar = scores.reduce((sum, score) => sum + score.par, 0);
      const toParGross = totalStrokes - totalPar;
      
      console.log("Ensuring course exists in database:", selectedCourse);
      let dbCourseId = selectedCourse.id;
      
      if (selectedCourse.apiCourseId) {
        const { data: existingCourseData, error: findError } = await supabase
          .from('courses')
          .select('id')
          .eq('api_course_id', selectedCourse.apiCourseId)
          .maybeSingle();
          
        if (findError) {
          console.error("Error checking for existing course:", findError);
        }
        
        if (existingCourseData && existingCourseData.id) {
          console.log("Found existing course in database:", existingCourseData);
          dbCourseId = existingCourseData.id;
        } else {
          const { data: insertedCourse, error: insertError } = await supabase
            .from('courses')
            .insert([{
              name: `${selectedCourse.clubName} - ${selectedCourse.name}`,
              city: selectedCourse.city || '',
              state: selectedCourse.state || '',
              api_course_id: selectedCourse.apiCourseId,
              user_id: session.user.id
            }])
            .select('id')
            .single();
            
          if (insertError) {
            console.error("Error inserting course:", insertError);
            throw new Error(`Failed to insert course: ${insertError.message}`);
          }
          
          if (!insertedCourse) {
            throw new Error("Failed to insert course, no course ID returned");
          }
          
          console.log("Course inserted successfully:", insertedCourse);
          dbCourseId = insertedCourse.id;
        }
      } else {
        console.log("Verifying user-added course exists:", dbCourseId);
        const { data: courseCheck, error: checkError } = await supabase
          .from('courses')
          .select('id')
          .eq('id', dbCourseId)
          .maybeSingle();
          
        if (checkError) {
          console.error("Error checking course existence:", checkError);
        }
        
        if (!courseCheck) {
          throw new Error(`Course with ID ${dbCourseId} not found in database`);
        }
        
        console.log("User-added course verified:", courseCheck);
      }
      
      console.log("Using course_id for round insertion:", dbCourseId);
      console.log("Final selected tee for saving:", selectedTee);
      
      // FIX 2: Ensure we save the actual tee information correctly
      // First, get both tee ID and tee name to ensure they are properly linked
      const teeName = selectedTee.name;
      
      // Prepare the data we're sending to Supabase
      const roundData = {
        user_id: session.user.id,
        course_id: dbCourseId,
        date: roundDate.toISOString(),
        tee_name: teeName, // Explicitly use the name from the selected tee
        tee_id: selectedTeeId,  // Explicitly save the tee ID
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
        .select('id')
        .single();
        
      if (roundError) {
        console.error("Error inserting round:", roundError);
        throw new Error(`Failed to save round: ${roundError.message}`);
      }
      
      if (!round) {
        throw new Error("Failed to save round, no round ID returned");
      }
      
      console.log("Round saved successfully:", round);
      
      // Invalidate queries to refresh data in UI
      queryClient.invalidateQueries({ queryKey: ['userRounds'] });
      
      // Update local storage for user-added courses if needed
      if (selectedCourse.isUserAdded) {
        try {
          const courseDetailsKey = `course_details_${selectedCourse.id}`;
          const storedDetails = localStorage.getItem(courseDetailsKey);
          
          if (storedDetails) {
            const courseDetails = JSON.parse(storedDetails);
            // Ensure the tee information is correct in localStorage
            if (courseDetails.tees && Array.isArray(courseDetails.tees)) {
              // Make sure the selected tee is included with correct information
              const teeIndex = courseDetails.tees.findIndex((t: any) => t.id === selectedTeeId);
              if (teeIndex >= 0) {
                // Update the existing tee if needed
                if (!courseDetails.tees[teeIndex].par) {
                  courseDetails.tees[teeIndex].par = selectedTee.par;
                }
              }
            }
            localStorage.setItem(courseDetailsKey, JSON.stringify(courseDetails));
            console.log("Updated user-added course details in localStorage");
          }
        } catch (e) {
          console.error("Error updating localStorage for user-added course:", e);
        }
      }
      
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
