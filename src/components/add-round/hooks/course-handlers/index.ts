
import { UseCourseHandlersProps, CourseHandlers } from "./types";
import { createSearchHandlers } from "./searchHandlers";
import { createCourseSelectionHandlers } from "./courseSelectionHandlers";
import { createSaveRoundHandler } from "./saveRoundHandler";

export function useCourseHandlers(props: UseCourseHandlersProps): CourseHandlers {
  console.log("useCourseHandlers - selectedTeeId:", props.selectedTeeId);
  console.log("useCourseHandlers - selectedCourse:", props.selectedCourse);
  
  const { handleSearch } = createSearchHandlers(props);
  
  const { 
    handleCourseSelect, 
    handleOpenManualCourseForm,
    handleCourseCreated 
  } = createCourseSelectionHandlers(props);
  
  const { handleSaveRound } = createSaveRoundHandler(props);

  return {
    handleSearch,
    handleCourseSelect,
    handleOpenManualCourseForm,
    handleCourseCreated,
    handleSaveRound
  };
}

export type { UseCourseHandlersProps, CourseHandlers };
