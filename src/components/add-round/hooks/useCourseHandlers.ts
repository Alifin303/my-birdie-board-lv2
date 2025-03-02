
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { searchCourses, getCourseDetails } from '@/services/golfCourseApi';
import { addRound } from '@/integrations/supabase/client';
import { transformCourseDetails } from '../utils/courseUtils';
import { 
  HoleSelection, 
  SimplifiedGolfCourse, 
  SimplifiedCourseDetail,
  CourseDetail
} from '../types';
import { useToast } from '@/hooks/use-toast';

interface UseCourseHandlersProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setSearchResults: React.Dispatch<React.SetStateAction<SimplifiedGolfCourse[]>>;
  setSelectedCourse: React.Dispatch<React.SetStateAction<SimplifiedCourseDetail | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setSearchError: React.Dispatch<React.SetStateAction<string | null>>;
  setNoResults: React.Dispatch<React.SetStateAction<boolean>>;
  setOriginalCourseDetail: React.Dispatch<React.SetStateAction<CourseDetail | null>>;
  setSelectedTeeId: React.Dispatch<React.SetStateAction<string | null>>;
  updateScorecardForTee: (teeId: string, selection?: HoleSelection) => void;
  setHoleSelection: React.Dispatch<React.SetStateAction<HoleSelection>>;
  setCurrentStep: React.Dispatch<React.SetStateAction<'search' | 'scorecard'>>;
  setManualCourseOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCourse: SimplifiedCourseDetail | null;
  selectedTeeId: string | null;
  scores: { hole: number; par: number; strokes?: number; putts?: number }[];
  roundDate: Date | undefined;
  isLoading: boolean;
  searchResults: SimplifiedGolfCourse[];
  toast: ReturnType<typeof useToast>;
  queryClient: any;
  onSaveComplete?: () => void;
}

export function useCourseHandlers({
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
  onSaveComplete
}: UseCourseHandlersProps) {
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }
    
    setIsLoading(true);
    setSearchError(null);
    setNoResults(false);
    
    try {
      const results = await searchCourses(searchQuery);
      setSearchResults(results);
      setNoResults(results.length === 0);
    } catch (error) {
      console.error("Error searching courses:", error);
      setSearchError("Failed to search courses. Please try again.");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCourseSelect = async (course: SimplifiedGolfCourse) => {
    setIsLoading(true);
    setSelectedCourse(null);
    
    try {
      const courseDetails = await getCourseDetails(course.id);
      setOriginalCourseDetail(courseDetails);
      
      const formattedCourse = transformCourseDetails(course.id, courseDetails, course);
      setSelectedCourse(formattedCourse);
      
      const firstTeeId = formattedCourse.tees[0]?.id;
      if (firstTeeId) {
        setSelectedTeeId(firstTeeId);
        updateScorecardForTee(firstTeeId);
      }
      
      setHoleSelection('all');
      setCurrentStep('scorecard');
    } catch (error) {
      console.error("Error fetching course details:", error);
      toast.toast({
        title: "Error",
        description: "Failed to load course details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenManualCourseForm = () => {
    setManualCourseOpen(true);
  };
  
  const handleCourseCreated = (newCourse: SimplifiedCourseDetail) => {
    setSelectedCourse(newCourse);
    
    const firstTeeId = newCourse.tees[0]?.id;
    if (firstTeeId) {
      setSelectedTeeId(firstTeeId);
      updateScorecardForTee(firstTeeId);
    }
    
    setHoleSelection('all');
    setCurrentStep('scorecard');
    setManualCourseOpen(false);
  };
  
  const addRoundMutation = useMutation({
    mutationFn: addRound,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rounds'] });
      toast.toast({
        title: "Success",
        description: "Round added successfully!",
        variant: "default"
      });
      if (onSaveComplete) {
        onSaveComplete();
      }
    },
    onError: (error: any) => {
      console.error("Error saving round:", error);
      toast.toast({
        title: "Error",
        description: "Failed to save round. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleSaveRound = async (): Promise<void> => {
    if (!selectedCourse || !selectedTeeId || !roundDate) {
      toast.toast({
        title: "Missing Information",
        description: "Please ensure all fields are filled in correctly.",
        variant: "destructive"
      });
      return;
    }
    
    const filledScores = scores.filter(score => 
      score.strokes !== undefined && score.strokes > 0
    );
    
    if (filledScores.length === 0) {
      toast.toast({
        title: "No Scores",
        description: "Please enter at least one score.",
        variant: "destructive"
      });
      return;
    }
    
    const selectedTee = selectedCourse.tees.find(tee => tee.id === selectedTeeId);
    if (!selectedTee) {
      toast.toast({
        title: "Invalid Tee",
        description: "The selected tee is invalid. Please select another tee.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await addRoundMutation.mutateAsync({
        courseId: selectedCourse.id,
        courseName: selectedCourse.name,
        clubName: selectedCourse.clubName,
        teeId: selectedTeeId,
        teeName: selectedTee.name,
        teeRating: selectedTee.rating,
        teeSlope: selectedTee.slope,
        datePlayed: roundDate,
        scores: filledScores
      });
    } catch (error) {
      console.error("Error in handleSaveRound:", error);
    }
  };
  
  return {
    handleSearch,
    handleCourseSelect,
    handleOpenManualCourseForm,
    handleCourseCreated,
    handleSaveRound
  };
}
