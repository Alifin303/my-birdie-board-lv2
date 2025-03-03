
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
}

export function useScoreHandlers({
  selectedCourse,
  scores,
  setScores,
  setActiveScoreTab,
  setHoleSelection
}: UseScoreHandlersProps) {
  
  const getHolesForTee = (teeId: string) => {
    console.log("Getting holes for tee:", teeId);
    
    if (!selectedCourse) {
      console.error("No course selected");
      return [];
    }
    
    if (!selectedCourse.tees || selectedCourse.tees.length === 0) {
      console.error("No tees found for course:", selectedCourse.name);
      console.log("Returning course default holes");
      return selectedCourse.holes || [];
    }
    
    const selectedTee = selectedCourse.tees.find(t => t.id === teeId);
    if (!selectedTee) {
      console.error(`Tee with ID ${teeId} not found in course tees`);
      console.log("Available tees:", selectedCourse.tees.map(t => ({ id: t.id, name: t.name })));
      console.log("Returning course default holes");
      return selectedCourse.holes || [];
    }
    
    console.log("Found selected tee:", selectedTee.name, "with par:", selectedTee.par);
    
    // For user-added courses, the holes are directly on the tee
    if (selectedTee.holes && selectedTee.holes.length > 0) {
      console.log("Using hole data specific to the selected tee:", selectedTee.holes);
      
      // Validate par values
      const validHoles = selectedTee.holes.map(hole => {
        if (!hole.par || hole.par < 2 || hole.par > 6) {
          console.log(`Fixing invalid par value (${hole.par}) for hole ${hole.number}`);
          return { ...hole, par: 4 }; // Use a reasonable default
        }
        return hole;
      });
      
      console.log("Validated holes with par values:", validHoles.map(h => ({ number: h.number, par: h.par })));
      return validHoles;
    }
    
    console.log("Tee doesn't have specific hole data, using course's default holes");
    // Fallback to course holes if available
    if (selectedCourse.holes && selectedCourse.holes.length > 0) {
      // Check for potential par data issues
      const anyInvalidPar = selectedCourse.holes.some(h => !h.par || h.par < 2 || h.par > 6);
      if (anyInvalidPar) {
        console.warn("Some course holes have invalid par values, fixing them");
        return selectedCourse.holes.map(hole => ({
          ...hole,
          par: hole.par && hole.par >= 2 && hole.par <= 6 ? hole.par : 4
        }));
      }
      return selectedCourse.holes;
    }
    
    // Last resort: generate default holes
    console.warn("No hole data found for course or tee, generating default holes");
    return Array(18).fill(null).map((_, idx) => ({
      number: idx + 1,
      par: 4,
      yards: 400,
      handicap: idx + 1
    }));
  };

  const updateScorecardForTee = (teeId: string, selection: HoleSelection = 'all') => {
    console.log("Updating scorecard for tee", teeId, "with selection", selection);
    
    if (!selectedCourse) {
      console.error("Cannot update scorecard: No course selected");
      return;
    }
    
    // Log available tees for debugging
    console.log("Available tees when updating scorecard:", 
      selectedCourse.tees.map(t => ({ 
        id: t.id, 
        name: t.name, 
        par: t.par,
        rating: t.rating,
        slope: t.slope
      }))
    );
    
    const selectedTee = selectedCourse.tees.find(t => t.id === teeId);
    console.log("Selected tee for scorecard update:", selectedTee);
    
    if (!selectedTee) {
      console.error(`Cannot update scorecard: Tee with ID ${teeId} not found`);
      return;
    }
    
    const allHolesData = getHolesForTee(teeId);
    
    console.log("All holes data for selected tee:", allHolesData);
    console.log("Par values for holes:", allHolesData.map(h => ({ number: h.number, par: h.par })));
    
    // Calculate and verify total par
    const totalPar = allHolesData.reduce((sum, hole) => sum + (hole.par || 4), 0);
    console.log(`Calculated total par for tee ${selectedTee.name}: ${totalPar}`);
    
    if (totalPar !== selectedTee.par) {
      console.warn(`Par mismatch: Calculated ${totalPar} from holes, but tee.par is ${selectedTee.par}. Using calculated value.`);
    }
    
    let filteredHoles = [];
    
    if (selection === 'front9') {
      filteredHoles = allHolesData.filter(hole => hole.number <= 9);
      console.log("Filtered for front 9:", filteredHoles);
    } else if (selection === 'back9') {
      filteredHoles = allHolesData.filter(hole => hole.number > 9);
      console.log("Filtered for back 9:", filteredHoles);
    } else {
      filteredHoles = allHolesData;
      console.log("Using all 18 holes");
    }
    
    if (!filteredHoles.length) {
      console.log("No filtered holes, creating defaults");
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
    console.log("Par values for filtered holes:", filteredHoles.map(h => ({ number: h.number, par: h.par })));
    
    const newScores = filteredHoles.map(hole => ({
      hole: hole.number,
      par: hole.par || 4, // Ensure we have a valid par value
      strokes: 0,
      putts: undefined,
      yards: hole.yards,
      handicap: hole.handicap
    }));
    
    console.log("New scores array with proper par data:", newScores);
    setScores(newScores);
    
    if (selection !== 'all') {
      setActiveScoreTab(selection === 'front9' ? "front9" : "back9");
    }
  };

  const handleTeeChange = (teeId: string) => {
    if (!selectedCourse) {
      console.error("Cannot handle tee change: No course selected");
      return;
    }
    
    console.log("CRITICAL TEE CHANGE: Selected tee ID:", teeId);
    console.log("Available tees at tee change:", 
      selectedCourse.tees.map(t => ({ 
        id: t.id, 
        name: t.name, 
        par: t.par,
        rating: t.rating,
        slope: t.slope
      }))
    );
    
    const selectedTee = selectedCourse.tees.find(t => t.id === teeId);
    console.log("Selected tee after change:", selectedTee);
    
    if (selectedTee) {
      console.log("Using tee data from selected tee:", selectedTee.name, "with par:", selectedTee.par);
      console.log("TEE SELECTION UI UPDATE - Using tee name:", selectedTee.name, "with ID:", selectedTee.id);
    } else {
      console.error("No tee found with ID:", teeId);
      return; // Return early to prevent updating with invalid tee
    }
    
    // Update the scorecard with the new tee
    updateScorecardForTee(teeId, 'all');
  };

  const handleHoleSelectionChange = (selection: HoleSelection) => {
    if (!selectedCourse || !selectedCourse.tees || selectedCourse.tees.length === 0) {
      console.error("Cannot handle hole selection change: No course or tees selected");
      return;
    }
    
    // Find current selected tee
    const teeId = selectedCourse.tees[0]?.id;
    if (!teeId) {
      console.error("No valid tee ID found");
      return;
    }
    
    console.log("Handling hole selection change with tee ID:", teeId);
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
