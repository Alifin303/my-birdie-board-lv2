import { getCourseDetails, CourseDetail } from "@/services/golfCourseApi";
import { loadUserAddedCourseDetails } from "../../utils/courseUtils";
import { convertToSimplifiedCourseDetail } from "../../utils/courseUtils";
import { SimplifiedGolfCourse, SimplifiedCourseDetail } from "../../types";
import { UseCourseHandlersProps } from "./types";
import { fetchCourseById } from "@/integrations/supabase/client";

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
  'toast'
>) {
  
  const handleCourseSelect = async (course: SimplifiedGolfCourse) => {
    console.log("handleCourseSelect called with course:", course);
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
          
          // Ensure all required properties are set
          simplifiedCourseDetail = {
            id: course.id,
            name: course.name,
            clubName: course.clubName,
            city: course.city || '',
            state: course.state || '',
            country: 'United States',
            isUserAdded: true,
            // Make sure we have tees and holes
            tees: cachedCourseDetail.tees && cachedCourseDetail.tees.length > 0 
              ? cachedCourseDetail.tees 
              : createDefaultTees(),
            holes: cachedCourseDetail.holes && cachedCourseDetail.holes.length > 0
              ? cachedCourseDetail.holes
              : createDefaultHoles()
          };
          
          // Log tees for debugging
          console.log("User-added course tees:", simplifiedCourseDetail.tees.map(t => ({
            id: t.id,
            name: t.name,
            gender: t.gender
          })));
        } else {
          console.log("No cached details found for user-added course, creating defaults");
          
          const defaultHoles = createDefaultHoles();
          const defaultTees = createDefaultTees(defaultHoles);
          
          simplifiedCourseDetail = {
            id: course.id,
            name: course.name,
            clubName: course.clubName,
            city: course.city || '',
            state: course.state || '',
            country: 'United States',
            tees: defaultTees,
            holes: defaultHoles,
            isUserAdded: true
          };
          
          try {
            localStorage.setItem(
              `course_details_${course.id}`, 
              JSON.stringify({
                id: course.id,
                name: course.name,
                tees: defaultTees
              })
            );
            console.log("Saved default course details to localStorage:", defaultTees);
          } catch (e) {
            console.error("Error saving to localStorage:", e);
          }
        }
      } 
      else {
        console.log("Loading course from API:", course);
        
        try {
          const courseIdRaw = course.apiCourseId || course.id;
          const courseId = typeof courseIdRaw === 'string' ? courseIdRaw : String(courseIdRaw);
          
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
          
          simplifiedCourseDetail.apiCourseId = courseId;
          
          console.log("Final course detail after processing:", simplifiedCourseDetail);
          console.log("Course tees:", simplifiedCourseDetail.tees.map(t => ({ id: t.id, name: t.name })));
        } catch (error) {
          console.error("Error fetching course details from API:", error);
          const defaultHoles = createDefaultHoles();
          const defaultTees = createDefaultTees(defaultHoles);
          
          simplifiedCourseDetail = {
            id: course.id,
            name: course.name,
            clubName: course.clubName,
            city: course.city || '',
            state: course.state || '',
            country: 'United States',
            tees: defaultTees,
            holes: defaultHoles,
            apiCourseId: course.apiCourseId ? String(course.apiCourseId) : String(course.id)
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
        console.log("Available tees:", simplifiedCourseDetail.tees.map(t => ({ id: t.id, name: t.name })));
        console.log("Setting default tee ID:", defaultTeeId);
        
        // Set the selected tee ID
        setSelectedTeeId(defaultTeeId);
        
        console.log("Default tee set to:", {
          id: defaultTeeId,
          name: simplifiedCourseDetail.tees[0]?.name
        });
        
        // Update scorecard with the selected tee
        console.log("Updating scorecard with tee ID:", defaultTeeId);
        updateScorecardForTee(defaultTeeId, 'all');
        setHoleSelection('all');
        
        // Ensure we're on the scorecard step
        console.log("Setting current step to 'scorecard'");
        setCurrentStep('scorecard');
      } else {
        console.error("No tees found for course:", simplifiedCourseDetail);
        toast.toast({
          title: "Warning",
          description: "No tee boxes found for this course. Please try another course.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Course detail error:", error);
      setSearchError(error.message || "Failed to load course details. Please try again.");
      toast.toast({
        title: "Error",
        description: error.message || "Failed to load course details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultHoles = () => {
    return Array(18).fill(null).map((_, idx) => ({
      number: idx + 1,
      par: 4,
      yards: 400,
      handicap: idx + 1
    }));
  };

  const createDefaultTees = (holes = createDefaultHoles()) => {
    return [
      {
        id: `tee-${Date.now()}-white`,
        name: 'White',
        rating: 72,
        slope: 113,
        par: 72,
        gender: 'male' as const,
        originalIndex: 0,
        yards: 6500,
        holes: holes,
        color: '#FFFFFF'
      },
      {
        id: `tee-${Date.now()}-blue`,
        name: 'Blue',
        rating: 74,
        slope: 125,
        par: 72,
        gender: 'male' as const,
        originalIndex: 1,
        yards: 6800,
        holes: holes,
        color: '#0000FF'
      },
      {
        id: `tee-${Date.now()}-red`,
        name: 'Red',
        rating: 69,
        slope: 113,
        par: 72,
        gender: 'female' as const,
        originalIndex: 2,
        yards: 5800,
        holes: holes,
        color: '#FF0000'
      }
    ];
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
