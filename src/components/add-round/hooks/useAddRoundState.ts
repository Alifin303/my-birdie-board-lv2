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

  useEffect(() => {
    console.log("selectedCourse changed:", selectedCourse?.name);
    
    if (selectedCourse && selectedCourse.tees && selectedCourse.tees.length > 0) {
      console.log("Selected course changed, setting default tee:", selectedCourse.tees[0].name);
      console.log("Available tees:", selectedCourse.tees.map(t => ({ id: t.id, name: t.name })));
      
      const defaultTeeId = selectedCourse.tees[0].id;
      console.log("Setting default tee ID:", defaultTeeId);
      setSelectedTeeId(defaultTeeId);
      
      setTimeout(() => {
        console.log("Delayed tee ID check - selected tee ID is now:", defaultTeeId);
      }, 100);
    } else {
      if (selectedCourse) {
        console.warn("Selected course has no tees:", selectedCourse);
      }
      setSelectedTeeId(null);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedTeeId) {
      console.log("Selected tee ID state updated:", selectedTeeId);
      
      if (selectedCourse && selectedCourse.tees) {
        const tee = selectedCourse.tees.find(t => t.id === selectedTeeId);
        console.log("Selected tee details:", tee ? { name: tee.name, id: tee.id } : "Not found");
      }
    } else {
      console.log("Selected tee ID is null");
    }
  }, [selectedTeeId, selectedCourse]);

  useEffect(() => {
    console.log("Current step changed to:", currentStep);
  }, [currentStep]);

  useEffect(() => {
    console.log("Scores updated, count:", scores.length);
  }, [scores]);

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
    setManualCourseOpen
  };
};
