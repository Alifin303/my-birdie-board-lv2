
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase, fetchCourseById } from "@/integrations/supabase/client";
import { 
  searchCourses, 
  getCourseDetails, 
  CourseDetail 
} from "@/services/golfCourseApi";
import { 
  Score, 
  SimplifiedGolfCourse, 
  SimplifiedCourseDetail 
} from "../types";
import { 
  convertToSimplifiedCourseDetail, 
  loadUserAddedCourseDetails, 
  fetchUserAddedCourses,
  enhanceCourseResults
} from "../utils/courseUtils";

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
  updateScorecardForTee: (teeId: string, selection?: 'all' | 'front9' | 'back9') => void;
  setHoleSelection: React.Dispatch<React.SetStateAction<'all' | 'front9' | 'back9'>>;
  setCurrentStep: React.Dispatch<React.SetStateAction<'search' | 'scorecard'>>;
  setManualCourseOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCourse: SimplifiedCourseDetail | null;
  selectedTeeId: string | null;
  scores: Score[];
  roundDate: Date | undefined;
  isLoading: boolean;
  searchResults: SimplifiedGolfCourse[];
  toast: ReturnType<typeof useToast>;
  queryClient: ReturnType<typeof useQueryClient>;
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
  queryClient
}: UseCourseHandlersProps) {

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
          
          throw error;
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
      
      // Ensure the course exists in the database
      console.log("Ensuring course exists in database:", selectedCourse);
      let dbCourseId = selectedCourse.id;
      
      // If this is an API course, check if it exists in the database
      if (selectedCourse.apiCourseId) {
        // Check if the course exists by API ID
        const { data: existingCourseData, error: findError } = await supabase
          .from('courses')
          .select('id')
          .eq('api_course_id', selectedCourse.apiCourseId)
          .maybeSingle();
          
        if (findError) {
          console.error("Error checking for existing course:", findError);
        }
        
        if (existingCourseData && existingCourseData.id) {
          console.log("Found existing course in database:", existingCourseData);
          dbCourseId = existingCourseData.id;
        } else {
          // Course doesn't exist, insert it
          console.log("Course not found in database, inserting:", selectedCourse);
          
          const { data: insertedCourse, error: insertError } = await supabase
            .from('courses')
            .insert([{
              name: `${selectedCourse.clubName} - ${selectedCourse.name}`,
              city: selectedCourse.city || '',
              state: selectedCourse.state || '',
              api_course_id: selectedCourse.apiCourseId
            }])
            .select('id')
            .single();
            
          if (insertError) {
            console.error("Error inserting course:", insertError);
            throw new Error(`Failed to insert course: ${insertError.message}`);
          }
          
          if (!insertedCourse) {
            throw new Error("Failed to insert course, no course ID returned");
          }
          
          console.log("Course inserted successfully:", insertedCourse);
          dbCourseId = insertedCourse.id;
        }
      } else {
        // For user-added courses, verify that the course_id exists
        console.log("Verifying user-added course exists:", dbCourseId);
        const { data: courseCheck, error: checkError } = await supabase
          .from('courses')
          .select('id')
          .eq('id', dbCourseId)
          .maybeSingle();
          
        if (checkError) {
          console.error("Error checking course existence:", checkError);
        }
        
        if (!courseCheck) {
          throw new Error(`Course with ID ${dbCourseId} not found in database`);
        }
        
        console.log("User-added course verified:", courseCheck);
      }
      
      console.log("Using course_id for round insertion:", dbCourseId);
      
      // Save the round with the verified course_id
      const { data, error } = await supabase
        .from('rounds')
        .insert([
          {
            user_id: session.user.id,
            course_id: dbCourseId,
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
      return true;
    } catch (error: any) {
      console.error("Error saving round:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save round. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
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
