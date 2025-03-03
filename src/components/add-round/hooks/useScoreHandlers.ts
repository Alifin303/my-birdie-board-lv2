
import { 
  Score, 
  HoleSelection, 
  SimplifiedCourseDetail 
} from "../types";

interface UseScoreHandlersProps {
  selectedCourse: SimplifiedCourseDetail | null;
  scores: Score[];
  setScores: React.Dispatch<React.SetStateAction<Score[]>>;
  setActiveScoreTab: React.Dispatch<React.SetStateAction<"front9" | "back9">>;
  setHoleSelection: React.Dispatch<React.SetStateAction<HoleSelection>>;
  courseAndTeeReady?: boolean;
}

export function useScoreHandlers({
  selectedCourse,
  scores,
  setScores,
  setActiveScoreTab,
  setHoleSelection,
  courseAndTeeReady
}: UseScoreHandlersProps) {
  
  const getHolesForTee = (teeId: string) => {
    console.log("🚀 Getting holes for tee:", teeId);
    console.log("🔍 Course present:", !!selectedCourse);
    
    if (!selectedCourse) {
      console.error("❌ No course selected when getting holes for tee");
      return [];
    }
    
    console.log("✅ Using course:", selectedCourse.name, selectedCourse.id);
    
    if (!selectedCourse.tees || selectedCourse.tees.length === 0) {
      console.error("❌ No tees found for course:", selectedCourse.name);
      console.log("⚠️ Returning course default holes");
      return selectedCourse.holes || [];
    }
    
    const selectedTee = selectedCourse.tees.find(t => t.id === teeId);
    if (!selectedTee) {
      console.error(`❌ Tee with ID ${teeId} not found in course tees`);
      console.log("ℹ️ Available tees:", selectedCourse.tees.map(t => ({ id: t.id, name: t.name })));
      console.log("⚠️ Returning course default holes");
      return selectedCourse.holes || [];
    }
    
    console.log("✅ Found selected tee:", selectedTee.name, "with par:", selectedTee.par);
    
    // For user-added courses, the holes are directly on the tee
    if (selectedTee.holes && selectedTee.holes.length > 0) {
      console.log("✅ Using hole data specific to the selected tee:", selectedTee.holes);
      
      // Log the hole data for debugging
      console.log("📊 Par values for tee-specific holes:", 
        selectedTee.holes.map(h => ({ number: h.number, par: h.par || 4 })));
      
      // Validate par values and ensure each hole has a par value
      const validHoles = selectedTee.holes.map(hole => {
        if (!hole.par || hole.par < 2 || hole.par > 6) {
          console.log(`⚠️ Fixing invalid par value (${hole.par}) for hole ${hole.number}`);
          return { ...hole, par: 4 }; // Use a reasonable default
        }
        return hole;
      });
      
      // Calculate total par to validate
      const totalPar = validHoles.reduce((sum, hole) => sum + (hole.par || 4), 0);
      console.log(`📊 Calculated total par for tee ${selectedTee.name}: ${totalPar}`);
      
      // Update the tee's par if needed
      if (selectedTee.par !== totalPar) {
        console.log(`⚠️ Updating tee par from ${selectedTee.par} to ${totalPar} based on hole data`);
        selectedTee.par = totalPar;
      }
      
      return validHoles;
    }
    
    console.log("ℹ️ Tee doesn't have specific hole data, using course's default holes");
    // Fallback to course holes if available
    if (selectedCourse.holes && selectedCourse.holes.length > 0) {
      console.log("✅ Using course-level holes:", selectedCourse.holes);
      
      // Log the hole data for debugging
      console.log("📊 Par values for course-level holes:", 
        selectedCourse.holes.map(h => ({ number: h.number, par: h.par || 4 })));
      
      // Check for potential par data issues
      const anyInvalidPar = selectedCourse.holes.some(h => !h.par || h.par < 2 || h.par > 6);
      if (anyInvalidPar) {
        console.warn("⚠️ Some course holes have invalid par values, fixing them");
        return selectedCourse.holes.map(hole => ({
          ...hole,
          par: hole.par && hole.par >= 2 && hole.par <= 6 ? hole.par : 4
        }));
      }
      
      // Calculate total par for the course holes
      const totalCoursePar = selectedCourse.holes.reduce((sum, hole) => sum + (hole.par || 4), 0);
      console.log(`📊 Calculated total par from course holes: ${totalCoursePar}`);
      
      // Update the tee's par if needed
      if (selectedTee.par !== totalCoursePar) {
        console.log(`⚠️ Updating tee par from ${selectedTee.par} to ${totalCoursePar} based on course hole data`);
        selectedTee.par = totalCoursePar;
      }
      
      return selectedCourse.holes;
    }
    
    // Last resort: generate default holes
    console.warn("⚠️ No hole data found for course or tee, generating default holes");
    const defaultHoles = Array(18).fill(null).map((_, idx) => ({
      number: idx + 1,
      par: 4,
      yards: 400,
      handicap: idx + 1
    }));
    
    // Set default par for the tee based on generated holes
    const defaultPar = defaultHoles.reduce((sum, hole) => sum + hole.par, 0);
    console.log(`📊 Setting default par ${defaultPar} for tee ${selectedTee.name}`);
    selectedTee.par = defaultPar;
    
    return defaultHoles;
  };

  const updateScorecardForTee = (teeId: string, selection: HoleSelection = 'all') => {
    console.log("🚀 Updating scorecard for tee", teeId, "with selection", selection);
    console.log("🔍 Course present:", !!selectedCourse);
    console.log("🔍 Course and tee ready:", courseAndTeeReady);
    
    if (!selectedCourse) {
      console.error("❌ Cannot update scorecard: No course selected");
      return;
    }
    
    console.log("✅ Using course for scorecard update:", selectedCourse.name, selectedCourse.id);
    
    // Log available tees for debugging
    console.log("ℹ️ Available tees when updating scorecard:", 
      selectedCourse.tees.map(t => ({ 
        id: t.id, 
        name: t.name, 
        par: t.par,
        rating: t.rating,
        slope: t.slope
      }))
    );
    
    const selectedTee = selectedCourse.tees.find(t => t.id === teeId);
    console.log("🔍 Selected tee for scorecard update:", selectedTee);
    
    if (!selectedTee) {
      console.error(`❌ Cannot update scorecard: Tee with ID ${teeId} not found`);
      return;
    }
    
    const allHolesData = getHolesForTee(teeId);
    
    console.log("📊 All holes data for selected tee:", allHolesData);
    console.log("📊 Par values for holes:", allHolesData.map(h => ({ number: h.number, par: h.par })));
    
    // Calculate and verify total par
    const totalPar = allHolesData.reduce((sum, hole) => sum + (hole.par || 4), 0);
    console.log(`📊 Calculated total par for tee ${selectedTee.name}: ${totalPar}`);
    
    if (totalPar !== selectedTee.par) {
      console.warn(`⚠️ Par mismatch: Calculated ${totalPar} from holes, but tee.par is ${selectedTee.par}. Using calculated value.`);
      // Update the tee's par to match the calculated value
      selectedTee.par = totalPar;
    }
    
    let filteredHoles = [];
    
    if (selection === 'front9') {
      filteredHoles = allHolesData.filter(hole => hole.number <= 9);
      console.log("📊 Filtered for front 9:", filteredHoles);
    } else if (selection === 'back9') {
      filteredHoles = allHolesData.filter(hole => hole.number > 9);
      console.log("📊 Filtered for back 9:", filteredHoles);
    } else {
      filteredHoles = allHolesData;
      console.log("📊 Using all 18 holes");
    }
    
    if (!filteredHoles.length) {
      console.log("⚠️ No filtered holes, creating defaults");
      if (selection === 'front9') {
        filteredHoles = Array(9).fill(null).map((_, idx) => ({
          number: idx + 1,
          par: 4,
          yards: 400,
          handicap: idx + 1
        }));
      } else if (selection === 'back9') {
        filteredHoles = Array(9).fill(null).map((_, idx) => ({
          number: idx + 10,
          par: 4,
          yards: 400,
          handicap: idx + 10
        }));
      } else {
        filteredHoles = Array(18).fill(null).map((_, idx) => ({
          number: idx + 1,
          par: 4,
          yards: 400,
          handicap: idx + 1
        }));
      }
    }
    
    // Log par values explicitly before creating new scores
    console.log("📊 Par values for filtered holes:", filteredHoles.map(h => ({ number: h.number, par: h.par })));
    
    const newScores = filteredHoles.map(hole => ({
      hole: hole.number,
      par: hole.par || 4, // Ensure we have a valid par value
      strokes: 0,
      putts: undefined,
      yards: hole.yards,
      handicap: hole.handicap
    }));
    
    console.log("✅ New scores array with proper par data:", newScores);
    setScores(newScores);
    
    if (selection !== 'all') {
      setActiveScoreTab(selection === 'front9' ? "front9" : "back9");
    }
  };

  const handleTeeChange = (teeId: string) => {
    console.log("🚀 CRITICAL TEE CHANGE: Selected tee ID:", teeId);
    console.log("🔍 Course present:", !!selectedCourse);
    console.log("🔍 Course and tee ready:", courseAndTeeReady);
    
    if (!selectedCourse) {
      console.error("❌ Cannot handle tee change: No course selected");
      return;
    }
    
    console.log("✅ Using course for tee change:", selectedCourse.name, selectedCourse.id);
    console.log("ℹ️ Available tees at tee change:", 
      selectedCourse.tees.map(t => ({ 
        id: t.id, 
        name: t.name, 
        par: t.par,
        rating: t.rating,
        slope: t.slope
      }))
    );
    
    const selectedTee = selectedCourse.tees.find(t => t.id === teeId);
    console.log("🔍 Selected tee after change:", selectedTee);
    
    if (selectedTee) {
      console.log("✅ Using tee data from selected tee:", selectedTee.name, "with par:", selectedTee.par);
      console.log("✅ TEE SELECTION UI UPDATE - Using tee name:", selectedTee.name, "with ID:", selectedTee.id);
    } else {
      console.error("❌ No tee found with ID:", teeId);
      return; // Return early to prevent updating with invalid tee
    }
    
    // Update the scorecard with the new tee
    updateScorecardForTee(teeId, 'all');
  };

  const handleHoleSelectionChange = (selection: HoleSelection) => {
    console.log("🚀 Handling hole selection change:", selection);
    console.log("🔍 Course present:", !!selectedCourse);
    console.log("🔍 Course and tee ready:", courseAndTeeReady);
    
    if (!selectedCourse || !selectedCourse.tees || selectedCourse.tees.length === 0) {
      console.error("❌ Cannot handle hole selection change: No course or tees selected");
      return;
    }
    
    // Find current selected tee
    const teeId = selectedCourse.tees[0]?.id;
    if (!teeId) {
      console.error("❌ No valid tee ID found");
      return;
    }
    
    console.log("✅ Handling hole selection change with tee ID:", teeId);
    updateScorecardForTee(teeId, selection);
    setHoleSelection(selection);
  };

  const handleScoreChange = (index: number, field: 'strokes' | 'putts', value: string) => {
    const newScores = [...scores];
    const parsedValue = value === '' ? undefined : parseInt(value, 10);
    
    if (!isNaN(parsedValue as number) || value === '') {
      newScores[index] = {
        ...newScores[index],
        [field]: parsedValue,
      };
      setScores(newScores);
    }
  };

  return {
    handleScoreChange,
    handleHoleSelectionChange,
    updateScorecardForTee,
    handleTeeChange,
    getHolesForTee
  };
}
