
import { useState, useEffect } from 'react';
import { useCourseHandlers } from './useCourseHandlers';
import { useScoreHandlers } from './useScoreHandlers';
import { SimplifiedCourseDetail, HoleScore, Step, Tee } from '../types';
import { CourseDetail } from '@/services/golfCourseApi';

export const useAddRoundState = () => {
  const [step, setStep] = useState<Step>('search');
  const [roundDate, setRoundDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [noResults, setNoResults] = useState(false);
  const [openManualForm, setOpenManualForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<SimplifiedCourseDetail | null>(null);
  const [selectedTeeId, setSelectedTeeId] = useState<string | null>(null);
  const [selectedTee, setSelectedTee] = useState<Tee | null>(null);
  const [dataLoadingError, setDataLoadingError] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [holeSelection, setHoleSelection] = useState<'all' | 'front9' | 'back9'>('all');
  const [activeScoreTab, setActiveScoreTab] = useState('front9');
  const [originalCourseDetail, setOriginalCourseDetail] = useState<CourseDetail | null>(null);
  const [manualCourseOpen, setManualCourseOpen] = useState(false);

  const { 
    scores, 
    setScores, 
    initializeScores, 
    handleHoleScoreChange,
    handleScoreChange,
    handleHoleSelectionChange,
    updateScorecardForTee,
    handleTeeChange
  } = useScoreHandlers();

  // Create course handlers with all necessary dependencies
  const courseHandlers = useCourseHandlers({
    searchValue,
    setSearchValue,
    setSearchResults,
    setSelectedCourse,
    setSelectedTeeId,
    setIsLoading,
    setSearchError,
    setNoResults,
    setOriginalCourseDetail,
    setHoleSelection,
    setStep,
    setManualCourseOpen,
    selectedCourse,
    selectedTeeId,
    scores,
    roundDate,
    isLoading,
    searchResults
  });

  // Initialize scores whenever the selected tee or course changes
  useEffect(() => {
    if (selectedTee && selectedCourse) {
      console.log("Selected tee changed, initializing scores:", selectedTee.name);
      initializeScores(selectedTee, selectedCourse);
    }
  }, [selectedTee, selectedCourse]);

  // Log state changes for debugging
  useEffect(() => {
    console.log("Current state updated:", { 
      selectedCourse: selectedCourse?.name,
      selectedTeeId,
      selectedTee: selectedTee?.name
    });
  }, [selectedCourse, selectedTeeId, selectedTee]);

  const resetState = () => {
    setStep('search');
    setRoundDate(new Date());
    setSearchValue('');
    setSearchResults([]);
    setSearchError(null);
    setNoResults(false);
    setOpenManualForm(false);
    setSelectedCourse(null);
    setSelectedTeeId(null);
    setSelectedTee(null);
    setScores([]);
    setDataLoadingError(null);
    setCalendarOpen(false);
    setHoleSelection('all');
    setActiveScoreTab('front9');
    setOriginalCourseDetail(null);
    setManualCourseOpen(false);
  };

  return {
    step,
    setStep,
    roundDate,
    setRoundDate,
    isLoading,
    setIsLoading,
    searchValue,
    setSearchValue,
    searchResults,
    setSearchResults,
    searchError,
    setSearchError,
    noResults,
    setNoResults,
    openManualForm,
    setOpenManualForm,
    selectedCourse,
    setSelectedCourse,
    selectedTeeId,
    setSelectedTeeId,
    selectedTee,
    setSelectedTee,
    scores,
    setScores,
    handleHoleScoreChange,
    resetState,
    dataLoadingError,
    setDataLoadingError,
    calendarOpen,
    setCalendarOpen,
    holeSelection,
    setHoleSelection,
    activeScoreTab,
    setActiveScoreTab,
    originalCourseDetail,
    setOriginalCourseDetail,
    manualCourseOpen,
    setManualCourseOpen,
    handleScoreChange,
    handleHoleSelectionChange,
    updateScorecardForTee,
    handleTeeChange,
    ...courseHandlers
  };
};
