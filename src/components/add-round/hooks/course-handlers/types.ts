
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CourseDetail } from "@/services/golfCourseApi";
import { 
  Score, 
  SimplifiedGolfCourse, 
  SimplifiedCourseDetail,
  HoleSelection
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
  lastTeeChangeTimestamp?: number; // Add this property to fix the error
}

export interface CourseHandlers {
  handleSearch: (query: string) => Promise<void>;
  handleCourseSelect: (course: SimplifiedGolfCourse) => Promise<void>;
  handleOpenManualCourseForm: () => void;
  handleCourseCreated: (courseId: number, courseName: string) => Promise<void>;
  handleSaveRound: () => Promise<boolean>;
}
