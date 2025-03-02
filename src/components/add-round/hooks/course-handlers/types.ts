
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CourseDetail } from "@/services/golfCourseApi";
import { 
  SimplifiedGolfCourse, 
  SimplifiedCourseDetail,
  HoleSelection,
  Score,
  HoleScore,
  Step
} from "../../types";

export interface UseCourseHandlersProps {
  searchValue: string;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  setSearchResults: React.Dispatch<React.SetStateAction<SimplifiedGolfCourse[]>>;
  setSelectedCourse: React.Dispatch<React.SetStateAction<SimplifiedCourseDetail | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setSearchError: React.Dispatch<React.SetStateAction<string | null>>;
  setNoResults: React.Dispatch<React.SetStateAction<boolean>>;
  setOriginalCourseDetail: React.Dispatch<React.SetStateAction<CourseDetail | null>>;
  setSelectedTeeId: React.Dispatch<React.SetStateAction<string | null>>;
  setHoleSelection: React.Dispatch<React.SetStateAction<HoleSelection>>;
  setStep: React.Dispatch<React.SetStateAction<Step>>;
  setManualCourseOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setScores: React.Dispatch<React.SetStateAction<HoleScore[]>>;
  selectedCourse: SimplifiedCourseDetail | null;
  selectedTeeId: string | null;
  scores: HoleScore[];
  roundDate: Date | undefined;
  isLoading: boolean;
  searchResults: SimplifiedGolfCourse[];
  toast?: ReturnType<typeof useToast>;
  queryClient?: ReturnType<typeof useQueryClient>;
}

export interface CourseHandlers {
  handleSearch: (query: string) => Promise<void>;
  handleCourseSelect: (course: SimplifiedGolfCourse) => Promise<void>;
  handleOpenManualCourseForm: () => void;
  handleCourseCreated: (courseData: any) => void;
  handleSaveRound: () => Promise<boolean>;
}
