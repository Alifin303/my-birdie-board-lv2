
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { useAddRoundState } from "./hooks/useAddRoundState";
import { useCourseHandlers } from "./hooks/course-handlers";
import { SearchStep } from "./components/SearchStep";
import { ScorecardStep } from "./components/ScorecardStep";
import { ManualCourseForm } from "@/components/ManualCourseForm";

interface AddRoundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddRoundModal = ({ open, onOpenChange }: AddRoundModalProps) => {
  const { toast } = useToast();
  const manualCourseFormRef = React.useRef<any>(null);
  
  const {
    currentStep,
    selectedCourse,
    selectedTeeId,
    searchQuery,
    searchResults,
    isLoading,
    searchError,
    noResults,
    scores,
    dataLoadingError,
    courseLoadFailure,
    manualCourseOpen,
    originalCourseDetail,
    roundDate,
    calendarOpen,
    holeSelection,
    activeScoreTab,
    courseAndTeeReady,
    
    setCurrentStep,
    setSelectedCourse,
    setSelectedTeeId,
    setSearchQuery,
    setSearchResults,
    setIsLoading,
    setSearchError,
    setNoResults,
    setScores,
    setDataLoadingError,
    setCourseLoadFailure,
    setManualCourseOpen,
    setOriginalCourseDetail,
    setRoundDate,
    setCalendarOpen,
    setHoleSelection,
    setActiveScoreTab,
    
    updateScorecardForTee,
    resetAddRoundState
  } = useAddRoundState();

  const {
    handleSearch,
    handleCourseSelect,
    handleOpenManualCourseForm,
    handleCourseCreated,
    handleSaveRound
  } = useCourseHandlers({
    currentStep,
    selectedCourse,
    selectedTeeId,
    searchQuery,
    searchResults,
    isLoading,
    searchError,
    noResults,
    scores,
    dataLoadingError,
    courseLoadFailure,
    manualCourseOpen,
    originalCourseDetail,
    roundDate,
    calendarOpen,
    holeSelection,
    activeScoreTab,
    courseAndTeeReady,
    
    setCurrentStep,
    setSelectedCourse,
    setSelectedTeeId,
    setSearchQuery,
    setSearchResults,
    setIsLoading,
    setSearchError,
    setNoResults,
    setScores,
    setDataLoadingError,
    setCourseLoadFailure,
    setManualCourseOpen,
    setOriginalCourseDetail,
    setRoundDate,
    setCalendarOpen,
    setHoleSelection,
    setActiveScoreTab,
    
    updateScorecardForTee,
    resetAddRoundState,
    
    toast,
    onClose: () => onOpenChange(false)
  });

  // Reset state when modal closes
  React.useEffect(() => {
    if (!open) {
      resetAddRoundState();
    }
  }, [open, resetAddRoundState]);

  const handleSaveRoundWrapper = async () => {
    await handleSaveRound();
    return;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <div className="absolute right-4 top-4">
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {currentStep === 'search' && (
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
          )}
          
          {currentStep === 'scorecard' && selectedCourse && (
            <ScorecardStep
              selectedCourse={selectedCourse}
              selectedTeeId={selectedTeeId}
              setSelectedTeeId={setSelectedTeeId}
              scores={scores}
              setScores={setScores}
              handleSaveRound={handleSaveRoundWrapper}
              onBackToSearch={() => setCurrentStep('search')}
              isLoading={isLoading}
              updateScorecardForTee={updateScorecardForTee}
              originalCourseDetail={originalCourseDetail}
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
};
