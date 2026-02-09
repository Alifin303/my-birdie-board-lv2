import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
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
import { supabase } from "@/integrations/supabase/client";
import { canAddMoreRounds, FREE_ROUND_LIMIT } from "@/integrations/supabase/subscription/freemium-utils";
import { Button } from "@/components/ui/button";
import { Sparkles, Lock, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AddRoundModal({ open, onOpenChange, handicapIndex = 0 }: AddRoundModalProps) {
  const navigate = useNavigate();
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

  // Check if user can add more rounds (freemium check)
  const { data: roundLimitData, isLoading: checkingLimit } = useQuery({
    queryKey: ['roundLimit'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { canAdd: false, hasSubscription: false, roundCount: 0, remainingRounds: 0 };
      return canAddMoreRounds(session.user.id);
    },
    enabled: open,
    staleTime: 0, // Always check fresh when modal opens
  });

  const canAdd = roundLimitData?.canAdd ?? true;
  const hasSubscription = roundLimitData?.hasSubscription ?? false;
  const remainingRounds = roundLimitData?.remainingRounds ?? FREE_ROUND_LIMIT;
  
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

  const handleUpgradeClick = () => {
    handleCloseModal();
    navigate("/checkout");
  };

  // Show upgrade prompt if user has reached their free limit
  if (open && !checkingLimit && !canAdd) {
    return (
      <>
        {open && (
          <div 
            className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black/80 backdrop-blur-sm"
            style={{ width: '100vw', height: '100vh' }}
            aria-hidden="true"
          />
        )}
        <Dialog open={open} onOpenChange={handleCloseModal} modal={false}>
          <DialogContent 
            className="sm:max-w-[450px] p-6 bg-background border shadow-2xl z-50 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            onInteractOutside={(e) => e.preventDefault()}
          >
            <DialogHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <DialogTitle className="text-xl">You've Used Your Free Rounds</DialogTitle>
              <DialogDescription className="text-center pt-2">
                You've recorded {FREE_ROUND_LIMIT} rounds on the free tier. Upgrade to Pro to track unlimited rounds and unlock all features.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Pro Features
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Unlimited round tracking</li>
                  <li>• Advanced statistics & analytics</li>
                  <li>• Handicap calculation</li>
                  <li>• Course performance insights</li>
                </ul>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleCloseModal} className="sm:flex-1">
                Maybe Later
              </Button>
              <Button onClick={handleUpgradeClick} className="sm:flex-1">
                <Sparkles className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

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
          onEscapeKeyDown={() => handleCloseModal()}
        >
          <button
            onClick={handleCloseModal}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-10"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
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
