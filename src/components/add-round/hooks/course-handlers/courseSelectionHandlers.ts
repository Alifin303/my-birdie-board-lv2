
import { getCourseDetails, CourseDetail } from "@/services/golfCourseApi";
import { loadUserAddedCourseDetails } from "../../utils/courseUtils";
import { convertToSimplifiedCourseDetail } from "../../utils/courseUtils";
import { SimplifiedGolfCourse, SimplifiedCourseDetail } from "../../types";
import { UseCourseHandlersProps } from "./types";
import { fetchCourseById } from "@/integrations/supabase/course/course-queries";

export function createCourseSelectionHandlers({
  setIsLoading,
  setDataLoadingError,
  setSearchResults,
  setNoResults,
  setSelectedCourse,
  selectedCourse,
  selectedTeeId,
  setSelectedTeeId,
  setScores,
  setActiveScoreTab,
  setHoleSelection,
  setOriginalCourseDetail,
  setSearchQuery,
  setManualCourseOpen,
  courseLoadFailure,
  setCourseLoadFailure,
  updateScorecardForTee
}: Pick<UseCourseHandlersProps, 
  'setIsLoading' | 
  'setDataLoadingError' | 
  'setSearchResults' | 
  'setNoResults' | 
  'setSelectedCourse' | 
  'selectedCourse' | 
  'selectedTeeId' | 
  'setSelectedTeeId' | 
  'setScores' | 
  'setActiveScoreTab' | 
  'setHoleSelection' | 
  'setOriginalCourseDetail' | 
  'setSearchQuery' | 
  'setManualCourseOpen' | 
  'courseLoadFailure' | 
  'setCourseLoadFailure' | 
  'updateScorecardForTee'
>) {
  console.log("useCourseHandlers wrapper - selectedTeeId:", selectedTeeId);
  
  const handleCourseSelect = async (course: SimplifiedGolfCourse) => {
    console.log("Course selected:", course);
    setIsLoading(true);
    setDataLoadingError(null);
    
    try {
      let courseDetail: SimplifiedCourseDetail | null = null;
      
      // Determine if this is a user-added course
      const isUserAdded = course.isUserAdded || course.id.toString().startsWith('user-');
      
      if (isUserAdded) {
        console.log(`Loading user-added course with ID: ${course.id}`);
        
        // Load user-added course details
        courseDetail = await loadUserAddedCourseDetails(course.id);
        
        if (!courseDetail) {
          throw new Error('Failed to load user-added course details');
        }
        
        console.log("Loaded user-added course details:", courseDetail);
        console.log("Tees found:", courseDetail.tees.map(t => ({ id: t.id, name: t.name })));
      } else {
        // For API courses, fetch details from the API
        console.log(`Fetching API course with ID: ${course.apiCourseId}`);
        
        const apiCourseDetail = await getCourseDetails(course.apiCourseId);
        if (!apiCourseDetail) {
          throw new Error('Failed to load course details from API');
        }
        
        setOriginalCourseDetail(apiCourseDetail);
        
        // Convert API course details to our simplified format
        courseDetail = convertToSimplifiedCourseDetail(course, apiCourseDetail);
      }
      
      if (!courseDetail || !courseDetail.tees || courseDetail.tees.length === 0) {
        throw new Error('Course has no tee data available');
      }
      
      console.log("Setting selectedCourse:", courseDetail);
      setSelectedCourse(courseDetail);
      
      // Set the first tee as selected by default
      if (courseDetail.tees && courseDetail.tees.length > 0) {
        const firstTee = courseDetail.tees[0];
        console.log("Setting default selected tee:", firstTee.id, firstTee.name);
        setSelectedTeeId(firstTee.id);
        
        // Initialize scorecard for the first tee
        updateScorecardForTee(courseDetail, firstTee.id);
      } else {
        console.error("No tees available for course:", courseDetail);
        throw new Error('No tees available for this course');
      }
      
      // Reset ui state for scorecard
      setActiveScoreTab("front9");
      setHoleSelection("all");
      
      // Reset any previous failure state
      setCourseLoadFailure(false);
      
    } catch (error: any) {
      console.error("Error selecting course:", error);
      setDataLoadingError(`Failed to load course details: ${error.message}`);
      setCourseLoadFailure(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenManualCourseForm = () => {
    console.log("Opening manual course form");
    setManualCourseOpen(true);
    setSearchQuery('');
    setSearchResults([]);
    setNoResults(false);
  };

  const handleCourseCreated = async (courseId: number) => {
    console.log("Course created, loading details for ID:", courseId);
    setIsLoading(true);
    setDataLoadingError(null);
    
    try {
      // 1. Get the course info from Supabase
      const dbCourse = await fetchCourseById(courseId);
      if (!dbCourse) {
        throw new Error(`Course with ID ${courseId} not found`);
      }
      
      console.log("Course fetched from DB:", dbCourse);
      
      // 2. Get the course details from localStorage
      const courseDetails = await loadUserAddedCourseDetails(courseId);
      
      if (!courseDetails) {
        throw new Error('Course details not found in localStorage');
      }
      
      console.log("Course details from localStorage:", courseDetails);
      
      // 3. Set as selected course
      setSelectedCourse(courseDetails);
      
      // 4. Default tee selection and scorecard initialization
      if (courseDetails.tees && courseDetails.tees.length > 0) {
        const firstTee = courseDetails.tees[0];
        console.log("Setting default selected tee:", firstTee.id, firstTee.name);
        setSelectedTeeId(firstTee.id);
        
        // Initialize scorecard for the first tee
        updateScorecardForTee(courseDetails, firstTee.id);
      } else {
        throw new Error('No tees available for this course');
      }
      
      // 5. Reset ui state for scorecard
      setActiveScoreTab("front9");
      setHoleSelection("all");
      
      // 6. Reset any previous failure state
      setCourseLoadFailure(false);
    } catch (error: any) {
      console.error("Error loading created course:", error);
      setDataLoadingError(`Failed to load course details: ${error.message}`);
      setCourseLoadFailure(true);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleCourseSelect,
    handleOpenManualCourseForm,
    handleCourseCreated
  };
}
