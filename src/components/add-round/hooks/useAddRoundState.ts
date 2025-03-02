
import { useState, useEffect } from "react";
import { 
  SimplifiedGolfCourse, 
  SimplifiedCourseDetail,
  Score,
  HoleSelection,
  CourseDetail
} from "../types";

export const useAddRoundState = () => {
  const [currentStep, setCurrentStep] = useState<'search' | 'scorecard'>('search');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SimplifiedGolfCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<SimplifiedCourseDetail | null>(null);
  const [selectedTeeId, setSelectedTeeId] = useState<string | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [dataLoadingError, setDataLoadingError] = useState<string | null>(null);
  const [roundDate, setRoundDate] = useState<Date | undefined>(new Date());
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false);
  const [holeSelection, setHoleSelection] = useState<HoleSelection>('all');
  const [activeScoreTab, setActiveScoreTab] = useState<"front9" | "back9">("front9");
  const [originalCourseDetail, setOriginalCourseDetail] = useState<CourseDetail | null>(null);
  const [noResults, setNoResults] = useState<boolean>(false);
  const [manualCourseOpen, setManualCourseOpen] = useState<boolean>(false);
  const [lastTeeChangeTimestamp, setLastTeeChangeTimestamp] = useState<number>(Date.now());

  // Reset selectedTeeId whenever selectedCourse changes
  useEffect(() => {
    if (selectedCourse && selectedCourse.tees && selectedCourse.tees.length > 0) {
      console.log("Selected course changed, setting default tee:", selectedCourse.tees[0].name);
      setSelectedTeeId(selectedCourse.tees[0].id);
      setLastTeeChangeTimestamp(Date.now()); // Update timestamp for debugging
    } else {
      setSelectedTeeId(null);
    }
  }, [selectedCourse]);

  // Log selection changes for debugging
  useEffect(() => {
    if (selectedTeeId) {
      console.log("Selected tee ID state updated:", selectedTeeId);
      console.log("Last tee change timestamp:", new Date(lastTeeChangeTimestamp).toISOString());
      
      if (selectedCourse && selectedCourse.tees) {
        const tee = selectedCourse.tees.find(t => t.id === selectedTeeId);
        console.log("Selected tee details:", tee ? { name: tee.name, id: tee.id } : "Not found");
        
        if (tee) {
          console.log("SELECTED TEE STATE - Name:", tee.name, "ID:", tee.id);
        }
      }
    }
  }, [selectedTeeId, selectedCourse, lastTeeChangeTimestamp]);

  // Add method to explicitly update tee with timestamp
  const updateSelectedTeeId = (teeId: string | null) => {
    console.log("Explicitly updating selectedTeeId to:", teeId);
    setSelectedTeeId(teeId);
    setLastTeeChangeTimestamp(Date.now());
  };

  return {
    currentStep,
    setCurrentStep,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    selectedCourse,
    setSelectedCourse,
    selectedTeeId,
    setSelectedTeeId: updateSelectedTeeId, // Use the new method instead
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
  };
};
