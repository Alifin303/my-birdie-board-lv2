
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CourseDetail } from "@/services/golfCourseApi";
import { 
  Score, 
  SimplifiedGolfCourse, 
  SimplifiedCourseDetail,
  HoleSelection,
  SimplifiedTee
} from "../../types";

export interface UseCourseHandlersProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setSearchResults: React.Dispatch<React.SetStateAction<SimplifiedGolfCourse[]>>;
  setSelectedCourse: React.Dispatch<React.SetStateAction<SimplifiedCourseDetail | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setSearchError: React.Dispatch<React.SetStateAction<string | null>>;
  setNoResults: React.Dispatch<React.SetStateAction<boolean>>;
  setOriginalCourseDetail: React.Dispatch<React.SetStateAction<CourseDetail | null>>;
  setSelectedTeeId: React.Dispatch<React.SetStateAction<string | null>>;
  updateScorecardForTee: (teeId: string, selection?: HoleSelection) => void;
  setHoleSelection: React.Dispatch<React.SetStateAction<HoleSelection>>;
  setCurrentStep: React.Dispatch<React.SetStateAction<'search' | 'scorecard'>>;
  setManualCourseOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCourse: SimplifiedCourseDetail | null;
  selectedTeeId: string | null;
  scores: Score[];
  roundDate: Date | undefined;
  isLoading: boolean;
  searchResults: SimplifiedGolfCourse[];
  toast: ReturnType<typeof useToast>;
  queryClient: ReturnType<typeof useQueryClient>;
}

export interface UseScoreHandlersProps {
  selectedCourse: SimplifiedCourseDetail | null;
  selectedTeeId: string | null;
  setSelectedTeeId: React.Dispatch<React.SetStateAction<string | null>>;
  scores: Score[];
  setScores: React.Dispatch<React.SetStateAction<Score[]>>;
  holeSelection: HoleSelection;
  setHoleSelection: React.Dispatch<React.SetStateAction<HoleSelection>>;
  activeScoreTab: "front9" | "back9";
  setActiveScoreTab: React.Dispatch<React.SetStateAction<"front9" | "back9">>;
  setCurrentStep: React.Dispatch<React.SetStateAction<'search' | 'scorecard'>>;
  roundDate: Date | undefined;
  saveRound: (data: any) => Promise<void>; 
}

export interface CourseHandlers {
  handleSearch: (query: string) => Promise<void>;
  handleCourseSelect: (course: SimplifiedGolfCourse) => Promise<void>;
  handleOpenManualCourseForm: () => void;
  handleCourseCreated: (courseId: number, courseName: string) => Promise<void>;
  handleSaveRound: () => Promise<boolean>;
}
