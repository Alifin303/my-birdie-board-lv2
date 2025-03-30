
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
  const [courseAndTeeReady, setCourseAndTeeReady] = useState<boolean>(false);
  const [courseLoadFailure, setCourseLoadFailure] = useState<boolean>(false);

  // Reset selectedTeeId whenever selectedCourse changes
  useEffect(() => {
    if (selectedCourse && selectedCourse.tees && selectedCourse.tees.length > 0) {
      console.log("Selected course changed, setting default tee:", selectedCourse.tees[0].name);
      setSelectedTeeId(selectedCourse.tees[0].id);
      // Reset any course load failure
      setCourseLoadFailure(false);
    } else {
      setSelectedTeeId(null);
      // If course selection is completed but no tees are found, mark as failure
      if (selectedCourse && (!selectedCourse.tees || selectedCourse.tees.length === 0)) {
        console.error("Course selected but no tees available:", selectedCourse);
        setCourseLoadFailure(true);
      }
    }
  }, [selectedCourse]);

  // Enhanced logging for debugging course loading issues
  useEffect(() => {
    if (selectedCourse) {
      console.log("Course loaded:", {
        id: selectedCourse.id,
        name: selectedCourse.name,
        isUserAdded: selectedCourse.isUserAdded,
        teesCount: selectedCourse.tees?.length || 0
      });
      
      if (selectedCourse.tees && selectedCourse.tees.length > 0) {
        console.log("Course tees:", selectedCourse.tees.map(t => ({
          id: t.id,
          name: t.name,
          par: t.par,
          rating: t.rating,
          slope: t.slope,
          holesCount: t.holes?.length || 0
        })));
      } else {
        console.error("No tees found for course:", selectedCourse.id);
      }
    }
  }, [selectedCourse]);

  // Log selection changes for debugging
  useEffect(() => {
    if (selectedTeeId) {
      console.log("Selected tee ID state updated:", selectedTeeId);
      
      if (selectedCourse && selectedCourse.tees) {
        const tee = selectedCourse.tees.find(t => t.id === selectedTeeId);
        console.log("Selected tee details:", tee ? { name: tee.name, id: tee.id } : "Not found");
      }
    }
  }, [selectedTeeId, selectedCourse]);

  // New effect to track when both course and tee are fully ready
  useEffect(() => {
    if (selectedCourse && selectedTeeId) {
      const tee = selectedCourse.tees.find(t => t.id === selectedTeeId);
      if (tee) {
        console.log("🔄 Both course and tee are set - marking state as ready");
        console.log("Ready course:", selectedCourse.name, selectedCourse.id);
        console.log("Ready tee:", tee.name, selectedTeeId);
        setCourseAndTeeReady(true);
      } else {
        console.error("Selected tee ID doesn't match any tee in the course:", selectedTeeId);
        setCourseAndTeeReady(false);
      }
    } else {
      setCourseAndTeeReady(false);
    }
  }, [selectedCourse, selectedTeeId]);

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
  };
};
