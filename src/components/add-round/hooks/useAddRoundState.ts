
import { useState, useEffect } from 'react';
import { useCourseHandlers } from './useCourseHandlers';
import { useScoreHandlers } from './useScoreHandlers';
import { Course, Tee, Step } from '../types';

export const useAddRoundState = () => {
  const [step, setStep] = useState<Step>('search');
  const [roundDate, setRoundDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [noResults, setNoResults] = useState(false);
  const [openManualForm, setOpenManualForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedTeeId, setSelectedTeeId] = useState<string | null>(null);
  const [selectedTee, setSelectedTee] = useState<Tee | null>(null);

  const { scores, setScores, initializeScores, handleHoleScoreChange } = useScoreHandlers();

  // Create course handlers with all necessary dependencies
  const courseHandlers = useCourseHandlers({
    setIsLoading,
    setSearchResults,
    setSearchError,
    setNoResults,
    setSelectedCourse,
    setSelectedTeeId,
    setSelectedTee,
    setScores,
    setOpenManualForm,
    selectedCourse,
    selectedTeeId,
    scores
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
    ...courseHandlers
  };
};
