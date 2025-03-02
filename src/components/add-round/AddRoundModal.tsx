
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase, fetchCourseById } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { 
  searchCourses, 
  getCourseDetails, 
  CourseDetail 
} from "@/services/golfCourseApi";
import { ManualCourseForm } from "@/components/ManualCourseForm";
import { 
  Score, 
  HoleSelection, 
  SimplifiedGolfCourse, 
  SimplifiedCourseDetail, 
  AddRoundModalProps 
} from "./types";
import { 
  convertToSimplifiedCourseDetail, 
  loadUserAddedCourseDetails, 
  fetchUserAddedCourses,
  enhanceCourseResults
} from "./utils/courseUtils";
import { calculateScoreSummary } from "./utils/scoreUtils";
import { SearchStep } from "./components/SearchStep";
import { ScorecardStep } from "./components/ScorecardStep";

export function AddRoundModal({ open, onOpenChange }: AddRoundModalProps) {
  const [currentStep, setCurrentStep] = useState<'search' | 'scorecard'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SimplifiedGolfCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<SimplifiedCourseDetail | null>(null);
  const [selectedTeeId, setSelectedTeeId] = useState<string | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [dataLoadingError, setDataLoadingError] = useState<string | null>(null);
  const [roundDate, setRoundDate] = useState<Date | undefined>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [holeSelection, setHoleSelection] = useState<HoleSelection>('all');
  const [activeScoreTab, setActiveScoreTab] = useState<"front9" | "back9">("front9");
  const [originalCourseDetail, setOriginalCourseDetail] = useState<CourseDetail | null>(null);
  const [noResults, setNoResults] = useState(false);
  const [manualCourseOpen, setManualCourseOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const debouncedSearchTerm = useDebounce(searchQuery, 500);
  const today = new Date();
  
  const manualCourseFormRef = useRef<any>(null);

  useEffect(() => {
    if (debouncedSearchTerm) {
      handleSearch(debouncedSearchTerm);
    } else {
      setSearchResults([]);
      setSearchError(null);
      setNoResults(false);
    }
  }, [debouncedSearchTerm]);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setSearchError(null);
    setNoResults(false);
    
    try {
      // Fetch API courses
      const apiResponse = await searchCourses(query);
      const apiResults = Array.isArray(apiResponse.results) ? apiResponse.results : [];
      
      // Fetch user-added courses
      const userAddedCourses = await fetchUserAddedCourses(query);
      
      // Combine results
      const combinedResults = [
        ...userAddedCourses, 
        ...apiResults.map(course => ({
          id: typeof course.id === 'string' ? parseInt(course.id) : course.id,
          name: course.course_name || (course as any).name || '',
          clubName: course.club_name || (course as any).name || '',
          city: course.location?.city || '',
          state: course.location?.state || '',
          country: course.location?.country || 'United States',
          isUserAdded: false,
          apiCourseId: course.id?.toString()
        }))
      ];
      
      const enhancedResults = enhanceCourseResults(combinedResults);
      
      setSearchResults(enhancedResults);
      setNoResults(enhancedResults.length === 0);
    } catch (error: any) {
      console.error("Search error:", error);
      setSearchError(error.message || "Failed to fetch courses. Please try again.");
      
      // Try to at least get user-added courses if the API fails
      try {
        const userAddedCourses = await fetchUserAddedCourses(query);
        if (userAddedCourses.length > 0) {
          setSearchResults(userAddedCourses);
          setNoResults(false);
        } else {
          setNoResults(true);
        }
      } catch (err) {
        console.error("Failed to get user-added courses as fallback:", err);
        setNoResults(true);
      }
      
      toast({
        title: "API Error",
        description: error.message || "Failed to fetch courses from API. Showing local courses only.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseSelect = async (course: SimplifiedGolfCourse) => {
    setIsLoading(true);
    setSearchError(null);
    setDataLoadingError(null);
    
    try {
      console.log("Selected course:", course);
      
      let simplifiedCourseDetail: SimplifiedCourseDetail;
      
      if (course.isUserAdded) {
        console.log("Loading user-added course from database:", course);
        
        const cachedCourseDetail = loadUserAddedCourseDetails(course.id);
        
        if (cachedCourseDetail) {
          console.log("User-added course details loaded from cache:", cachedCourseDetail);
          
          cachedCourseDetail.id = course.id;
          cachedCourseDetail.name = course.name;
          cachedCourseDetail.clubName = course.clubName;
          cachedCourseDetail.city = course.city;
          cachedCourseDetail.state = course.state;
          cachedCourseDetail.isUserAdded = true;
          
          simplifiedCourseDetail = cachedCourseDetail;
        } else {
          console.log("No cached details found for user-added course, creating defaults");
          
          const defaultHoles = Array(18).fill(null).map((_, idx) => ({
            number: idx + 1,
            par: 4,
            yards: 400,
            handicap: idx + 1
          }));
          
          const defaultTee = {
            id: `tee-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: 'White',
            rating: 72,
            slope: 113,
            par: 72,
            gender: 'male' as const,
            originalIndex: 0,
            holes: defaultHoles
          };
          
          simplifiedCourseDetail = {
            id: course.id,
            name: course.name,
            clubName: course.clubName,
            city: course.city,
            state: course.state,
            tees: [defaultTee],
            holes: defaultHoles,
            isUserAdded: true
          };
          
          try {
            localStorage.setItem(
              `course_details_${course.id}`, 
              JSON.stringify(simplifiedCourseDetail)
            );
            console.log("Saved default course details to localStorage");
          } catch (e) {
            console.error("Error saving to localStorage:", e);
          }
        }
      } 
      else {
        console.log("Loading course from API:", course);
        
        try {
          // Convert courseId to a proper format
          const courseIdRaw = course.apiCourseId || course.id;
          const courseId = typeof courseIdRaw === 'string' ? courseIdRaw : courseIdRaw.toString();
          
          console.log("Fetching API course details for ID:", courseId);
          
          const apiCourseDetail = await getCourseDetails(courseId);
          console.log("API course details (raw):", apiCourseDetail);
          
          setOriginalCourseDetail(apiCourseDetail);
          
          simplifiedCourseDetail = convertToSimplifiedCourseDetail(apiCourseDetail);
          
          if (!simplifiedCourseDetail.name && course.name) {
            console.log("Setting missing course name from search result:", course.name);
            simplifiedCourseDetail.name = course.name;
          }
          if (!simplifiedCourseDetail.clubName && course.clubName) {
            console.log("Setting missing club name from search result:", course.clubName);
            simplifiedCourseDetail.clubName = course.clubName;
          }
          
          simplifiedCourseDetail.apiCourseId = courseId.toString();
          
          console.log("Final course detail after processing:", simplifiedCourseDetail);
        } catch (error) {
          console.error("Error fetching course details from API:", error);
          setDataLoadingError(`Failed to load course details. The API may be unavailable.
Try selecting a different course or adding this course manually.`);
          
          const defaultHoles = Array(18).fill(null).map((_, idx) => ({
            number: idx + 1,
            par: 4,
            yards: 400,
            handicap: idx + 1
          }));
          
          const defaultTee = {
            id: `tee-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: 'White',
            rating: 72,
            slope: 113,
            par: 72,
            gender: 'male' as const,
            originalIndex: 0,
            holes: defaultHoles
          };
          
          // Ensure course.id is a number
          const courseId = typeof course.id === 'string' ? parseInt(course.id, 10) : course.id;
          
          simplifiedCourseDetail = {
            id: courseId,
            name: course.name,
            clubName: course.clubName,
            city: course.city,
            state: course.state,
            tees: [defaultTee],
            holes: defaultHoles,
            apiCourseId: course.apiCourseId || course.id.toString()
          };
        }
      }
      
      console.log("Setting selected course:", simplifiedCourseDetail);
      setSelectedCourse(simplifiedCourseDetail);
      
      setSearchResults([]);
      const displayName = course.clubName !== course.name 
        ? `${course.clubName} - ${course.name}`
        : course.name;
      console.log("Setting search query to:", displayName);
      setSearchQuery(displayName);
      
      if (simplifiedCourseDetail.tees && simplifiedCourseDetail.tees.length > 0) {
        const defaultTeeId = simplifiedCourseDetail.tees[0].id;
        console.log("Setting default tee ID:", defaultTeeId);
        setSelectedTeeId(defaultTeeId);
        
        setTimeout(() => {
          console.log("Updating scorecard with tee ID:", defaultTeeId);
          updateScorecardForTee(defaultTeeId, 'all');
          setHoleSelection('all');
        }, 0);
      }
      
      setCurrentStep('scorecard');
    } catch (error: any) {
      console.error("Course detail error:", error);
      setSearchError(error.message || "Failed to load course details. Please try again.");
      toast({
        title: "Error",
        description: error.message || "Failed to load course details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenManualCourseForm = () => {
    setManualCourseOpen(true);
  };

  const handleCourseCreated = async (courseId: number, courseName: string) => {
    setManualCourseOpen(false);
    
    try {
      // Fetch the newly created course
      const courseData = await fetchCourseById(courseId);
      
      if (courseData) {
        const { clubName, courseName: name } = courseData;
        
        const newCourse: SimplifiedGolfCourse = {
          id: courseId,
          name,
          clubName,
          city: courseData.city || '',
          state: courseData.state || '',
          country: 'United States',
          isUserAdded: true
        };
        
        // Immediately select the new course
        await handleCourseSelect(newCourse);
      }
    } catch (error) {
      console.error("Error fetching newly created course:", error);
      toast({
        title: "Error",
        description: "Course was created but could not be loaded automatically. Please search for it.",
        variant: "destructive",
      });
    }
  };

  const handleBackToSearch = () => {
    setCurrentStep('search');
    setSelectedCourse(null);
    setSelectedTeeId(null);
    setScores([]);
    setSearchQuery('');
    setHoleSelection('all');
    setActiveScoreTab("front9");
  };

  const handleDateSelect = (date: Date | undefined) => {
    setRoundDate(date);
    setCalendarOpen(false);
  };

  const getHolesForTee = (teeId: string) => {
    console.log("Getting holes for tee:", teeId);
    
    if (!selectedCourse) {
      console.error("No course selected");
      return [];
    }
    
    const selectedTee = selectedCourse.tees.find(t => t.id === teeId);
    if (!selectedTee) {
      console.error(`Tee with ID ${teeId} not found`);
      return selectedCourse.holes;
    }
    
    if (selectedTee.holes && selectedTee.holes.length > 0) {
      console.log("Using hole data specific to the selected tee:", selectedTee.holes);
      return selectedTee.holes;
    }
    
    console.log("Tee doesn't have specific hole data, using course's default holes");
    return selectedCourse.holes;
  };

  const updateScorecardForTee = (teeId: string, selection: HoleSelection = 'all') => {
    console.log("Updating scorecard for tee", teeId, "with selection", selection);
    
    if (!selectedCourse) {
      console.error("Cannot update scorecard: No course selected");
      return;
    }
    
    const allHolesData = getHolesForTee(teeId);
    
    console.log("All holes data for selected tee:", allHolesData);
    
    let filteredHoles = [];
    
    if (selection === 'front9') {
      filteredHoles = allHolesData.filter(hole => hole.number <= 9);
      console.log("Filtered for front 9:", filteredHoles);
    } else if (selection === 'back9') {
      filteredHoles = allHolesData.filter(hole => hole.number > 9);
      console.log("Filtered for back 9:", filteredHoles);
    } else {
      filteredHoles = allHolesData;
      console.log("Using all 18 holes");
    }
    
    if (!filteredHoles.length) {
      console.log("No filtered holes, creating defaults");
      if (selection === 'front9') {
        filteredHoles = Array(9).fill(null).map((_, idx) => ({
          number: idx + 1,
          par: 4,
          yards: 400,
          handicap: idx + 1
        }));
      } else if (selection === 'back9') {
        filteredHoles = Array(9).fill(null).map((_, idx) => ({
          number: idx + 10,
          par: 4,
          yards: 400,
          handicap: idx + 10
        }));
      } else {
        filteredHoles = Array(18).fill(null).map((_, idx) => ({
          number: idx + 1,
          par: 4,
          yards: 400,
          handicap: idx + 1
        }));
      }
    }
    
    const newScores = filteredHoles.map(hole => ({
      hole: hole.number,
      par: hole.par,
      strokes: 0,
      putts: undefined,
      yards: hole.yards,
      handicap: hole.handicap
    }));
    
    console.log("New scores array with proper par data:", newScores);
    setScores(newScores);
    
    if (selection !== 'all') {
      setActiveScoreTab(selection === 'front9' ? "front9" : "back9");
    }
  };

  const handleTeeChange = (teeId: string) => {
    console.log("Selected tee ID:", teeId);
    setSelectedTeeId(teeId);
    
    if (selectedCourse) {
      const selectedTee = selectedCourse.tees.find(t => t.id === teeId);
      if (selectedTee && selectedTee.holes) {
        console.log("Using specific hole data from selected tee:", selectedTee.name);
        updateScorecardForTee(teeId, holeSelection);
      } else {
        console.log("No specific hole data found for selected tee, using course defaults");
        updateScorecardForTee(teeId, holeSelection);
      }
    }
  };

  const handleHoleSelectionChange = (selection: HoleSelection) => {
    setHoleSelection(selection);
    updateScorecardForTee(selectedTeeId || selectedCourse?.tees[0].id || 'default-tee', selection);
  };

  const handleScoreChange = (index: number, field: 'strokes' | 'putts', value: string) => {
    const newScores = [...scores];
    const parsedValue = value === '' ? undefined : parseInt(value, 10);
    
    if (!isNaN(parsedValue as number) || value === '') {
      newScores[index] = {
        ...newScores[index],
        [field]: parsedValue,
      };
      setScores(newScores);
    }
  };

  const handleSaveRound = async () => {
    if (!selectedCourse) {
      toast({
        title: "Error",
        description: "No course selected.",
        variant: "destructive",
      });
      return;
    }
    
    if (!roundDate) {
      toast({
        title: "Error",
        description: "Please select a date.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedTeeId) {
      toast({
        title: "Error",
        description: "No tee selected.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');
      
      const selectedTee = selectedCourse.tees.find(tee => tee.id === selectedTeeId);
      if (!selectedTee) throw new Error('Selected tee not found');
      
      const totalStrokes = scores.reduce((sum, score) => sum + (score.strokes || 0), 0);
      const totalPar = scores.reduce((sum, score) => sum + score.par, 0);
      const toParGross = totalStrokes - totalPar;
      
      const { data, error } = await supabase
        .from('rounds')
        .insert([
          {
            user_id: session.user.id,
            course_id: selectedCourse.id,
            date: roundDate.toISOString(),
            tee_name: selectedTee.name,
            tee_id: selectedTeeId,
            gross_score: totalStrokes,
            to_par_gross: toParGross,
            net_score: null,
            to_par_net: null,
            hole_scores: JSON.stringify(scores)
          }
        ]);
        
      if (error) {
        console.error("Error saving round:", error);
        throw error;
      }
      
      console.log("Round saved successfully:", data);
      
      toast({
        title: "Success",
        description: "Round saved successfully!",
      });
      
      // Fix: Using correct format for invalidateQueries
      queryClient.invalidateQueries({ queryKey: ['userRounds'] });
      handleCloseModal();
    } catch (error: any) {
      console.error("Error saving round:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save round. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    onOpenChange(false);
    setCurrentStep('search');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedCourse(null);
    setSelectedTeeId(null);
    setScores([]);
    setSearchError(null);
    setDataLoadingError(null);
    setRoundDate(new Date());
    setHoleSelection('all');
    setActiveScoreTab("front9");
    setManualCourseOpen(false);
  };
  
  // Calculate summary stats for scoring
  const scoreSummary = calculateScoreSummary(scores);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[1000px] p-6 max-h-[90vh] overflow-y-auto">
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
              handleTeeChange={handleTeeChange}
              handleDateSelect={handleDateSelect}
              handleHoleSelectionChange={handleHoleSelectionChange}
              handleScoreChange={handleScoreChange}
              handleBackToSearch={handleBackToSearch}
              handleSaveRound={handleSaveRound}
              handleCloseModal={handleCloseModal}
              scores={scores}
              scoreSummary={scoreSummary}
              holeSelection={holeSelection}
              calendarOpen={calendarOpen}
              setCalendarOpen={setCalendarOpen}
              isLoading={isLoading}
              dataLoadingError={dataLoadingError}
              today={today}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Manual Course Form */}
      <ManualCourseForm
        open={manualCourseOpen}
        onOpenChange={setManualCourseOpen}
        onCourseCreated={handleCourseCreated}
      />
    </>
  );
}
