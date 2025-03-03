
import { getCourseDetails, CourseDetail } from "@/services/golfCourseApi";
import { loadUserAddedCourseDetails } from "../../utils/courseUtils";
import { convertToSimplifiedCourseDetail } from "../../utils/courseUtils";
import { SimplifiedGolfCourse, SimplifiedCourseDetail } from "../../types";
import { UseCourseHandlersProps } from "./types";
import { fetchCourseById, getCourseMetadataFromLocalStorage } from "@/integrations/supabase/client";

export function createCourseSelectionHandlers({
  setIsLoading,
  setSearchError,
  setSelectedCourse,
  setSearchResults,
  setSearchQuery,
  setSelectedTeeId,
  updateScorecardForTee,
  setHoleSelection,
  setCurrentStep,
  setOriginalCourseDetail,
  setManualCourseOpen,
  setCourseLoadFailure,
  toast
}: Pick<UseCourseHandlersProps, 
  'setIsLoading' | 
  'setSearchError' | 
  'setSelectedCourse' | 
  'setSearchResults' | 
  'setSearchQuery' |
  'setSelectedTeeId' | 
  'updateScorecardForTee' | 
  'setHoleSelection' | 
  'setCurrentStep' |
  'setOriginalCourseDetail' |
  'setManualCourseOpen' |
  'setCourseLoadFailure' |
  'toast'
>) {
  
  const handleCourseSelect = async (course: SimplifiedGolfCourse) => {
    setIsLoading(true);
    setSearchError(null);
    
    try {
      console.log("Selected course:", course);
      
      let simplifiedCourseDetail: SimplifiedCourseDetail;
      
      if (course.isUserAdded) {
        console.log("Loading user-added course from database:", course);
        
        // First check localStorage for cached course details
        const cachedCourseDetail = loadUserAddedCourseDetails(course.id);
        
        if (cachedCourseDetail) {
          console.log("User-added course details loaded from cache:", cachedCourseDetail);
          console.log("Cached tees:", cachedCourseDetail.tees?.map(t => ({ id: t.id, name: t.name })));
          
          // IMPORTANT FIX: Ensure we preserve the entire cached tee data
          cachedCourseDetail.id = course.id;
          cachedCourseDetail.name = course.name;
          cachedCourseDetail.clubName = course.clubName;
          cachedCourseDetail.city = course.city;
          cachedCourseDetail.state = course.state;
          cachedCourseDetail.isUserAdded = true;
          
          // Make sure we have at least one tee
          if (!cachedCourseDetail.tees || cachedCourseDetail.tees.length === 0) {
            console.log("No tees found in cached course details, creating default tee");
            
            const defaultHoles = Array(18).fill(null).map((_, idx) => ({
              number: idx + 1,
              par: 4,
              yards: 400,
              handicap: idx + 1
            }));
            
            const teeId = `tee-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            cachedCourseDetail.tees = [{
              id: teeId,
              name: 'White',
              rating: 72,
              slope: 113,
              par: 72,
              gender: 'male' as const,
              originalIndex: 0,
              holes: defaultHoles
            }];
            
            cachedCourseDetail.holes = defaultHoles;
            
            // Update localStorage with fixed data
            try {
              localStorage.setItem(
                `course_details_${course.id}`, 
                JSON.stringify(cachedCourseDetail)
              );
              console.log("Updated course details with default tee in localStorage");
            } catch (e) {
              console.error("Error saving to localStorage:", e);
            }
          }
          
          simplifiedCourseDetail = cachedCourseDetail;
        } else {
          console.log("No cached details found for user-added course, creating defaults");
          
          // Try to get metadata from localStorage using the course-utils function
          const metadata = getCourseMetadataFromLocalStorage(course.id);
          console.log("Metadata from localStorage:", metadata);
          
          const defaultHoles = Array(18).fill(null).map((_, idx) => ({
            number: idx + 1,
            par: 4,
            yards: 400,
            handicap: idx + 1
          }));
          
          const teeId = `tee-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          console.log("Generated new tee ID:", teeId);
          
          const defaultTee = {
            id: teeId,
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
          const courseIdRaw = course.apiCourseId || course.id;
          // Ensure courseId is a string
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
          console.log("Course tees:", simplifiedCourseDetail.tees.map(t => ({ id: t.id, name: t.name, par: t.par, rating: t.rating, slope: t.slope })));
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
          
          simplifiedCourseDetail = {
            id: course.id,
            name: course.name,
            clubName: course.clubName,
            city: course.city,
            state: course.state,
            tees: [defaultTee],
            holes: defaultHoles,
            apiCourseId: typeof course.apiCourseId === 'string' ? course.apiCourseId : 
                        (course.id !== undefined ? course.id.toString() : "")
          };
          
          throw error;
        }
      }
      
      console.log("Setting selected course:", simplifiedCourseDetail);
      console.log("Course tees before setting state:", 
        simplifiedCourseDetail.tees.map(t => ({
          id: t.id, 
          name: t.name, 
          par: t.par, 
          rating: t.rating, 
          slope: t.slope
        }))
      );
      
      // Set the selected course in state
      setSelectedCourse(simplifiedCourseDetail);
      
      // Clear search results and update search query display
      setSearchResults([]);
      const displayName = course.clubName !== course.name 
        ? `${course.clubName} - ${course.name}`
        : course.name;
      console.log("Setting search query to:", displayName);
      setSearchQuery(displayName);
      
      // Handle tee selection and scorecard setup
      if (simplifiedCourseDetail.tees && simplifiedCourseDetail.tees.length > 0) {
        const defaultTeeId = simplifiedCourseDetail.tees[0].id;
        console.log("Available tees:", 
          simplifiedCourseDetail.tees.map(t => ({ 
            id: t.id, 
            name: t.name,
            par: t.par,
            rating: t.rating,
            slope: t.slope
          }))
        );
        console.log("Setting default tee ID:", defaultTeeId);
        
        // Set the selected tee ID first
        setSelectedTeeId(defaultTeeId);
        
        console.log("Default tee set to:", {
          id: defaultTeeId,
          name: simplifiedCourseDetail.tees[0]?.name,
          par: simplifiedCourseDetail.tees[0]?.par,
          rating: simplifiedCourseDetail.tees[0]?.rating,
          slope: simplifiedCourseDetail.tees[0]?.slope
        });
        
        // We will now let the useEffect in useAddRoundState handle the scorecard update
        // once both course and tee are confirmed set
      } else {
        console.error("No tees found for course:", simplifiedCourseDetail);
        
        // Create a default tee if none exists
        const defaultHoles = Array(18).fill(null).map((_, idx) => ({
          number: idx + 1,
          par: 4,
          yards: 400,
          handicap: idx + 1
        }));
        
        const defaultTeeId = `tee-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const defaultTee = {
          id: defaultTeeId,
          name: 'White',
          rating: 72,
          slope: 113,
          par: 72,
          gender: 'male' as const,
          originalIndex: 0,
          holes: defaultHoles
        };
        
        // Update the course detail with the default tee
        simplifiedCourseDetail.tees = [defaultTee];
        simplifiedCourseDetail.holes = defaultHoles;
        
        // Update state with the modified course detail
        setSelectedCourse(simplifiedCourseDetail);
        setSelectedTeeId(defaultTeeId);
        
        console.log("Created default tee:", defaultTee);
        console.log("Updated course with default tee:", simplifiedCourseDetail);
        
        // Update localStorage if it's a user-added course
        if (simplifiedCourseDetail.isUserAdded) {
          try {
            localStorage.setItem(
              `course_details_${course.id}`, 
              JSON.stringify(simplifiedCourseDetail)
            );
            console.log("Updated course details with default tee in localStorage");
          } catch (e) {
            console.error("Error saving to localStorage:", e);
          }
        }
      }
      
      setCurrentStep('scorecard');
    } catch (error: any) {
      console.error("Course detail error:", error);
      setSearchError(error.message || "Failed to load course details. Please try again.");
      setCourseLoadFailure(true);
      toast.toast({
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
        
        await handleCourseSelect(newCourse);
      }
    } catch (error) {
      console.error("Error fetching newly created course:", error);
      toast.toast({
        title: "Error",
        description: "Course was created but could not be loaded automatically. Please search for it.",
        variant: "destructive",
      });
    }
  };

  return {
    handleCourseSelect,
    handleOpenManualCourseForm,
    handleCourseCreated
  };
}
