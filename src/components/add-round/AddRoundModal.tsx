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

export function AddRoundModal({ open, onOpenChange, handicapIndex = 0 }: AddRoundModalProps) {
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
    setCourseLoadFailure,
    showNetStableford,
    setShowNetStableford
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
    if (!open) {
      resetForm();
    }
  }, [open]);
  
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
  };
  
  const { 
    handleScoreChange,
    handleGIRChange,
    handleFairwayHitChange,
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

  return (
    <>
      {/* Custom backdrop overlay - fixed position independent of scrollbar */}
      {open && (
        <div 
          className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black/80 backdrop-blur-sm"
          style={{ width: '100vw', height: '100vh' }}
          aria-hidden="true"
        />
      )}
      <Dialog open={open} onOpenChange={(newOpen) => {
        // Only allow closing via explicit user action (close button/cancel)
        // Prevent automatic closing on tab switch/focus loss
        if (newOpen === true) {
          onOpenChange(true);
        }
        // Don't call onOpenChange(false) - let handleCloseModal handle closing
      }} modal={false}>
        <DialogContent 
          className="sm:max-w-[1000px] p-6 max-h-[90vh] overflow-y-auto bg-background border shadow-2xl z-50 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onFocusOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
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
              handleFairwayHitChange={handleFairwayHitChange}
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
              handicapIndex={handicapIndex}
              showNetStableford={showNetStableford}
              setShowNetStableford={setShowNetStableford}
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
