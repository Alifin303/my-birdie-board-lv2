import { supabase } from "@/integrations/supabase/client";
import { UseCourseHandlersProps } from "./types";

export function createSaveRoundHandler({
  selectedCourse,
  roundDate,
  selectedTeeId,
  scores,
  setIsLoading,
  toast,
  queryClient,
  lastTeeChangeTimestamp
}: Pick<UseCourseHandlersProps, 
  'selectedCourse' | 
  'roundDate' | 
  'selectedTeeId' | 
  'scores' | 
  'setIsLoading' | 
  'toast' | 
  'queryClient'
> & { lastTeeChangeTimestamp?: number }) {
  
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
      console.log("Saving round with:", { 
        courseId: selectedCourse.id, 
        selectedTeeId, 
        selectedTeeName: selectedTee.name 
      });
      
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
              api_course_id: selectedCourse.apiCourseId
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
        hole_scores: JSON.stringify(scores)
      };
      
      console.log("Final round data being sent to Supabase:", roundData);
      console.log("CRITICAL CHECK - tee_name in roundData:", roundData.tee_name);
      console.log("CRITICAL CHECK - tee_id in roundData:", roundData.tee_id);
        
      const { data, error } = await supabase
        .from('rounds')
        .insert([roundData])
        .select();
        
      if (error) {
        console.error("Error saving round:", error);
        throw error;
      }
      
      console.log("Round saved successfully to Supabase:", data);
      console.log("Saved round tee_name:", data[0].tee_name);
      console.log("Saved round tee_id:", data[0].tee_id);
      console.log("=================== END SAVING ROUND ===================");
      
      toast.toast({
        title: "Success",
        description: "Round saved successfully!",
      });
      
      queryClient.invalidateQueries({ queryKey: ['userRounds'] });
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
