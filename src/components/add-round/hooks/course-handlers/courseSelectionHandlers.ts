
import { SimplifiedCourseDetail, SimplifiedGolfCourse } from "../../types";
import { UseCourseHandlersProps } from "./types";
import { getCourseDetails, GolfCourse } from "@/services/golfCourseApi";
import { convertToSimplifiedCourseDetail, loadUserAddedCourseDetails } from "../../utils/courseUtils";

export function createCourseSelectionHandlers({
  currentStep,
  setCurrentStep,
  setSelectedCourse,
  setSelectedTeeId,
  setScores,
  setIsLoading, 
  setDataLoadingError,
  setOriginalCourseDetail,
  setCourseLoadFailure,
  manualCourseOpen,
  setManualCourseOpen,
  updateScorecardForTee,
  toast
}: Pick<UseCourseHandlersProps, 
  'currentStep' | 
  'setCurrentStep' | 
  'setSelectedCourse' | 
  'setSelectedTeeId' | 
  'setScores' | 
  'setIsLoading' | 
  'setDataLoadingError' | 
  'setOriginalCourseDetail' |
  'manualCourseOpen' |
  'setManualCourseOpen' |
  'setCourseLoadFailure' |
  'updateScorecardForTee' |
  'toast'
>) {

  // Handle user selecting a course from search results
  const handleCourseSelect = async (course: SimplifiedGolfCourse) => {
    setIsLoading(true);
    setDataLoadingError(null);
    console.log("Selected course:", course);
    
    try {
      // Handle user-added course (manually added, not from API)
      if (course.isUserAdded && !course.isApiCourse && !course.apiCourseId) {
        console.log("Loading user-added course:", course.id);
        
        const courseDetail = await loadUserAddedCourseDetails(course.id);
        
        if (!courseDetail) {
          setDataLoadingError("Failed to load course details. Please try a different course or add a new one.");
          setCourseLoadFailure(true);
          return;
        }
        
        console.log("Loaded user-added course details:", courseDetail);
        setSelectedCourse(courseDetail);
        setOriginalCourseDetail(null);
      } 
      // Handle API course or database-stored API course
      else if (course.isApiCourse || course.apiCourseId) {
        const apiId = course.apiCourseId || course.id.toString();
        console.log("Loading API course:", apiId);
        
        const apiCourseDetail = await getCourseDetails(apiId);
        console.log("API course details:", apiCourseDetail);
        
        // Store the original API response
        setOriginalCourseDetail(apiCourseDetail);
        
        // Convert to our simplified format
        const simplifiedCourseDetail = convertToSimplifiedCourseDetail(apiCourseDetail);
        console.log("Simplified API course detail:", simplifiedCourseDetail);
        
        // Add additional properties from the search result
        simplifiedCourseDetail.apiCourseId = apiId;
        
        if (simplifiedCourseDetail.tees.length === 0) {
          setDataLoadingError("This course doesn't have any tee data available. Please try a different course or add a new one.");
          setCourseLoadFailure(true);
          return;
        }
        
        setSelectedCourse(simplifiedCourseDetail);
      } 
      // Fallback for any course without clear origin
      else {
        console.log("Loading course by ID:", course.id);
        
        const courseDetail = await loadUserAddedCourseDetails(course.id);
        
        if (!courseDetail) {
          setDataLoadingError("Failed to load course details. Please try a different course or add a new one.");
          setCourseLoadFailure(true);
          return;
        }
        
        console.log("Loaded course details:", courseDetail);
        setSelectedCourse(courseDetail);
        setOriginalCourseDetail(null);
      }
      
      // Clear any existing scores
      setScores([]);
      
      // Move to the scorecard step
      setCurrentStep('scorecard');
    } catch (error) {
      console.error("Error loading course details:", error);
      setDataLoadingError("Failed to load course details. Please try a different course or add a new one.");
      setCourseLoadFailure(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenManualCourseForm = () => {
    console.log("Opening manual course form");
    setManualCourseOpen(true);
  };
  
  const handleCourseCreated = async (courseId: number, courseName: string) => {
    console.log("Course created:", courseId, courseName);
    
    try {
      // Load the newly created course
      setIsLoading(true);
      
      // First, create a simplified course object to pass to handleCourseSelect
      const newCourse: SimplifiedGolfCourse = {
        id: courseId,
        name: courseName.replace(' [User added course]', ''),
        clubName: courseName.replace(' [User added course]', ''),
        city: '',
        state: '',
        isUserAdded: true,
        isApiCourse: false
      };
      
      // Now use the existing handleCourseSelect function to load the course
      await handleCourseSelect(newCourse);
      
      toast.toast({
        title: "Course Created",
        description: "The course has been successfully created and selected.",
      });
    } catch (error) {
      console.error("Error loading created course:", error);
      toast.toast({
        title: "Error",
        description: "Failed to load the created course. Please try again.",
        variant: "destructive",
      });
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
