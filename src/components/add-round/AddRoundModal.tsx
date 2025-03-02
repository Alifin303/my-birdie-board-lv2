
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
    handleScoreChange,
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
  
  const { 
    handleSearch, 
    handleCourseSelect,
    handleOpenManualCourseForm,
    handleCourseCreated,
    handleSaveRound
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

  const handleBackToSearch = () => {
    setCurrentStep('search');
    setSelectedCourse(null);
    setSelectedTeeId(null);
    setScores([]);
    setSearchQuery('');
    setHoleSelection('all');
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
  
  // Modify handleSaveRound to close the modal after saving
  const handleSaveRoundAndClose = async () => {
    const success = await handleSaveRound();
    if (success) {
      handleCloseModal();
    }
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
              roundDate={roundDate}
              handleTeeChange={handleTeeChange}
              handleDateSelect={handleDateSelect}
              handleHoleSelectionChange={handleHoleSelectionChange}
              handleScoreChange={handleScoreChange}
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
