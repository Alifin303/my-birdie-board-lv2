
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
    
    toast: { toast, dismiss: (toastId?: string) => useToast().dismiss(toastId) }, // Fix the toast type
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
  };

  // Create a handler for tee changes that updates state
  const handleTeeChange = (teeId: string) => {
    console.log("Handling tee change in AddRoundModal:", teeId);
    setSelectedTeeId(teeId);
  };

  // Create a handler for date selection
  const handleDateSelect = (date: Date | undefined) => {
    setRoundDate(date);
    setCalendarOpen(false);
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
              roundDate={roundDate}
              handleTeeChange={handleTeeChange}
              handleDateSelect={handleDateSelect}
              handleHoleSelectionChange={setHoleSelection}
              handleScoreChange={(index, field, value) => {
                const updatedScores = [...scores];
                // @ts-ignore - We know the field exists on the score
                updatedScores[index][field] = field === 'strokes' || field === 'putts' || field === 'penalties' 
                  ? (value === '' ? undefined : parseInt(value, 10)) 
                  : value;
                setScores(updatedScores);
              }}
              handleGIRChange={(index, value) => {
                const updatedScores = [...scores];
                updatedScores[index].gir = value;
                setScores(updatedScores);
              }}
              handleBackToSearch={() => setCurrentStep('search')}
              handleSaveRound={handleSaveRoundWrapper}
              handleCloseModal={() => onOpenChange(false)}
              scores={scores}
              scoreSummary={{
                totalStrokes: scores.reduce((sum, s) => sum + (s.strokes || 0), 0),
                totalPar: scores.reduce((sum, s) => sum + s.par, 0),
                totalPutts: scores.reduce((sum, s) => sum + (s.putts || 0), 0),
                toPar: scores.reduce((sum, s) => sum + (s.strokes || 0), 0) - scores.reduce((sum, s) => sum + s.par, 0),
                puttsRecorded: scores.some(s => s.putts !== undefined),
                front9Strokes: scores.filter(s => s.hole <= 9).reduce((sum, s) => sum + (s.strokes || 0), 0),
                front9Par: scores.filter(s => s.hole <= 9).reduce((sum, s) => sum + s.par, 0),
                front9ToPar: scores.filter(s => s.hole <= 9).reduce((sum, s) => sum + (s.strokes || 0), 0) - scores.filter(s => s.hole <= 9).reduce((sum, s) => sum + s.par, 0),
                back9Strokes: scores.filter(s => s.hole > 9).reduce((sum, s) => sum + (s.strokes || 0), 0),
                back9Par: scores.filter(s => s.hole > 9).reduce((sum, s) => sum + s.par, 0),
                back9ToPar: scores.filter(s => s.hole > 9).reduce((sum, s) => sum + (s.strokes || 0), 0) - scores.filter(s => s.hole > 9).reduce((sum, s) => sum + s.par, 0),
              }}
              holeSelection={holeSelection}
              calendarOpen={calendarOpen}
              setCalendarOpen={setCalendarOpen}
              isLoading={isLoading}
              dataLoadingError={dataLoadingError}
              today={new Date()}
              activeScoreTab={activeScoreTab}
              setActiveScoreTab={setActiveScoreTab}
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
