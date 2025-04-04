
import { Dispatch, SetStateAction } from "react";
import { 
  SimplifiedGolfCourse, 
  SimplifiedCourseDetail,
  Score,
  HoleSelection,
  CourseDetail
} from "../../types";
import { ToastApi } from "@/hooks/use-toast";
import { QueryClient } from "@tanstack/react-query";

export interface UseCourseHandlersProps {
  currentStep: 'search' | 'scorecard';
  setCurrentStep: Dispatch<SetStateAction<'search' | 'scorecard'>>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  searchResults: SimplifiedGolfCourse[];
  setSearchResults: Dispatch<SetStateAction<SimplifiedGolfCourse[]>>;
  selectedCourse: SimplifiedCourseDetail | null;
  setSelectedCourse: Dispatch<SetStateAction<SimplifiedCourseDetail | null>>;
  selectedTeeId: string | null;
  setSelectedTeeId: Dispatch<SetStateAction<string | null>>;
  scores: Score[];
  setScores: Dispatch<SetStateAction<Score[]>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  searchError: string | null;
  setSearchError: Dispatch<SetStateAction<string | null>>;
  dataLoadingError: string | null;
  setDataLoadingError: Dispatch<SetStateAction<string | null>>;
  roundDate: Date | undefined;
  setRoundDate: Dispatch<SetStateAction<Date | undefined>>;
  calendarOpen: boolean;
  setCalendarOpen: Dispatch<SetStateAction<boolean>>;
  holeSelection: HoleSelection;
  setHoleSelection: Dispatch<SetStateAction<HoleSelection>>;
  activeScoreTab: "front9" | "back9";
  setActiveScoreTab: Dispatch<SetStateAction<"front9" | "back9">>;
  originalCourseDetail: SimplifiedCourseDetail | null;
  setOriginalCourseDetail: Dispatch<SetStateAction<SimplifiedCourseDetail | null>>;
  noResults: boolean;
  setNoResults: Dispatch<SetStateAction<boolean>>;
  manualCourseOpen: boolean;
  setManualCourseOpen: Dispatch<SetStateAction<boolean>>;
  courseAndTeeReady: boolean;
  updateScorecardForTee: (teeId: string, selection: HoleSelection) => void;
  courseLoadFailure: boolean;
  setCourseLoadFailure: Dispatch<SetStateAction<boolean>>;
  toast: ToastApi;
  queryClient: QueryClient;
}

export interface CourseHandlers {
  handleSearch: () => Promise<void>;
  handleCourseSelect: (course: SimplifiedGolfCourse) => Promise<void>;
  handleOpenManualCourseForm: () => void;
  handleCourseCreated: (courseData: any) => Promise<void>;
  handleSaveRound: () => Promise<boolean>;
}
