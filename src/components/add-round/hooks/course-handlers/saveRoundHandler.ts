
import { supabase } from "@/integrations/supabase/client";
import { UseCourseHandlersProps } from "./types";

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
      
      const selectedTee = selectedCourse.tees.find(tee => tee.id === selectedTeeId);
      if (!selectedTee) throw new Error('Selected tee not found');
      
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
      console.log("Selected tee for saving:", selectedTee);
      
      const { data, error } = await supabase
        .from('rounds')
        .insert([
          {
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
          }
        ]);
        
      if (error) {
        console.error("Error saving round:", error);
        throw error;
      }
      
      console.log("Round saved successfully:", data);
      
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
