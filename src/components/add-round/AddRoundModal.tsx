import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Score, 
  HoleSelection, 
  SimplifiedGolfCourse, 
  SimplifiedCourseDetail, 
  AddRoundModalProps 
} from "./types";
import { ManualCourseForm } from "@/components/ManualCourseForm";
import { SearchStep } from "./components/SearchStep";
import { ScorecardStep } from "./components/ScorecardStep";
import { useAddRoundState } from "./hooks/useAddRoundState";
import { useScoreHandlers } from "./hooks/useScoreHandlers";
import { useCourseHandlers } from "./hooks/useCourseHandlers";
import { calculateScoreSummary } from "./utils/scoreUtils";

const LOCAL_STORAGE_KEY = "mbb-add-round-open-state";

export function AddRoundModal({ open, onOpenChange }: AddRoundModalProps) {
  // Initialize open state from localStorage when component mounts
  const [internalOpen, setInternalOpen] = useState<boolean>(() => {
    try {
      const storedValue = localStorage.getItem(LOCAL_STORAGE_KEY);
      return storedValue ? JSON.parse(storedValue) === true : open;
    } catch (e) {
      console.error("Error reading from localStorage:", e);
      return open;
    }
  });

  // Keep our internal state and the passed prop in sync
  useEffect(() => {
    if (open !== internalOpen) {
      setInternalOpen(open);
    }
  }, [open]);

  // Update localStorage when internal state changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(internalOpen));
    } catch (e) {
      console.error("Error writing to localStorage:", e);
    }
  }, [internalOpen]);

  // Handle visibility change events (browser minimize/restore)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When the browser becomes visible again, check localStorage
        try {
          const storedOpen = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (storedOpen && JSON.parse(storedOpen) === true && !open) {
            // If we were in the middle of adding a round, restore that state
            onOpenChange(true);
          }
        } catch (e) {
          console.error("Error handling visibility change:", e);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onOpenChange, open]);

  const {
    currentStep,
    setCurrentStep,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    selectedCourse,
    setSelectedCourse,
    selectedTeeId,
    setSelectedTeeId,
    scores,
    setScores,
    isLoading,
    setIsLoading,
    searchError,
    setSearchError,
    dataLoadingError,
    setDataLoadingError,
    roundDate,
    setRoundDate,
    calendarOpen,
    setCalendarOpen,
    holeSelection,
    setHoleSelection,
    activeScoreTab,
    setActiveScoreTab,
    originalCourseDetail,
    setOriginalCourseDetail,
    noResults,
    setNoResults,
    manualCourseOpen,
    setManualCourseOpen,
    courseAndTeeReady,
    courseLoadFailure,
    setCourseLoadFailure
  } = useAddRoundState();
  
  const toast = useToast();
  const queryClient = useQueryClient();
  const manualCourseFormRef = useRef<any>(null);
  const today = new Date();
  
  useEffect(() => {
    if (selectedTeeId) {
      console.log("AddRoundModal - Current selectedTeeId:", selectedTeeId);
      if (selectedCourse) {
        const selectedTee = selectedCourse.tees.find(tee => tee.id === selectedTeeId);
        console.log("Selected tee:", selectedTee ? { id: selectedTee.id, name: selectedTee.name } : "Not found");
      }
    }
  }, [selectedTeeId, selectedCourse]);
  
  useEffect(() => {
    if (!internalOpen) {
      resetForm();
    }
  }, [internalOpen]);
  
  const resetForm = () => {
    setCurrentStep('search');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedCourse(null);
    setSelectedTeeId(null);
    setScores([]);
    setSearchError(null);
    setDataLoadingError(null);
    setRoundDate(new Date());
    setHoleSelection({ type: 'all' });
    setActiveScoreTab("front9");
    setManualCourseOpen(false);
    
    // Clear the stored state when we explicitly reset the form
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error("Error removing from localStorage:", e);
    }
  };
  
  const { 
    handleScoreChange,
    handleGIRChange,
    handleHoleSelectionChange,
    updateScorecardForTee,
    handleTeeChange
  } = useScoreHandlers({
    selectedCourse,
    scores,
    setScores,
    setActiveScoreTab,
    setHoleSelection
  });
  
  const handleTeeChangeWithLogging = (teeId: string) => {
    console.log(`AddRoundModal - handleTeeChange called with: ${teeId}`);
    console.log("Before change - selectedTeeId:", selectedTeeId);
    handleTeeChange(teeId);
    console.log("After handler call - selectedTeeId:", selectedTeeId);
    setSelectedTeeId(teeId);
  };
  
  const { 
    handleSearch, 
    handleCourseSelect,
    handleOpenManualCourseForm,
    handleCourseCreated,
    handleSaveRound
  } = useCourseHandlers({
    currentStep,
    setCurrentStep,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    selectedCourse,
    setSelectedCourse,
    selectedTeeId,
    setSelectedTeeId,
    scores,
    setScores,
    isLoading, 
    setIsLoading,
    searchError,
    setSearchError,
    dataLoadingError,
    setDataLoadingError,
    roundDate,
    setRoundDate,
    calendarOpen,
    setCalendarOpen,
    holeSelection,
    setHoleSelection,
    activeScoreTab,
    setActiveScoreTab,
    originalCourseDetail,
    setOriginalCourseDetail,
    noResults,
    setNoResults,
    manualCourseOpen,
    setManualCourseOpen,
    courseAndTeeReady,
    updateScorecardForTee,
    courseLoadFailure,
    setCourseLoadFailure,
    toast,
    queryClient
  });

  const handleBackToSearch = () => {
    setCurrentStep('search');
    setSelectedCourse(null);
    setSelectedTeeId(null);
    setScores([]);
    setSearchQuery('');
    setHoleSelection({ type: 'all' });
    setActiveScoreTab("front9");
  };

  const handleDateSelect = (date: Date | undefined) => {
    setRoundDate(date);
    setCalendarOpen(false);
  };

  const handleCloseModal = () => {
    setInternalOpen(false);
    onOpenChange(false);
    resetForm();
  };
  
  const handleSaveRoundAndClose = async () => {
    console.log("Save and close - current teeId:", selectedTeeId);
    if (selectedCourse && selectedTeeId) {
      const tee = selectedCourse.tees.find(t => t.id === selectedTeeId);
      console.log("Saving with tee:", tee ? { id: tee.id, name: tee.name } : "No tee found");
    }
    
    const success = await handleSaveRound();
    if (success) {
      handleCloseModal();
    }
  };
  
  const scoreSummary = calculateScoreSummary(scores);

  // Use our internal state for controlling the dialog
  const handleOpenChange = (newOpen: boolean) => {
    setInternalOpen(newOpen);
    onOpenChange(newOpen);
  };

  return (
    <>
      <Dialog open={internalOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[1000px] p-6 max-h-[90vh] overflow-y-auto">
          {currentStep === 'search' ? (
            <SearchStep 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleSearch={handleSearch}
              handleCourseSelect={handleCourseSelect}
              handleOpenManualCourseForm={handleOpenManualCourseForm}
              manualCourseFormRef={manualCourseFormRef}
              searchResults={searchResults}
              isLoading={isLoading}
              searchError={searchError}
              noResults={noResults}
              setManualCourseOpen={setManualCourseOpen}
            />
          ) : (
            <ScorecardStep 
              selectedCourse={selectedCourse}
              selectedTeeId={selectedTeeId}
              roundDate={roundDate}
              handleTeeChange={handleTeeChangeWithLogging}
              handleDateSelect={handleDateSelect}
              handleHoleSelectionChange={handleHoleSelectionChange}
              handleScoreChange={handleScoreChange}
              handleGIRChange={handleGIRChange}
              handleBackToSearch={handleBackToSearch}
              handleSaveRound={handleSaveRoundAndClose}
              handleCloseModal={handleCloseModal}
              scores={scores}
              scoreSummary={scoreSummary}
              holeSelection={holeSelection}
              calendarOpen={calendarOpen}
              setCalendarOpen={setCalendarOpen}
              isLoading={isLoading}
              dataLoadingError={dataLoadingError}
              today={today}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <ManualCourseForm
        open={manualCourseOpen}
        onOpenChange={setManualCourseOpen}
        onCourseCreated={handleCourseCreated}
      />
    </>
  );
}
