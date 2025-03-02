
import { useState, useCallback } from "react";
import { 
  Score,
  HoleSelection, 
  SimplifiedTee,
} from "../types";
import { UseScoreHandlersProps } from "./course-handlers/types";

export const useScoreHandlers = ({
  selectedCourse,
  selectedTeeId,
  setSelectedTeeId,
  scores,
  setScores,
  holeSelection,
  setHoleSelection,
  activeScoreTab,
  setActiveScoreTab,
  setCurrentStep,
  roundDate,
  saveRound
}: UseScoreHandlersProps) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Handler for updating scorecard when tee or hole selection changes
  const updateScorecardForTee = useCallback((teeId: string | null, selection?: HoleSelection) => {
    console.log("Updating scorecard for tee:", teeId);
    
    if (!selectedCourse || !teeId) {
      console.error("Cannot update scorecard: Course or tee ID is missing");
      return;
    }
    
    const selectedTee = selectedCourse.tees.find(tee => tee.id === teeId);
    if (!selectedTee) {
      console.error("No tee found with ID:", teeId);
      return;
    }
    
    console.log("Found tee:", selectedTee.name);
    
    // Get holes for the selected tee
    const teeHoles = selectedTee.holes || selectedCourse.holes;
    
    if (!teeHoles || teeHoles.length === 0) {
      console.error("No holes found for tee:", selectedTee.name);
      return;
    }
    
    console.log("Updating scores with holes:", teeHoles.length);
    
    // Create scores from holes data
    const newScores: Score[] = teeHoles.map(hole => ({
      hole: hole.number,
      par: hole.par,
      yards: hole.yards,
      handicap: hole.handicap,
      strokes: undefined,
      putts: undefined
    }));
    
    setScores(newScores);
    
    // Update hole selection if provided
    if (selection) {
      console.log("Updating hole selection to:", selection);
      setHoleSelection(selection);
      
      // Update active tab based on hole selection
      if (selection === 'front9') {
        setActiveScoreTab('front9');
      } else if (selection === 'back9') {
        setActiveScoreTab('back9');
      }
    }
    
    console.log("Scorecard updated successfully");
  }, [selectedCourse, setScores, setHoleSelection, setActiveScoreTab]);

  // Handle score change
  const handleScoreChange = useCallback((holeIndex: number, field: keyof Score, value: number) => {
    console.log(`Updating hole ${holeIndex} field ${field} to ${value}`);
    
    setScores(prevScores => {
      const newScores = [...prevScores];
      newScores[holeIndex] = {
        ...newScores[holeIndex],
        [field]: value
      };
      return newScores;
    });
  }, [setScores]);

  // Handle tee change
  const handleTeeChange = useCallback((teeId: string) => {
    console.log("Changing tee to:", teeId);
    
    if (teeId === selectedTeeId) {
      console.log("Same tee selected, no changes needed");
      return;
    }
    
    if (!selectedCourse) {
      console.error("No course selected");
      return;
    }
    
    const selectedTee = selectedCourse.tees.find(t => t.id === teeId);
    if (!selectedTee) {
      console.error("No tee found with ID:", teeId);
      return;
    }
    
    console.log("Found tee:", selectedTee.name);
    
    // Update the selected tee ID
    setSelectedTeeId(teeId);
    
    // Force the UI update by setting a small timeout
    setTimeout(() => {
      console.log("Updating scorecard after tee change to:", teeId);
      updateScorecardForTee(teeId, holeSelection);
    }, 50);
  }, [selectedCourse, selectedTeeId, setSelectedTeeId, updateScorecardForTee, holeSelection]);

  // Handle hole selection change
  const handleHoleSelectionChange = useCallback((selection: HoleSelection) => {
    console.log("Changing hole selection to:", selection);
    setHoleSelection(selection);
    
    if (selection === 'front9') {
      setActiveScoreTab('front9');
    } else if (selection === 'back9') {
      setActiveScoreTab('back9');
    }
  }, [setHoleSelection, setActiveScoreTab]);

  // Handle back to search
  const handleBackToSearch = useCallback(() => {
    console.log("Returning to search");
    setCurrentStep('search');
  }, [setCurrentStep]);

  // Handle save round
  const handleSaveRound = useCallback(async () => {
    console.log("Saving round");
    
    if (!selectedCourse || !selectedTeeId || !roundDate) {
      console.error("Cannot save round: Missing required data");
      return;
    }
    
    const selectedTee = selectedCourse.tees.find(tee => tee.id === selectedTeeId) as SimplifiedTee;
    if (!selectedTee) {
      console.error("Selected tee not found:", selectedTeeId);
      return;
    }
    
    setIsSaving(true);
    
    try {
      console.log("Saving round with tee:", selectedTee.name);
      
      await saveRound({
        courseId: selectedCourse.id,
        teeName: selectedTee.name,
        teeId: selectedTeeId,
        scores,
        date: roundDate,
        holeSelection,
        courseName: selectedCourse.name,
        clubName: selectedCourse.clubName,
        teeRating: selectedTee.rating,
        teeSlope: selectedTee.slope,
        isUserAddedCourse: !!selectedCourse.isUserAdded,
      });
      
      console.log("Round saved successfully");
    } catch (error) {
      console.error("Error saving round:", error);
    } finally {
      setIsSaving(false);
    }
  }, [
    selectedCourse, 
    selectedTeeId, 
    roundDate, 
    scores, 
    holeSelection, 
    saveRound,
    setIsSaving
  ]);

  return {
    isSaving,
    updateScorecardForTee,
    handleScoreChange,
    handleTeeChange,
    handleHoleSelectionChange,
    handleBackToSearch,
    handleSaveRound
  };
};
