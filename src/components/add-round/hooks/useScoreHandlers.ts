
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
    
    console.log("Found selected tee:", selectedTee.name);
    
    if (selectedTee.holes && selectedTee.holes.length > 0) {
      console.log("Using hole data specific to the selected tee:", selectedTee.holes);
      return selectedTee.holes;
    }
    
    console.log("Tee doesn't have specific hole data, using course's default holes");
    return selectedCourse.holes || [];
  };

  const updateScorecardForTee = (teeId: string, selection: HoleSelection = 'all') => {
    console.log("Updating scorecard for tee", teeId, "with selection", selection);
    
    if (!selectedCourse) {
      console.error("Cannot update scorecard: No course selected");
      return;
    }
    
    // Log available tees for debugging
    console.log("Available tees when updating scorecard:", 
      selectedCourse.tees.map(t => ({ id: t.id, name: t.name }))
    );
    
    const selectedTee = selectedCourse.tees.find(t => t.id === teeId);
    console.log("Selected tee for scorecard update:", selectedTee);
    
    const allHolesData = getHolesForTee(teeId);
    
    console.log("All holes data for selected tee:", allHolesData);
    
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
    
    // Create a new array of scores with data from the filtered holes
    const newScores = filteredHoles.map(hole => {
      // Find existing score for this hole if it exists
      const existingScore = scores.find(s => s.hole === hole.number);
      
      return {
        hole: hole.number,
        par: hole.par || 4, // Ensure we have a valid par value
        strokes: existingScore?.strokes || 0,
        putts: existingScore?.putts,
        yards: hole.yards || 400,
        handicap: hole.handicap || (hole.number <= 9 ? hole.number : hole.number - 9)
      };
    });
    
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
    console.log("Available tees at tee change:", selectedCourse.tees.map(t => ({ id: t.id, name: t.name })));
    
    const selectedTee = selectedCourse.tees.find(t => t.id === teeId);
    console.log("Selected tee after change:", selectedTee);
    
    if (selectedTee) {
      console.log("Using tee data from selected tee:", selectedTee.name);
      console.log("TEE SELECTION UI UPDATE - Using tee name:", selectedTee.name, "with ID:", selectedTee.id);
    } else {
      console.error("No tee found with ID:", teeId);
    }
    
    // Always update the scorecard regardless of finding the tee
    // This ensures that even if there's an issue, we display something
    updateScorecardForTee(teeId, 'all');
  };

  const handleHoleSelectionChange = (selection: HoleSelection) => {
    if (!selectedCourse || !selectedCourse.tees || selectedCourse.tees.length === 0) {
      console.error("Cannot handle hole selection change: No course or tees selected");
      return;
    }
    
    // Use the first tee if none is selected
    const teeId = selectedCourse.tees[0]?.id || 'default-tee';
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
