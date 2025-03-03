
import { supabase } from "@/integrations/supabase";
import { UseCourseHandlersProps } from "./types";
import { ensureCourseExists, findOrCreateCourseByApiId } from "@/integrations/supabase";

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
      
      console.log("Final selected tee for saving:", selectedTee);
      
      // Explicitly capture both tee ID and tee name for storage
      const teeName = selectedTee.name;
      const teeId = selectedTeeId;
      
      console.log(`Saving round with tee_name: "${teeName}" and tee_id: "${teeId}"`);
      
      // Prepare the data we're sending to Supabase
      const roundData = {
        user_id: session.user.id,
        course_id: dbCourseId,
        date: roundDate.toISOString(),
        tee_name: teeName, // Save the exact tee name
        tee_id: teeId,     // Save the exact tee ID
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
