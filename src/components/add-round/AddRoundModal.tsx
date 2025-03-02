
import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { SearchStep } from "./components/SearchStep";
import { ScorecardStep } from "./components/ScorecardStep";
import { ManualCourseForm } from "../ManualCourseForm";
import { useAddRoundState } from "./hooks/useAddRoundState";
import { useScoreHandlers } from "./hooks/useScoreHandlers";
import { useCourseHandlers } from "./hooks/useCourseHandlers";
import { calculateScoreSummary } from "./utils/scoreUtils";

interface AddRoundModalProps {
  open: boolean;
  onClose: () => void;
}

export const AddRoundModal: React.FC<AddRoundModalProps> = ({ 
  open, 
  onClose 
}) => {
  // Today's date, used to limit the date picker
  const today = new Date();
  
  const [addRoundDialogOpen, setAddRoundDialogOpen] = useState(open);
  
  // Ref to store if the dialog just closed, used to prevent state updates after unmount
  const justClosedRef = useRef(false);
  
  useEffect(() => {
    // If the open prop changes, update the local state
    setAddRoundDialogOpen(open);
    
    // Reset the justClosed ref when dialog is opened
    if (open) {
      justClosedRef.current = false;
    }
  }, [open]);
  
  // Get state from our custom hook
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
    lastTeeChangeTimestamp
  } = useAddRoundState();
  
  const toast = useToast();
  const queryClient = useQueryClient();
  const manualCourseFormRef = useRef<any>(null);
  
  // Score summary calculation
  const scoreSummary = calculateScoreSummary(scores);
  
  // Score-related handlers
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
    setHoleSelection,
    selectedTeeId
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
    queryClient,
    lastTeeChangeTimestamp
  });

  const handleBackToSearch = () => {
    setCurrentStep('search');
    setSelectedCourse(null);
    setSelectedTeeId(null);
    setScores([]);
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    setRoundDate(date);
    setCalendarOpen(false);
  };
  
  const resetForm = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedCourse(null);
    setSelectedTeeId(null);
    setScores([]);
    setCurrentStep('search');
    setHoleSelection('all');
    setActiveScoreTab('front9');
    setRoundDate(new Date());
  };
  
  const handleDialogClose = () => {
    justClosedRef.current = true;
    setAddRoundDialogOpen(false);
    resetForm();
    onClose();
  };
  
  const handleSaveRoundAndClose = async () => {
    const success = await handleSaveRound();
    if (success) {
      handleDialogClose();
    }
  };
  
  return (
    <>
      <Dialog open={addRoundDialogOpen} onOpenChange={(open) => {
        if (!open) handleDialogClose();
      }}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col max-h-[90vh]">
          {manualCourseOpen && (
            <ManualCourseForm 
              open={manualCourseOpen}
              onOpenChange={setManualCourseOpen}
              onCourseCreated={handleCourseCreated}
              ref={manualCourseFormRef}
            />
          )}
          
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
              handleCloseModal={handleDialogClose}
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
              handleCloseModal={handleDialogClose}
              scores={scores}
              scoreSummary={scoreSummary}
              holeSelection={holeSelection}
              calendarOpen={calendarOpen}
              setCalendarOpen={setCalendarOpen}
              isLoading={isLoading}
              dataLoadingError={dataLoadingError}
              today={today}
              lastTeeChangeTimestamp={lastTeeChangeTimestamp}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
