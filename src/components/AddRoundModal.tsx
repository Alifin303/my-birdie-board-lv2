
import React, { useState, useEffect, useRef } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, CalendarIcon, Edit, PlusCircle, AlertCircle } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { 
  supabase, 
  formatCourseName, 
  parseCourseName, 
  getCourseMetadataFromLocalStorage,
  isUserAddedCourse,
  fetchCourseById
} from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { 
  searchCourses, 
  getCourseDetails, 
  GolfCourse, 
  CourseDetail,
  TeeBox
} from "@/services/golfCourseApi";
import { ManualCourseForm } from "@/components/ManualCourseForm";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AddRoundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SimplifiedGolfCourse {
  id: number;
  name: string;
  clubName: string;
  city?: string;
  state?: string;
  country?: string;
  isUserAdded?: boolean;
  apiCourseId?: string;
}

interface SimplifiedHole {
  number: number;
  par: number;
  yards?: number;
  handicap?: number;
}

interface SimplifiedTee {
  id: string;
  name: string;
  rating: number;
  slope: number;
  par: number;
  gender: 'male' | 'female';
  originalIndex: number;
  yards?: number;
  holes?: SimplifiedHole[];
}

interface SimplifiedCourseDetail {
  id: number;
  name: string;
  clubName: string;
  city?: string;
  state?: string;
  country?: string;
  tees: SimplifiedTee[];
  holes: SimplifiedHole[];
  isUserAdded?: boolean;
  apiCourseId?: string;
}

interface Score {
  hole: number;
  par: number;
  strokes?: number;
  putts?: number;
  yards?: number;
  handicap?: number;
}

type HoleSelection = 'all' | 'front9' | 'back9';

const extractHolesForTee = (courseDetail: CourseDetail, teeId: string): SimplifiedHole[] => {
  console.log("Extracting holes for tee:", teeId, "from course detail:", courseDetail);
  
  if (!courseDetail) {
    console.error("No course detail provided");
    return Array(18).fill(null).map((_, idx) => ({
      number: idx + 1,
      par: 4,
      yards: 400,
      handicap: idx + 1
    }));
  }
  
  const [gender, indexStr] = teeId.split('-');
  const index = parseInt(indexStr);
  
  let teeData: TeeBox | undefined;
  let holesData: Array<{number?: number, par?: number, yardage?: number, handicap?: number}> = [];
  
  if (courseDetail.tees) {
    if (gender === 'm' && courseDetail.tees.male && courseDetail.tees.male.length > index) {
      teeData = courseDetail.tees.male[index];
      if (teeData && teeData.holes && teeData.holes.length > 0) {
        holesData = teeData.holes;
      }
    } else if (gender === 'f' && courseDetail.tees.female && courseDetail.tees.female.length > index) {
      teeData = courseDetail.tees.female[index];
      if (teeData && teeData.holes && teeData.holes.length > 0) {
        holesData = teeData.holes;
      }
    }
  }

  console.log("Extracted holes data for tee:", teeId, holesData);
  
  if (holesData && holesData.length > 0) {
    const mappedHoles = holesData.map((hole, idx) => ({
      number: hole.number || idx + 1,
      par: hole.par || 4,
      yards: hole.yardage,
      handicap: hole.handicap
    }));
    
    console.log("Mapped holes for selected tee:", mappedHoles);
    return mappedHoles;
  }
  
  if (courseDetail.tees) {
    console.log("Looking for hole data in any tee");
    
    const genderTees = gender === 'm' ? courseDetail.tees.male : courseDetail.tees.female;
    if (genderTees) {
      for (const tee of genderTees) {
        if (tee.holes && tee.holes.length > 0) {
          console.log(`Found hole data in ${gender === 'm' ? 'male' : 'female'} tee:`, tee.tee_name);
          const mappedHoles = tee.holes.map((hole, idx) => ({
            number: hole.number || idx + 1,
            par: hole.par || 4,
            yards: hole.yardage,
            handicap: hole.handicap
          }));
          
          console.log(`Mapped holes from alternative ${gender === 'm' ? 'male' : 'female'} tee:`, mappedHoles);
          return mappedHoles;
        }
      }
    }
    
    const otherGenderTees = gender === 'm' ? courseDetail.tees.female : courseDetail.tees.male;
    if (otherGenderTees) {
      for (const tee of otherGenderTees) {
        if (tee.holes && tee.holes.length > 0) {
          console.log(`Found hole data in ${gender === 'm' ? 'female' : 'male'} tee:`, tee.tee_name);
          const mappedHoles = tee.holes.map((hole, idx) => ({
            number: hole.number || idx + 1,
            par: hole.par || 4,
            yards: hole.yardage,
            handicap: hole.handicap
          }));
          
          console.log(`Mapped holes from alternative ${gender === 'm' ? 'female' : 'male'} tee:`, mappedHoles);
          return mappedHoles;
        }
      }
    }
  }
  
  console.log("No hole data found, creating default holes");
  const defaultHoles = Array(18).fill(null).map((_, idx) => ({
    number: idx + 1,
    par: 4,
    yards: 400,
    handicap: idx + 1
  }));
  
  console.log("Created default holes:", defaultHoles);
  return defaultHoles;
};

const convertToSimplifiedCourseDetail = (courseDetail: CourseDetail): SimplifiedCourseDetail => {
  console.log("Converting course detail to simplified format:", courseDetail);
  
  const name = courseDetail.course_name || "Unknown Course";
  const clubName = courseDetail.club_name || "Unknown Club";
  
  console.log("Course name:", name);
  console.log("Club name:", clubName);
  
  const tees = extractTeesFromApiResponse(courseDetail);
  
  const simplifiedTees = tees.map(tee => {
    const teeHoles = extractHolesForTee(courseDetail, tee.id);
    return { ...tee, holes: teeHoles };
  });
  
  let holes: SimplifiedHole[] = [];
  if (simplifiedTees.length > 0) {
    const firstTee = simplifiedTees[0];
    holes = firstTee.holes || [];
    
    if (!holes || holes.length === 0) {
      holes = Array(18).fill(null).map((_, idx) => ({
        number: idx + 1,
        par: 4,
        yards: 400,
        handicap: idx + 1
      }));
    }
  } else {
    console.log("No tees available, creating default holes");
    holes = Array(18).fill(null).map((_, idx) => ({
      number: idx + 1,
      par: 4,
      yards: 400,
      handicap: idx + 1
    }));
  }
  
  // Fix: Ensure id is always a number
  const courseId = typeof courseDetail.id === 'string' ? parseInt(courseDetail.id, 10) : 
                   typeof courseDetail.id === 'number' ? courseDetail.id : 0;

  const simplified: SimplifiedCourseDetail = {
    id: courseId,
    name,
    clubName,
    city: courseDetail.location?.city || '',
    state: courseDetail.location?.state || '',
    country: courseDetail.location?.country || 'United States',
    tees: simplifiedTees,
    holes,
    apiCourseId: courseDetail.id ? courseDetail.id.toString() : ''
  };
  
  console.log("Simplified course detail:", simplified);
  return simplified;
};

const extractTeesFromApiResponse = (courseDetail: CourseDetail): SimplifiedTee[] => {
  const tees: SimplifiedTee[] = [];
  
  if (courseDetail.tees) {
    if (courseDetail.tees.male && courseDetail.tees.male.length > 0) {
      courseDetail.tees.male.forEach((tee, index) => {
        tees.push({
          id: `m-${index}`,
          name: tee.tee_name || 'Unknown Tee',
          // Fix: Using proper TeeBox properties
          rating: tee.course_rating ?? 72,
          slope: tee.slope_rating ?? 113,
          par: tee.par_total ?? 72,
          gender: 'male',
          originalIndex: index,
          yards: tee.total_yards
        });
      });
    }
    
    if (courseDetail.tees.female && courseDetail.tees.female.length > 0) {
      courseDetail.tees.female.forEach((tee, index) => {
        tees.push({
          id: `f-${index}`,
          name: tee.tee_name || 'Unknown Tee',
          // Fix: Using proper TeeBox properties
          rating: tee.course_rating ?? 72,
          slope: tee.slope_rating ?? 113,
          par: tee.par_total ?? 72,
          gender: 'female',
          originalIndex: index,
          yards: tee.total_yards
        });
      });
    }
  }
  
  return tees;
};

const calculateScoreSummary = (scores: Score[]) => {
  const totalStrokes = scores.reduce((sum, score) => sum + (score.strokes || 0), 0);
  const totalPar = scores.reduce((sum, score) => sum + score.par, 0);
  const totalPutts = scores.reduce((sum, score) => sum + (score.putts || 0), 0);
  const toPar = totalStrokes - totalPar;
  const puttsRecorded = scores.some(score => score.putts !== undefined);
  
  // Add front 9 and back 9 calculations
  const front9Scores = scores.filter(score => score.hole <= 9);
  const back9Scores = scores.filter(score => score.hole > 9);
  
  const front9Strokes = front9Scores.reduce((sum, score) => sum + (score.strokes || 0), 0);
  const front9Par = front9Scores.reduce((sum, score) => sum + score.par, 0);
  const front9ToPar = front9Strokes - front9Par;
  
  const back9Strokes = back9Scores.reduce((sum, score) => sum + (score.strokes || 0), 0);
  const back9Par = back9Scores.reduce((sum, score) => sum + score.par, 0);
  const back9ToPar = back9Strokes - back9Par;
  
  return {
    totalStrokes,
    totalPar,
    totalPutts,
    toPar,
    puttsRecorded,
    front9Strokes,
    front9Par,
    front9ToPar,
    back9Strokes,
    back9Par,
    back9ToPar
  };
};

const loadUserAddedCourseDetails = (courseId: number): SimplifiedCourseDetail | null => {
  try {
    const storedDetails = localStorage.getItem(`course_details_${courseId}`);
    if (!storedDetails) {
      console.log("No course details found in localStorage for course ID:", courseId);
      return null;
    }
    
    const parsedDetails = JSON.parse(storedDetails);
    console.log("Parsed course details from localStorage:", parsedDetails);
    return parsedDetails as SimplifiedCourseDetail;
  } catch (error) {
    console.error("Error loading course details from localStorage:", error);
    return null;
  }
};

export function AddRoundModal({ open, onOpenChange }: AddRoundModalProps) {
  const [currentStep, setCurrentStep] = useState<'search' | 'scorecard'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SimplifiedGolfCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<SimplifiedCourseDetail | null>(null);
  const [selectedTeeId, setSelectedTeeId] = useState<string | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [dataLoadingError, setDataLoadingError] = useState<string | null>(null);
  const [roundDate, setRoundDate] = useState<Date | undefined>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [holeSelection, setHoleSelection] = useState<HoleSelection>('all');
  const [activeScoreTab, setActiveScoreTab] = useState<"front9" | "back9">("front9");
  const [originalCourseDetail, setOriginalCourseDetail] = useState<CourseDetail | null>(null);
  const [noResults, setNoResults] = useState(false);
  const [manualCourseOpen, setManualCourseOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const debouncedSearchTerm = useDebounce(searchQuery, 500);
  const today = new Date();
  
  const manualCourseFormRef = useRef<any>(null);

  useEffect(() => {
    if (debouncedSearchTerm) {
      handleSearch(debouncedSearchTerm);
    } else {
      setSearchResults([]);
      setSearchError(null);
      setNoResults(false);
    }
  }, [debouncedSearchTerm]);

  // Fetch user-added courses from the database
  const fetchUserAddedCourses = async (query: string): Promise<SimplifiedGolfCourse[]> => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .ilike('name', `%${query}%`);
        
      if (error) {
        console.error("Error fetching user-added courses:", error);
        return [];
      }
      
      if (!data || data.length === 0) {
        return [];
      }
      
      return data.map(course => {
        const { clubName, courseName } = parseCourseName(course.name);
        return {
          id: course.id,
          name: courseName,
          clubName: clubName,
          city: course.city || '',
          state: course.state || '',
          country: 'United States',
          isUserAdded: isUserAddedCourse(course.name),
          apiCourseId: course.api_course_id
        };
      });
    } catch (error) {
      console.error("Error fetching user-added courses:", error);
      return [];
    }
  };

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setSearchError(null);
    setNoResults(false);
    
    try {
      // Fetch API courses
      const apiResponse = await searchCourses(query);
      const apiResults = Array.isArray(apiResponse.results) ? apiResponse.results : [];
      
      // Fetch user-added courses
      const userAddedCourses = await fetchUserAddedCourses(query);
      
      // Combine results
      const combinedResults = [
        ...userAddedCourses, 
        ...apiResults.map(course => ({
          id: typeof course.id === 'string' ? parseInt(course.id) : course.id,
          name: course.course_name || (course as any).name || '',
          clubName: course.club_name || (course as any).name || '',
          city: course.location?.city || '',
          state: course.location?.state || '',
          country: course.location?.country || 'United States',
          isUserAdded: false,
          apiCourseId: course.id?.toString()
        }))
      ];
      
      const enhancedResults = combinedResults.map(course => {
        const metadata = getCourseMetadataFromLocalStorage(course.id);
        return {
          ...course,
          city: course.city || metadata?.city || '',
          state: course.state || metadata?.state || '',
          isUserAdded: course.isUserAdded || isUserAddedCourse(course.name)
        };
      });
      
      setSearchResults(enhancedResults);
      setNoResults(enhancedResults.length === 0);
    } catch (error: any) {
      console.error("Search error:", error);
      setSearchError(error.message || "Failed to fetch courses. Please try again.");
      
      // Try to at least get user-added courses if the API fails
      try {
        const userAddedCourses = await fetchUserAddedCourses(query);
        if (userAddedCourses.length > 0) {
          setSearchResults(userAddedCourses);
          setNoResults(false);
        } else {
          setNoResults(true);
        }
      } catch (err) {
        console.error("Failed to get user-added courses as fallback:", err);
        setNoResults(true);
      }
      
      toast({
        title: "API Error",
        description: error.message || "Failed to fetch courses from API. Showing local courses only.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseSelect = async (course: SimplifiedGolfCourse) => {
    setIsLoading(true);
    setSearchError(null);
    setDataLoadingError(null);
    
    try {
      console.log("Selected course:", course);
      
      let simplifiedCourseDetail: SimplifiedCourseDetail;
      
      if (course.isUserAdded) {
        console.log("Loading user-added course from database:", course);
        
        const cachedCourseDetail = loadUserAddedCourseDetails(course.id);
        
        if (cachedCourseDetail) {
          console.log("User-added course details loaded from cache:", cachedCourseDetail);
          
          cachedCourseDetail.id = course.id;
          cachedCourseDetail.name = course.name;
          cachedCourseDetail.clubName = course.clubName;
          cachedCourseDetail.city = course.city;
          cachedCourseDetail.state = course.state;
          cachedCourseDetail.isUserAdded = true;
          
          simplifiedCourseDetail = cachedCourseDetail;
        } else {
          console.log("No cached details found for user-added course, creating defaults");
          
          const defaultHoles = Array(18).fill(null).map((_, idx) => ({
            number: idx + 1,
            par: 4,
            yards: 400,
            handicap: idx + 1
          }));
          
          const defaultTee: SimplifiedTee = {
            id: `tee-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: 'White',
            rating: 72,
            slope: 113,
            par: 72,
            gender: 'male',
            originalIndex: 0,
            holes: defaultHoles
          };
          
          simplifiedCourseDetail = {
            id: course.id,
            name: course.name,
            clubName: course.clubName,
            city: course.city,
            state: course.state,
            tees: [defaultTee],
            holes: defaultHoles,
            isUserAdded: true
          };
          
          try {
            localStorage.setItem(
              `course_details_${course.id}`, 
              JSON.stringify(simplifiedCourseDetail)
            );
            console.log("Saved default course details to localStorage");
          } catch (e) {
            console.error("Error saving to localStorage:", e);
          }
        }
      } 
      else {
        console.log("Loading course from API:", course);
        
        try {
          // Convert courseId to a proper format
          const courseIdRaw = course.apiCourseId || course.id;
          const courseId = typeof courseIdRaw === 'string' ? courseIdRaw : courseIdRaw.toString();
          
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
          
          simplifiedCourseDetail.apiCourseId = courseId.toString();
          
          console.log("Final course detail after processing:", simplifiedCourseDetail);
        } catch (error) {
          console.error("Error fetching course details from API:", error);
          setDataLoadingError(`Failed to load course details. The API may be unavailable.
Try selecting a different course or adding this course manually.`);
          
          const defaultHoles = Array(18).fill(null).map((_, idx) => ({
            number: idx + 1,
            par: 4,
            yards: 400,
            handicap: idx + 1
          }));
          
          const defaultTee: SimplifiedTee = {
            id: `tee-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: 'White',
            rating: 72,
            slope: 113,
            par: 72,
            gender: 'male',
            originalIndex: 0,
            holes: defaultHoles
          };
          
          // Ensure course.id is a number
          const courseId = typeof course.id === 'string' ? parseInt(course.id, 10) : course.id;
          
          simplifiedCourseDetail = {
            id: courseId,
            name: course.name,
            clubName: course.clubName,
            city: course.city,
            state: course.state,
            tees: [defaultTee],
            holes: defaultHoles,
            apiCourseId: course.apiCourseId || course.id.toString()
          };
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
        console.log("Setting default tee ID:", defaultTeeId);
        setSelectedTeeId(defaultTeeId);
        
        setTimeout(() => {
          console.log("Updating scorecard with tee ID:", defaultTeeId);
          updateScorecardForTee(defaultTeeId, 'all');
          setHoleSelection('all');
        }, 0);
      }
      
      setCurrentStep('scorecard');
    } catch (error: any) {
      console.error("Course detail error:", error);
      setSearchError(error.message || "Failed to load course details. Please try again.");
      toast({
        title: "Error",
        description: error.message || "Failed to load course details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenManualCourseForm = () => {
    setManualCourseOpen(true);
  };

  const handleCourseCreated = async (courseId: number, courseName: string) => {
    setManualCourseOpen(false);
    
    try {
      // Fetch the newly created course
      const courseData = await fetchCourseById(courseId);
      
      if (courseData) {
        const { clubName, courseName: name } = parseCourseName(courseData.name);
        
        const newCourse: SimplifiedGolfCourse = {
          id: courseData.id,
          name,
          clubName,
          city: courseData.city || '',
          state: courseData.state || '',
          country: 'United States',
          isUserAdded: isUserAddedCourse(courseData.name)
        };
        
        // Immediately select the new course
        await handleCourseSelect(newCourse);
      }
    } catch (error) {
      console.error("Error fetching newly created course:", error);
      toast({
        title: "Error",
        description: "Course was created but could not be loaded automatically. Please search for it.",
        variant: "destructive",
      });
    }
  };

  const handleBackToSearch = () => {
    setCurrentStep('search');
    setSelectedCourse(null);
    setSelectedTeeId(null);
    setScores([]);
    setSearchQuery('');
    setHoleSelection('all');
    setActiveScoreTab("front9");
  };

  const handleManualCourseSubmit = async (courseData: Omit<SimplifiedGolfCourse, 'id'>) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([
          {
            name: formatCourseName(courseData.clubName, courseData.name),
            city: courseData.city,
            state: courseData.state,
            country: courseData.country
          }
        ])
        .select()
        .single();
        
      if (error) {
        console.error("Error adding manual course:", error);
        throw new Error(error.message);
      }
      
      if (data) {
        const newCourse: SimplifiedGolfCourse = {
          id: data.id,
          name: data.name,
          clubName: parseCourseName(data.name).clubName,
          city: data.city,
          state: data.state,
          country: data.country,
          isUserAdded: true
        };
        
        try {
          localStorage.setItem(
            `course_details_${data.id}`, 
            JSON.stringify({
              id: data.id,
              name: data.name,
              clubName: parseCourseName(data.name).clubName,
              city: data.city,
              state: data.state,
              country: data.country,
              tees: [],
              holes: []
            })
          );
        } catch (e) {
          console.error("Error saving to localStorage:", e);
        }
        
        await handleCourseSelect(newCourse);
        
        toast({
          title: "Success",
          description: "Course added successfully!",
        });
      }
    } catch (error: any) {
      console.error("Error adding manual course:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setRoundDate(date);
    setCalendarOpen(false);
  };

  const handleTeeChange = (teeId: string) => {
    console.log("Selected tee ID:", teeId);
    setSelectedTeeId(teeId);
    
    if (selectedCourse) {
      const selectedTee = selectedCourse.tees.find(t => t.id === teeId);
      if (selectedTee && selectedTee.holes) {
        console.log("Using specific hole data from selected tee:", selectedTee.name);
        updateScorecardForTee(teeId, holeSelection);
      } else {
        console.log("No specific hole data found for selected tee, using course defaults");
        updateScorecardForTee(teeId, holeSelection);
      }
    }
  };

  const getHolesForTee = (teeId: string): SimplifiedHole[] => {
    console.log("Getting holes for tee:", teeId);
    
    if (!selectedCourse) {
      console.error("No course selected");
      return [];
    }
    
    const selectedTee = selectedCourse.tees.find(t => t.id === teeId);
    if (!selectedTee) {
      console.error(`Tee with ID ${teeId} not found`);
      return selectedCourse.holes;
    }
    
    if (selectedTee.holes && selectedTee.holes.length > 0) {
      console.log("Using hole data specific to the selected tee:", selectedTee.holes);
      return selectedTee.holes;
    }
    
    console.log("Tee doesn't have specific hole data, using course's default holes");
    return selectedCourse.holes;
  };

  const updateScorecardForTee = (teeId: string, selection: HoleSelection = 'all') => {
    console.log("Updating scorecard for tee", teeId, "with selection", selection);
    
    if (!selectedCourse) {
      console.error("Cannot update scorecard: No course selected");
      return;
    }
    
    const allHolesData = getHolesForTee(teeId);
    
    console.log("All holes data for selected tee:", allHolesData);
    
    let filteredHoles: SimplifiedHole[] = [];
    
    if (selection === 'front9') {
      filteredHoles = allHolesData.filter(hole => hole.number <= 9);
      console.log("Filtered for front 9:", filteredHoles);
    } else if (selection === 'back9') {
      filteredHoles = allHolesData.filter(hole => hole.number > 9);
      console.log("Filtered for back 9:", filteredHoles);
    } else {
      filteredHoles = allHolesData;
      console.log("Using all 18 holes");
    }
    
    if (!filteredHoles.length) {
      console.log("No filtered holes, creating defaults");
      if (selection === 'front9') {
        filteredHoles = Array(9).fill(null).map((_, idx) => ({
          number: idx + 1,
          par: 4,
          yards: 400,
          handicap: idx + 1
        }));
      } else if (selection === 'back9') {
        filteredHoles = Array(9).fill(null).map((_, idx) => ({
          number: idx + 10,
          par: 4,
          yards: 400,
          handicap: idx + 10
        }));
      } else {
        filteredHoles = Array(18).fill(null).map((_, idx) => ({
          number: idx + 1,
          par: 4,
          yards: 400,
          handicap: idx + 1
        }));
      }
    }
    
    const newScores = filteredHoles.map(hole => ({
      hole: hole.number,
      par: hole.par,
      strokes: 0,
      putts: undefined,
      yards: hole.yards,
      handicap: hole.handicap
    }));
    
    console.log("New scores array with proper par data:", newScores);
    setScores(newScores);
    
    if (selection !== 'all') {
      setActiveScoreTab(selection === 'front9' ? "front9" : "back9");
    }
  };

  const handleScoreChange = (index: number, field: 'strokes' | 'putts', value: string) => {
    const newScores = [...scores];
    const parsedValue = value === '' ? undefined : parseInt(value, 10);
    
    if (!isNaN(parsedValue as number) || value === '') {
      newScores[index] = {
        ...newScores[index],
        [field]: parsedValue,
      };
      setScores(newScores);
    }
  };

  const handleHoleSelectionChange = (selection: HoleSelection) => {
    setHoleSelection(selection);
    updateScorecardForTee(selectedTeeId || selectedCourse?.tees[0].id || 'default-tee', selection);
  };

  const handleCloseModal = () => {
    onOpenChange(false);
    setCurrentStep('search');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedCourse(null);
    setSelectedTeeId(null);
    setScores([]);
    setSearchError(null);
    setDataLoadingError(null);
    setRoundDate(new Date());
    setHoleSelection('all');
    setActiveScoreTab("front9");
    setManualCourseOpen(false);
  };

  const handleSaveRound = async () => {
    if (!selectedCourse) {
      toast({
        title: "Error",
        description: "No course selected.",
        variant: "destructive",
      });
      return;
    }
    
    if (!roundDate) {
      toast({
        title: "Error",
        description: "Please select a date.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedTeeId) {
      toast({
        title: "Error",
        description: "No tee selected.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');
      
      const selectedTee = selectedCourse.tees.find(tee => tee.id === selectedTeeId);
      if (!selectedTee) throw new Error('Selected tee not found');
      
      const totalStrokes = scores.reduce((sum, score) => sum + (score.strokes || 0), 0);
      const totalPar = scores.reduce((sum, score) => sum + score.par, 0);
      const toParGross = totalStrokes - totalPar;
      
      const { data, error } = await supabase
        .from('rounds')
        .insert([
          {
            user_id: session.user.id,
            course_id: selectedCourse.id,
            date: roundDate.toISOString(),
            tee_name: selectedTee.name,
            tee_id: selectedTeeId,
            gross_score: totalStrokes,
            to_par_gross: toParGross,
            net_score: null,
            to_par_net: null,
            hole_scores: JSON.stringify(scores)
          }
        ]);
        
      if (error) {
        console.error("Error saving round:", error);
        throw error;
      }
      
      console.log("Round saved successfully:", data);
      
      toast({
        title: "Success",
        description: "Round saved successfully!",
      });
      
      // Fix: Using correct format for invalidateQueries
      queryClient.invalidateQueries({ queryKey: ['userRounds'] });
      handleCloseModal();
    } catch (error: any) {
      console.error("Error saving round:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save round. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate summary stats for front/back 9 and total
  const scoreSummary = calculateScoreSummary(scores);

  // Render the search step
  const renderSearchStep = () => (
    <>
      <DialogHeader>
        <DialogTitle>Add a New Round</DialogTitle>
        <DialogDescription>
          Search for a golf course or add a new one
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <div className="relative rounded-md bg-background shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Search for a course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Enter a course name or location and press Enter to search
          </p>
        </div>
        
        <div className="flex justify-center">
          <Button
            onClick={() => handleSearch(searchQuery)}
            disabled={isLoading || searchQuery.length < 3}
            className="w-full md:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </Button>
        </div>
        
        <div className="mt-2 mb-4 text-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleOpenManualCourseForm}
            className="w-full"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Can&apos;t find your course? Add it now
          </Button>
        </div>
        
        {searchError && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 text-center">
            <p className="text-sm text-destructive">{searchError}</p>
          </div>
        )}
        
        {noResults && (
          <div className="bg-muted/50 rounded-md p-4 text-center">
            <p className="text-sm text-muted-foreground">No courses found matching your search.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenManualCourseForm}
              className="mt-2"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Your Course
            </Button>
          </div>
        )}
        
        {searchResults.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-2">Search Results</h3>
            <div className="border rounded-md divide-y">
              {searchResults.map((course) => (
                <div 
                  key={course.id.toString()}
                  className="flex justify-between items-center px-4 py-3 hover:bg-muted cursor-pointer"
                  onClick={() => handleCourseSelect(course)}
                >
                  <div>
                    <p className="font-medium">
                      {course.clubName !== course.name 
                        ? `${course.clubName} - ${course.name}`
                        : course.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {course.city}{course.state ? `, ${course.state}` : ''}
                      {course.isUserAdded && <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">User Added</span>}
                    </p>
                  </div>
                  
                  {course.isUserAdded && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement edit functionality
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );

  // Render the scorecard step with landscape layout
  const renderScorecardStep = () => (
    <>
      {selectedCourse && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">{selectedCourse.clubName !== selectedCourse.name ? 
                `${selectedCourse.clubName} - ${selectedCourse.name}` : 
                selectedCourse.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {selectedCourse.city}{selectedCourse.state ? `, ${selectedCourse.state}` : ''}
                {selectedCourse.isUserAdded && <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">User Added</span>}
              </p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleBackToSearch}
            >
              Change Course
            </Button>
          </div>
          
          {dataLoadingError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                {dataLoadingError}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Top row: Controls in a horizontal layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Date Played</label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {roundDate ? format(roundDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={roundDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => date > today}
                    initialFocus
                    className="z-50"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium">Tee Played</label>
              <Select value={selectedTeeId || undefined} onValueChange={handleTeeChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select a tee box" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCourse.tees.map((tee) => (
                    <SelectItem key={tee.id} value={tee.id}>
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor: tee.gender === 'male' ? 
                              (tee.name.toLowerCase().includes('black') ? '#000' : 
                              tee.name.toLowerCase().includes('blue') ? '#005' : 
                              tee.name.toLowerCase().includes('white') ? '#fff' : 
                              tee.name.toLowerCase().includes('gold') ? '#FB0' : 
                              tee.name.toLowerCase().includes('green') ? '#060' : 
                              tee.name.toLowerCase().includes('yellow') ? '#FF0' : '#777') :
                              (tee.name.toLowerCase().includes('red') ? '#C00' : 
                              tee.name.toLowerCase().includes('gold') ? '#FB0' : '#FAA'),
                            border: tee.name.toLowerCase().includes('white') ? '1px solid #ccc' : 'none'
                          }}
                        ></div>
                        {tee.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium">Holes Played</label>
              <div className="flex space-x-1">
                <Button 
                  variant={holeSelection === 'all' ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleHoleSelectionChange('all')}
                  className="flex-1 h-9 px-2"
                >
                  All 18
                </Button>
                <Button 
                  variant={holeSelection === 'front9' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleHoleSelectionChange('front9')}
                  className="flex-1 h-9 px-2"
                >
                  Front 9
                </Button>
                <Button 
                  variant={holeSelection === 'back9' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleHoleSelectionChange('back9')}
                  className="flex-1 h-9 px-2"
                >
                  Back 9
                </Button>
              </div>
            </div>
          </div>
          
          {/* Middle section: Front 9 holes */}
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Front Nine</h3>
            <div className="border rounded-md">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-2 py-2 text-left text-sm font-medium whitespace-nowrap">Hole</th>
                      {scores.filter(score => score.hole <= 9).map(score => (
                        <th key={`hole-${score.hole}`} className="px-2 py-2 text-center text-sm font-medium">{score.hole}</th>
                      ))}
                      <th className="px-2 py-2 text-center text-sm font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-2 py-2 text-sm font-medium">Par</td>
                      {scores.filter(score => score.hole <= 9).map(score => (
                        <td key={`par-${score.hole}`} className="px-1 py-2 text-center">
                          <div className="bg-muted/40 border border-muted rounded-md w-7 h-7 flex items-center justify-center font-medium mx-auto">
                            {score.par}
                          </div>
                        </td>
                      ))}
                      <td className="px-2 py-2 text-center font-medium">{scoreSummary.front9Par}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-2 py-2 text-sm font-medium">Strokes</td>
                      {scores.filter(score => score.hole <= 9).map((score, index) => (
                        <td key={`strokes-${score.hole}`} className="px-1 py-2 text-center">
                          <Input
                            type="number"
                            min="1"
                            max="20"
                            value={score.strokes || ''}
                            onChange={(e) => handleScoreChange(index, 'strokes', e.target.value)}
                            className="w-9 h-7 text-center mx-auto px-1"
                            inputMode="numeric"
                          />
                        </td>
                      ))}
                      <td className="px-2 py-2 text-center font-medium">
                        {scoreSummary.front9Strokes || '-'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Below Middle: Back 9 holes */}
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Back Nine</h3>
            <div className="border rounded-md">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-2 py-2 text-left text-sm font-medium whitespace-nowrap">Hole</th>
                      {scores.filter(score => score.hole > 9).map(score => (
                        <th key={`hole-${score.hole}`} className="px-2 py-2 text-center text-sm font-medium">{score.hole}</th>
                      ))}
                      <th className="px-2 py-2 text-center text-sm font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-2 py-2 text-sm font-medium">Par</td>
                      {scores.filter(score => score.hole > 9).map(score => (
                        <td key={`par-${score.hole}`} className="px-1 py-2 text-center">
                          <div className="bg-muted/40 border border-muted rounded-md w-7 h-7 flex items-center justify-center font-medium mx-auto">
                            {score.par}
                          </div>
                        </td>
                      ))}
                      <td className="px-2 py-2 text-center font-medium">{scoreSummary.back9Par}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-2 py-2 text-sm font-medium">Strokes</td>
                      {scores.filter(score => score.hole > 9).map((score, index) => {
                        const adjustedIndex = index + scores.filter(s => s.hole <= 9).length;
                        return (
                          <td key={`strokes-${score.hole}`} className="px-1 py-2 text-center">
                            <Input
                              type="number"
                              min="1"
                              max="20"
                              value={score.strokes || ''}
                              onChange={(e) => handleScoreChange(adjustedIndex, 'strokes', e.target.value)}
                              className="w-9 h-7 text-center mx-auto px-1"
                              inputMode="numeric"
                            />
                          </td>
                        );
                      })}
                      <td className="px-2 py-2 text-center font-medium">
                        {scoreSummary.back9Strokes || '-'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Bottom section: Round stats and summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 items-start">
            <Card className="p-3">
              <h3 className="text-sm font-medium mb-2">Round Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Par:</span>
                  <span className="font-medium">{scoreSummary.totalPar}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gross Score:</span>
                  <span className="font-medium">
                    {scoreSummary.totalStrokes || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To Par:</span>
                  <span className="font-medium">
                    {scoreSummary.totalStrokes ? 
                      (scoreSummary.toPar > 0 ? 
                        `+${scoreSummary.toPar}` : 
                        scoreSummary.toPar) : 
                      '-'}
                  </span>
                </div>
              </div>
            </Card>
            
            <Card className="p-3">
              <h3 className="text-sm font-medium mb-2">Front Nine Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Par:</span>
                  <span className="font-medium">{scoreSummary.front9Par}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Score:</span>
                  <span className="font-medium">{scoreSummary.front9Strokes || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To Par:</span>
                  <span className="font-medium">
                    {scoreSummary.front9Strokes ? 
                      (scoreSummary.front9ToPar > 0 ? 
                        `+${scoreSummary.front9ToPar}` : 
                        scoreSummary.front9ToPar) : 
                      '-'}
                  </span>
                </div>
              </div>
            </Card>
            
            <Card className="p-3">
              <h3 className="text-sm font-medium mb-2">Back Nine Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Par:</span>
                  <span className="font-medium">{scoreSummary.back9Par}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Score:</span>
                  <span className="font-medium">{scoreSummary.back9Strokes || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To Par:</span>
                  <span className="font-medium">
                    {scoreSummary.back9Strokes ? 
                      (scoreSummary.back9ToPar > 0 ? 
                        `+${scoreSummary.back9ToPar}` : 
                        scoreSummary.back9ToPar) : 
                      '-'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Button row */}
          <div className="flex justify-between space-x-4 mt-6">
            <Button variant="outline" onClick={handleCloseModal} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveRound} disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Round"
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[1000px] p-6 max-h-[90vh] overflow-y-auto">
          {currentStep === 'search' ? renderSearchStep() : renderScorecardStep()}
        </DialogContent>
      </Dialog>
      
      {/* Manual Course Form */}
      <ManualCourseForm
        open={manualCourseOpen}
        onOpenChange={setManualCourseOpen}
        onCourseCreated={handleCourseCreated}
      />
    </>
  );
}

