import { QueryClient } from "@tanstack/react-query";
import { 
  SimplifiedGolfCourse, 
  SimplifiedCourseDetail, 
  Score, 
  HoleSelection,
  CourseDetail
} from "../types";

// We need to update the interface to include the onSaveComplete callback
interface UseCourseHandlersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SimplifiedGolfCourse[]) => void;
  setSelectedCourse: (course: SimplifiedCourseDetail | null) => void;
  setIsLoading: (loading: boolean) => void;
  setSearchError: (error: string | null) => void;
  setNoResults: (noResults: boolean) => void;
  setOriginalCourseDetail: (detail: CourseDetail | null) => void;
  setSelectedTeeId: (teeId: string | null) => void;
  updateScorecardForTee: (course: SimplifiedCourseDetail, teeId: string) => void;
  setHoleSelection: (selection: HoleSelection) => void;
  setCurrentStep: (step: 'search' | 'scorecard') => void;
  setManualCourseOpen: (open: boolean) => void;
  selectedCourse: SimplifiedCourseDetail | null;
  selectedTeeId: string | null;
  scores: Score[];
  roundDate: Date | undefined;
  isLoading: boolean;
  searchResults: SimplifiedGolfCourse[];
  toast: any;
  queryClient: QueryClient;
  onSaveComplete?: () => void; // Add callback for when save is complete
}

export const useCourseHandlers = ({
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
}: UseCourseHandlersProps) => {
  
  const handleSearch = async (query: string): Promise<void> => {
    if (!query || query.length < 3) {
      setSearchError("Please enter at least 3 characters to search");
      return;
    }

    setIsLoading(true);
    setSearchError(null);
    setNoResults(false);

    try {
      const response = await fetch(`/api/courses/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search courses');
      }
      
      const data = await response.json();
      
      if (data.length === 0) {
        setNoResults(true);
      }
      
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching courses:', error);
      setSearchError('An error occurred while searching. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseSelect = async (course: SimplifiedGolfCourse): Promise<void> => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/courses/${course.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to load course details');
      }
      
      const courseDetail = await response.json();
      setOriginalCourseDetail(courseDetail);
      
      // Create a simplified version of the course detail
      const simplifiedCourseDetail: SimplifiedCourseDetail = {
        id: courseDetail.id,
        name: courseDetail.name,
        clubName: courseDetail.clubName || courseDetail.name,
        city: courseDetail.city,
        state: courseDetail.state,
        isUserAdded: courseDetail.isUserAdded,
        tees: courseDetail.tees.map((tee: any) => ({
          id: tee.id,
          name: tee.name,
          gender: tee.gender,
          par: tee.par,
          holes: tee.holes
        }))
      };
      
      setSelectedCourse(simplifiedCourseDetail);
      
      // Select the first tee by default
      if (simplifiedCourseDetail.tees.length > 0) {
        const defaultTeeId = simplifiedCourseDetail.tees[0].id;
        setSelectedTeeId(defaultTeeId);
        updateScorecardForTee(simplifiedCourseDetail, defaultTeeId);
      }
      
      setHoleSelection('all');
      setCurrentStep('scorecard');
    } catch (error) {
      console.error('Error loading course details:', error);
      toast.toast({
        title: "Error",
        description: "Failed to load course details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenManualCourseForm = () => {
    setManualCourseOpen(true);
  };

  const handleCourseCreated = (newCourse: SimplifiedGolfCourse) => {
    // Add the new course to search results
    const updatedResults = [newCourse, ...searchResults];
    setSearchResults(updatedResults);
    
    // Select the new course
    handleCourseSelect(newCourse);
  };
  
  const handleSaveRound = async (): Promise<void> => {
    if (isLoading || !selectedCourse || !selectedTeeId || !roundDate) {
      toast.toast({
        title: "Missing Information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Check if there are scores to save
    const hasScores = scores.some((s) => s.strokes !== null && s.strokes > 0);
    if (!hasScores) {
      toast.toast({
        title: "Missing Scores",
        description: "Please enter at least one hole score.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Convert scores to the format expected by the API
      const roundScores = scores
        .filter((s) => s.strokes !== null && s.strokes > 0)
        .map((s) => ({
          hole: s.hole,
          strokes: s.strokes,
          putts: s.putts || null,
        }));

      // Prepare the round data
      const roundData = {
        courseId: selectedCourse.id,
        date: roundDate.toISOString().split('T')[0],
        teeId: selectedTeeId,
        scores: roundScores,
      };

      // Save the round to the database
      const response = await fetch('/api/rounds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roundData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save round');
      }

      // Show success message
      toast.toast({
        title: "Round Saved",
        description: "Your round has been successfully saved.",
      });

      // Invalidate rounds query to refresh data
      queryClient.invalidateQueries({ queryKey: ['rounds'] });
      
      // Call the onSaveComplete callback if provided
      if (onSaveComplete) {
        onSaveComplete();
      }
      
      return;
    } catch (error) {
      console.error('Error saving round:', error);
      toast.toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save round",
        variant: "destructive",
      });
      return;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSearch,
    handleCourseSelect,
    handleOpenManualCourseForm,
    handleCourseCreated,
    handleSaveRound,
  };
};
