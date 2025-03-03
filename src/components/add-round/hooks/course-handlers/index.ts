
import { UseCourseHandlersProps, CourseHandlers } from "./types";
import { createSearchHandlers } from "./searchHandlers";
import { createCourseSelectionHandlers } from "./courseSelectionHandlers";
import { createSaveRoundHandler } from "./saveRoundHandler";

export function useCourseHandlers(props: UseCourseHandlersProps): CourseHandlers {
  console.log("useCourseHandlers - selectedTeeId:", props.selectedTeeId);
  console.log("useCourseHandlers - selectedCourse:", props.selectedCourse);
  
  const { handleSearch: searchHandler } = createSearchHandlers({
    setIsLoading: props.setIsLoading,
    setSearchError: props.setSearchError,
    setNoResults: props.setNoResults,
    setSearchResults: props.setSearchResults,
    toast: props.toast
  });
  
  const { 
    handleCourseSelect, 
    handleOpenManualCourseForm,
    handleCourseCreated: courseCreatedHandler
  } = createCourseSelectionHandlers(props);
  
  const { handleSaveRound } = createSaveRoundHandler(props);

  // Wrap handlers to match the expected interface types
  const handleSearch = async (): Promise<void> => {
    return await searchHandler(props.searchQuery);
  };

  const handleCourseCreated = async (courseData: any): Promise<void> => {
    if (typeof courseData === 'object' && courseData !== null) {
      // Extract courseId from the courseData object
      const courseId = courseData.id || courseData;
      return await courseCreatedHandler(courseId);
    } else {
      // For backward compatibility, assume courseData is the courseId
      return await courseCreatedHandler(courseData);
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

export type { UseCourseHandlersProps, CourseHandlers };
