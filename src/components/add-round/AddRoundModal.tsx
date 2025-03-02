
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

export function AddRoundModal({ open, onOpenChange }: AddRoundModalProps) {
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
    setManualCourseOpen
  } = useAddRoundState();
  
  const toast = useToast();
  const queryClient = useQueryClient();
  const manualCourseFormRef = useRef<any>(null);
  const today = new Date();
  
  // Reset form when modal opens or closes
  useEffect(() => {
    if (!open) {
      // Reset state when modal is closed
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
    setHoleSelection('all');
    setActiveScoreTab("front9");
    setManualCourseOpen(false);
  };

  const { 
    isSaving,
    handleScoreChange,
    handleHoleSelectionChange,
    updateScorecardForTee,
    handleTeeChange,
    handleBackToSearch,
    handleSaveRound
  } = useScoreHandlers({
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
    saveRound: async (data) => {
      const success = await handleSaveRoundAndClose(data);
      return success ? Promise.resolve() : Promise.reject("Save failed");
    }
  });
  
  const { 
    handleSearch, 
    handleCourseSelect,
    handleOpenManualCourseForm,
    handleCourseCreated,
    handleSaveRound: handleSaveRoundFromCourseHandlers
  } = useCourseHandlers({
    searchQuery,
    setSearchQuery,
    setSearchResults,
    setSelectedCourse,
    setIsLoading,
    setSearchError,
    setNoResults,
    setOriginalCourseDetail,
    setSelectedTeeId,
    updateScorecardForTee,
    setHoleSelection,
    setCurrentStep,
    setManualCourseOpen,
    selectedCourse,
    selectedTeeId,
    scores,
    roundDate,
    isLoading,
    searchResults,
    toast,
    queryClient
  });

  const handleDateSelect = (date: Date | undefined) => {
    setRoundDate(date);
    setCalendarOpen(false);
  };

  const handleCloseModal = () => {
    onOpenChange(false);
    resetForm();
  };
  
  // Implement handleSaveRoundAndClose to use the course handlers version
  const handleSaveRoundAndClose = async (data?: any) => {
    const success = await handleSaveRoundFromCourseHandlers();
    if (success) {
      handleCloseModal();
    }
    return success;
  };
  
  const scoreSummary = calculateScoreSummary(scores);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
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
              scores={scores}
              handleScoreChange={handleScoreChange}
              handleTeeChange={handleTeeChange}
              handleDateSelect={handleDateSelect}
              handleSaveRound={handleSaveRoundAndClose}
              handleBackToSearch={handleBackToSearch}
              roundDate={roundDate}
              setRoundDate={setRoundDate}
              calendarOpen={calendarOpen}
              setCalendarOpen={setCalendarOpen}
              holeSelection={holeSelection}
              handleHoleSelectionChange={handleHoleSelectionChange}
              activeScoreTab={activeScoreTab}
              setActiveScoreTab={setActiveScoreTab}
              isSaving={isSaving}
              isLoading={isLoading}
              dataLoadingError={dataLoadingError}
              handleCloseModal={handleCloseModal}
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
