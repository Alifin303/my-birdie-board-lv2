import { getCourseDetails, CourseDetail } from "@/services/golfCourseApi";
import { loadUserAddedCourseDetails } from "../../utils/courseUtils";
import { convertToSimplifiedCourseDetail } from "../../utils/courseUtils";
import { SimplifiedGolfCourse, SimplifiedCourseDetail } from "../../types";
import { UseCourseHandlersProps } from "./types";
import { fetchCourseById, getCourseMetadataFromLocalStorage } from "@/integrations/supabase";
import { validateAndRepairTeeData, getDefaultTeeId } from "../../utils/teeUtils";

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
        
        const storedMetadata = getCourseMetadataFromLocalStorage(course.id);
        const cachedCourseDetail = loadUserAddedCourseDetails(course.id);
        
        console.log("User-added course metadata from localStorage:", storedMetadata);
        console.log("User-added course details from cache:", cachedCourseDetail);
        
        if (cachedCourseDetail && cachedCourseDetail.tees) {
          console.log("Using cached course details for user-added course");
          
          simplifiedCourseDetail = {
            ...cachedCourseDetail,
            id: course.id,
            name: course.name,
            clubName: course.clubName,
            city: course.city || cachedCourseDetail.city,
            state: course.state || cachedCourseDetail.state,
            isUserAdded: true
          };
        } 
        else if (storedMetadata && storedMetadata.tees) {
          console.log("Using stored metadata for user-added course");
          
          simplifiedCourseDetail = {
            id: course.id,
            name: course.name,
            clubName: course.clubName,
            city: course.city || storedMetadata.city,
            state: course.state || storedMetadata.state,
            tees: storedMetadata.tees,
            holes: storedMetadata.holes,
            isUserAdded: true
          };
        } 
        else {
          console.log("No valid data found for user-added course, creating basic structure");
          
          const defaultHoles = Array(18).fill(null).map((_, idx) => ({
            number: idx + 1,
            par: 4,
            yards: 400,
            handicap: idx + 1
          }));
          
          const defaultTeeId = `tee-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          
          simplifiedCourseDetail = {
            id: course.id,
            name: course.name,
            clubName: course.clubName,
            city: course.city,
            state: course.state,
            tees: [{
              id: defaultTeeId,
              name: 'White',
              rating: 72,
              slope: 113,
              par: 72,
              gender: 'male' as const,
              originalIndex: 0,
              holes: defaultHoles
            }],
            holes: defaultHoles,
            isUserAdded: true
          };
        }
        
        simplifiedCourseDetail = validateAndRepairTeeData(simplifiedCourseDetail);
      } 
      else {
        console.log("Loading course from API:", course);
        
        try {
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
          simplifiedCourseDetail.isUserAdded = false;
          
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
                        (course.id !== undefined ? course.id.toString() : ""),
            isUserAdded: false
          };
          
          throw error;
        }
      }
      
      console.log("Setting selected course:", simplifiedCourseDetail);
      console.log("Course tees before setting state:", 
        simplifiedCourseDetail.tees?.map(t => ({
          id: t.id, 
          name: t.name, 
          par: t.par, 
          rating: t.rating, 
          slope: t.slope
        }))
      );
      
      setSelectedCourse(simplifiedCourseDetail);
      
      setSearchResults([]);
      const displayName = course.clubName !== course.name 
        ? `${course.clubName} - ${course.name}`
        : course.name;
      console.log("Setting search query to:", displayName);
      setSearchQuery(displayName);
      
      if (simplifiedCourseDetail.tees && simplifiedCourseDetail.tees.length > 0) {
        const defaultTeeId = getDefaultTeeId(simplifiedCourseDetail);
        
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
        
        if (defaultTeeId) {
          setSelectedTeeId(defaultTeeId);
          
          const selectedTee = simplifiedCourseDetail.tees.find(tee => tee.id === defaultTeeId);
          
          console.log("Default tee set to:", {
            id: defaultTeeId,
            name: selectedTee?.name,
            par: selectedTee?.par,
            rating: selectedTee?.rating,
            slope: selectedTee?.slope
          });
          
          updateScorecardForTee(defaultTeeId, holeSelection || 'all');
        } else {
          throw new Error("Could not find a valid tee for this course");
        }
      } else {
        console.error("No tees found for course:", simplifiedCourseDetail);
        throw new Error("No tee boxes found for this course");
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
        const newCourse: SimplifiedGolfCourse = {
          id: courseId,
          name: courseData.name,
          clubName: courseData.name,
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
