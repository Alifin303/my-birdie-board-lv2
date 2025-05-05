
import { supabase } from "@/integrations/supabase";
import { UseCourseHandlersProps } from "./types";
import { ensureCourseExists, findOrCreateCourseByApiId, updateUserHandicap } from "@/integrations/supabase";
import { getCourseTeesByIdFromDatabase } from "@/integrations/supabase/course/course-db-operations";
import { calculateNetScore } from "@/integrations/supabase";

export function createSaveRoundHandler({
  selectedCourse,
  roundDate,
  selectedTeeId,
  scores,
  setIsLoading,
  toast,
  queryClient,
  holeSelection
}: Pick<UseCourseHandlersProps, 
  'selectedCourse' | 
  'roundDate' | 
  'selectedTeeId' | 
  'scores' | 
  'setIsLoading' | 
  'toast' | 
  'queryClient' |
  'holeSelection'
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
    
    // Validate required scores based on hole selection
    let requiredHoles = [];
    
    if (holeSelection.type === 'front9') {
      requiredHoles = scores.filter(score => score.hole <= 9);
    } else if (holeSelection.type === 'back9') {
      requiredHoles = scores.filter(score => score.hole > 9);
    } else {
      requiredHoles = scores;
    }
    
    const missingScores = requiredHoles.filter(score => 
      score.strokes === null || 
      score.strokes === undefined || 
      score.strokes === 0
    );
    
    if (missingScores.length > 0) {
      const holeNumbers = missingScores.map(s => s.hole).join(', ');
      let errorMessage = `Please enter scores for hole${missingScores.length > 1 ? 's' : ''}: ${holeNumbers}`;
      
      // Always add guidance about 9-hole selection
      if (holeSelection.type === 'all') {
        errorMessage += ". If you only played 9 holes, select 'Front 9' or 'Back 9' to save a 9-hole round.";
      }
      
      toast.toast({
        title: "Missing scores",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Try to scroll to the error message on mobile
      const isMobile = window.innerWidth < 640;
      if (isMobile) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      
      return false;
    }
    
    setIsLoading(true);
    
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error(`Authentication error: ${sessionError.message}`);
      }
      
      if (!sessionData.session) {
        console.error("No active session found");
        throw new Error("You need to be logged in to save rounds. Please log in and try again.");
      }
      
      const session = sessionData.session;
      
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
      
      let holesPlayed = 18; // Default to 18 holes
      if (holeSelection.type === 'front9' || holeSelection.type === 'back9') {
        holesPlayed = 9;
      } else if (holeSelection.type === 'custom' && holeSelection.startHole && holeSelection.endHole) {
        holesPlayed = (holeSelection.endHole - holeSelection.startHole + 1);
        holesPlayed = Math.min(holesPlayed, 18);
      }
      
      console.log(`Saving a ${holesPlayed}-hole round`, holeSelection);
      
      const totalStrokes = scores.reduce((sum, score) => sum + (score.strokes || 0), 0);
      const totalPar = scores.reduce((sum, score) => sum + score.par, 0);
      const toParGross = totalStrokes - totalPar;
      
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('handicap')
        .eq('id', session.user.id)
        .single();
        
      if (userError) {
        console.error("Error fetching user handicap:", userError);
      }
      
      const handicapIndex = userData?.handicap || 0;
      
      const scaledHandicapForNetScore = holesPlayed === 9 ? handicapIndex / 2 : handicapIndex;
      
      console.log("User handicap for net score calculation:", handicapIndex, typeof handicapIndex);
      console.log("Scaled handicap for this round (9 or 18 holes):", scaledHandicapForNetScore);
      
      const netScore = calculateNetScore(totalStrokes, scaledHandicapForNetScore);
      const toParNet = netScore - totalPar;
      
      console.log("Calculated scores:", {
        grossScore: totalStrokes,
        netScore: netScore,
        toParGross: toParGross,
        toParNet: toParNet,
        holesPlayed: holesPlayed,
        scaledHandicap: scaledHandicapForNetScore
      });
      
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
          false
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
          false
        );
        
        console.log("Using course_id for user-added course:", dbCourseId);
      }
      
      console.log("Final selected tee for saving:", selectedTee);
      
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
        hole_scores: JSON.stringify(scores),
        handicap_at_posting: handicapIndex,
        holes_played: holesPlayed
      };
      
      console.log("Saving round data:", roundData);
      
      const { data: round, error: roundError } = await supabase
        .from('rounds')
        .insert([roundData])
        .select('id, tee_name, tee_id, holes_played')
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
      
      const { data: userRounds, error: userRoundsError } = await supabase
        .from('rounds')
        .select('gross_score, holes_played')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false });
        
      if (userRoundsError) {
        console.error("Error fetching user rounds for handicap update:", userRoundsError);
      } else if (userRounds && userRounds.length > 0) {
        const grossScores = userRounds.map(r => r.gross_score);
        const holeCounts = userRounds.map(r => r.holes_played || 18);
        
        console.log("Updating handicap based on rounds:", grossScores);
        console.log("Hole counts for rounds:", holeCounts);
        
        const newHandicap = await updateUserHandicap(session.user.id, grossScores, holeCounts);
        console.log("Updated handicap to:", newHandicap);
        
        toast.toast({
          title: "Handicap Updated",
          description: `Your handicap index is now ${newHandicap.toFixed(1)}`,
        });
      }
      
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
