
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
  
  const { handleSaveRound } = createSaveRoundHandler({
    selectedCourse: props.selectedCourse,
    selectedTeeId: props.selectedTeeId,
    roundDate: props.roundDate,
    scores: props.scores,
    setIsLoading: props.setIsLoading,
    toast: props.toast,
    queryClient: props.queryClient,
    lastTeeChangeTimestamp: props.lastTeeChangeTimestamp
  });

  return {
    handleSearch,
    handleCourseSelect,
    handleOpenManualCourseForm,
    handleCourseCreated,
    handleSaveRound
  };
}

export type { UseCourseHandlersProps, CourseHandlers };
