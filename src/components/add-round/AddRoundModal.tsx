
import React, { useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ManualCourseForm } from "@/components/ManualCourseForm";
import { SearchStep } from "./components/SearchStep";
import { ScorecardStep } from "./components/ScorecardStep";
import { useAddRoundState } from "./hooks/useAddRoundState";
import { calculateScoreSummary } from "./utils/scoreUtils";
import { AddRoundModalProps } from "./types";

export function AddRoundModal({ open, onOpenChange }: AddRoundModalProps) {
  const {
    step,
    setStep,
    searchValue,
    setSearchValue,
    searchResults,
    setSearchResults,
    selectedCourse,
    setSelectedCourse,
    selectedTeeId,
    setSelectedTeeId,
    selectedTee,
    setSelectedTee,
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
    handleHoleScoreChange,
    handleScoreChange,
    handleHoleSelectionChange,
    updateScorecardForTee,
    handleTeeChange,
    handleSearch,
    handleCourseSelect,
    handleOpenManualCourseForm,
    handleCourseCreated,
    handleSaveRound,
    resetState
  } = useAddRoundState();
  
  const toast = useToast();
  const queryClient = useQueryClient();
  const manualCourseFormRef = useRef<any>(null);
  const today = new Date();
  
  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open]);
  
  const handleBackToSearch = () => {
    setStep('search');
    setSelectedCourse(null);
    setSelectedTeeId(null);
    setScores([]);
    setSearchValue('');
    setHoleSelection('all');
    setActiveScoreTab("front9");
  };

  const handleDateSelect = (date: Date | undefined) => {
    setRoundDate(date);
    setCalendarOpen(false);
  };

  const handleCloseModal = () => {
    onOpenChange(false);
    resetState();
  };
  
  const handleSaveRoundAndClose = async () => {
    const success = await handleSaveRound();
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
          {step === 'search' ? (
            <SearchStep 
              searchQuery={searchValue}
              setSearchQuery={setSearchValue}
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
              selectedTee={selectedTee}
              scores={scores}
              roundDate={roundDate}
              isLoading={isLoading}
              setStep={setStep}
              setSelectedTeeId={setSelectedTeeId}
              setSelectedTee={setSelectedTee}
              handleHoleScoreChange={handleHoleScoreChange}
              handleSaveRound={handleSaveRoundAndClose}
              handleTeeChange={handleTeeChange}
              handleHoleSelectionChange={handleHoleSelectionChange}
              handleScoreChange={handleScoreChange}
              handleDateSelect={handleDateSelect}
              handleBackToSearch={handleBackToSearch}
              handleCloseModal={handleCloseModal}
              scoreSummary={scoreSummary}
              holeSelection={holeSelection}
              calendarOpen={calendarOpen}
              setCalendarOpen={setCalendarOpen}
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
