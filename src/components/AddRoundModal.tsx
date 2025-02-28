<lov-code>
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
  isUserAddedCourse
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

// Fixed function to properly extract hole data for a specific tee
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
  
  // Parse the tee ID to get gender and index
  const [gender, indexStr] = teeId.split('-');
  const index = parseInt(indexStr);
  
  // Get the correct tee data
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
  
  // If we found hole data for the specific tee, use it
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
  
  // Fallback: try to find any hole data in any tee
  if (courseDetail.tees) {
    console.log("Looking for hole data in any tee");
    
    // Try the specific gender tees first based on teeId
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
    
    // If no holes found in the gender-specific tees, try the other gender
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
  // Last resort: create default holes
  const defaultHoles = Array(18).fill(null).map((_, idx) => ({
    number: idx + 1,
    par: 4,
    yards: 400,
    handicap: idx + 1
  }));
  
  console.log("Created default holes:", defaultHoles);
  return defaultHoles;
};

// Fixed function to properly associate holes with each tee
const convertToSimplifiedCourseDetail = (courseDetail: CourseDetail): SimplifiedCourseDetail => {
  console.log("Converting course detail to simplified format:", courseDetail);
  
  // Get course name and club name from the API response
  const name = courseDetail.course_name || "Unknown Course";
  const clubName = courseDetail.club_name || "Unknown Club";
  
  console.log("Course name:", name);
  console.log("Club name:", clubName);
  
  // Extract tee boxes
  const tees = extractTeesFromApiResponse(courseDetail);
  
  // For each tee, extract the holes data and store it with the tee
  const simplifiedTees = tees.map(tee => {
    // Extract specific holes data for this tee
    const teeHoles = extractHolesForTee(courseDetail, tee.id);
    
    // Return the tee with its holes data
    return { ...tee, holes: teeHoles };
  });
  
  // Use the first tee's holes as default for the course
  let holes: SimplifiedHole[] = [];
  if (simplifiedTees.length > 0) {
    const firstTee = simplifiedTees[0];
    // Use the holes we already extracted for this tee
    holes = firstTee.holes || [];
    
    if (!holes || holes.length === 0) {
      // If we somehow don't have holes data, generate defaults
      holes = Array(18).fill(null).map((_, idx) => ({
        number: idx + 1,
        par: 4,
        yards: 400,
        handicap: idx + 1
      }));
    }
  } else {
    // Default holes if no tees available
    console.log("No tees available, creating default holes");
    holes = Array(18).fill(null).map((_, idx) => ({
      number: idx + 1,
      par: 4,
      yards: 400,
      handicap: idx + 1
    }));
  }
  
  const simplified = {
    id: courseDetail.id || 0,
    name,
    clubName,
    city: courseDetail.location?.city || '',
    state: courseDetail.location?.state || '',
    country: courseDetail.location?.country || 'United States',
    tees: simplifiedTees,
    holes,
    apiCourseId: courseDetail.id.toString()
  };
  
  console.log("Simplified course detail:", simplified);
  return simplified;
};

const extractTeesFromApiResponse = (courseDetail: CourseDetail): SimplifiedTee[] => {
  const tees: SimplifiedTee[] = [];
  
  if (courseDetail.tees) {
    // Process male tees
    if (courseDetail.tees.male && courseDetail.tees.male.length > 0) {
      courseDetail.tees.male.forEach((tee, index) => {
        tees.push({
          id: `m-${index}`,
          name: tee.tee_name || 'Unknown Tee',
          rating: tee.rating || 72,
          slope: tee.slope || 113,
          par: tee.par || 72,
          gender: 'male',
          originalIndex: index,
          yards: tee.total_yardage
        });
      });
    }
    
    // Process female tees
    if (courseDetail.tees.female && courseDetail.tees.female.length > 0) {
      courseDetail.tees.female.forEach((tee, index) => {
        tees.push({
          id: `f-${index}`,
          name: tee.tee_name || 'Unknown Tee',
          rating: tee.rating || 72,
          slope: tee.slope || 113,
          par: tee.par || 72,
          gender: 'female',
          originalIndex: index,
          yards: tee.total_yardage
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
  
  return {
    totalStrokes,
    totalPar,
    totalPutts,
    toPar,
    puttsRecorded
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
  const [roundDate, setRoundDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [holeSelection, setHoleSelection] = useState<HoleSelection>('all');
  const [activeScoreTab, setActiveScoreTab] = useState<"front9" | "back9">("front9");
  const [originalCourseDetail, setOriginalCourseDetail] = useState<CourseDetail | null>(null);
  
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
    }
  }, [debouncedSearchTerm]);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setSearchError(null);
    
    try {
      const results = await searchCourses(query);
      
      // Enhance results with localStorage data
      const enhancedResults = results.map(course => {
        const metadata = getCourseMetadataFromLocalStorage(course.id);
        return {
          ...course,
          city: course.city || metadata?.city,
          state: course.state || metadata?.state,
          isUserAdded: isUserAddedCourse(course.name)
        };
      });
      
      setSearchResults(enhancedResults);
    } catch (error: any) {
      console.error("Search error:", error);
      setSearchError(error.message || "Failed to fetch courses. Please try again.");
      toast({
        title: "Error",
        description: error.message || "Failed to fetch courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fixed function to handle course selection with proper par data initialization
  const handleCourseSelect = async (course: SimplifiedGolfCourse) => {
    setIsLoading(true);
    setSearchError(null);
    setDataLoadingError(null);
    
    try {
      console.log("Selected course:", course);
      
      let simplifiedCourseDetail: SimplifiedCourseDetail;
      
      // If it's a user-added course from our database
      if (course.isUserAdded) {
        // Your existing user course handling code is fine
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
      // If it's a course from the API that's not yet in our database
      else {
        console.log("Loading course from API:", course);
        
        try {
          // If the course has an API ID, fetch details from the API
          const courseId = course.apiCourseId || course.id;
          console.log("Fetching API course details for ID:", courseId);
          
          const apiCourseDetail = await getCourseDetails(courseId);
          console.log("API course details (raw):", apiCourseDetail);
          
          // Save the original API course detail for reference
          setOriginalCourseDetail(apiCourseDetail);
          
          // Convert API response to simplified format with hole data for each tee
          simplifiedCourseDetail = convertToSimplifiedCourseDetail(apiCourseDetail);
          
          // Make sure course and club names are set properly
          if (!simplifiedCourseDetail.name && course.name) {
            console.log("Setting missing course name from search result:", course.name);
            simplifiedCourseDetail.name = course.name;
          }
          if (!simplifiedCourseDetail.clubName && course.clubName) {
            console.log("Setting missing club name from search result:", course.clubName);
            simplifiedCourseDetail.clubName = course.clubName;
          }
          
          // Set apiCourseId to ensure we can reference this later
          simplifiedCourseDetail.apiCourseId = courseId.toString();
          
          console.log("Final course detail after processing:", simplifiedCourseDetail);
        } catch (error) {
          console.error("Error fetching course details from API:", error);
          setDataLoadingError(`Failed to load course details. The API may be unavailable.
Try selecting a different course or adding this course manually.`);
          
          // Create a minimal course detail with defaults since the API failed
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
            apiCourseId: course.apiCourseId || course.id.toString()
          };
        }
      }
      
      console.log("Setting selected course:", simplifiedCourseDetail);
      setSelectedCourse(simplifiedCourseDetail);
      
      // Clear search results and update search query
      setSearchResults([]);
      const displayName = course.clubName !== course.name 
        ? `${course.clubName} - ${course.name}`
        : course.name;
      console.log("Setting search query to:", displayName);
      setSearchQuery(displayName);
      
      // Set default tee if available
      if (simplifiedCourseDetail.tees && simplifiedCourseDetail.tees.length > 0) {
        const defaultTeeId = simplifiedCourseDetail.tees[0].id;
        console.log("Setting default tee ID:", defaultTeeId);
        setSelectedTeeId(defaultTeeId);
        
        // Wait for state to be updated
        setTimeout(() => {
          console.log("Updating scorecard with tee ID:", defaultTeeId);
          updateScorecardForTee(defaultTeeId, 'all');
          setHoleSelection('all');
        }, 0);
      }
      
      // Move to scorecard step
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
        
        // Store course details in localStorage
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
        
        // Select the new course
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

  // Fixed function to properly handle tee selection and update par data
  const handleTeeChange = (teeId: string) => {
    console.log("Selected tee ID:", teeId);
    setSelectedTeeId(teeId);
    
    // Ensure we use the specific tee's hole data for updating the scorecard
    if (selectedCourse) {
      const selectedTee = selectedCourse.tees.find(t => t.id === teeId);
      if (selectedTee && selectedTee.holes) {
        console.log("Using specific hole data from selected tee:", selectedTee.name);
        
        // Immediately update the scorecard with the selected tee's hole data
        updateScorecardForTee(teeId, holeSelection);
      } else {
        console.log("No specific hole data found for selected tee, using course defaults");
        updateScorecardForTee(teeId, holeSelection);
      }
    }
  };

  // Fixed function to get hole data specific to the selected tee
  const getHolesForTee = (teeId: string): SimplifiedHole[] => {
    console.log("Getting holes for tee:", teeId);
    
    if (!selectedCourse) {
      console.error("No course selected");
      return [];
    }
    
    // Find the selected tee
    const selectedTee = selectedCourse.tees.find(t => t.id === teeId);
    if (!selectedTee) {
      console.error(`Tee with ID ${teeId} not found`);
      return selectedCourse.holes;
    }
    
    // Check if this tee has specific hole data
    if (selectedTee.holes && selectedTee.holes.length > 0) {
      console.log("Using hole data specific to the selected tee:", selectedTee.holes);
      return selectedTee.holes;
    }
    
    // If the tee doesn't have specific hole data, use the course's default holes
    console.log("Tee doesn't have specific hole data, using course's default holes");
    return selectedCourse.holes;
  };

  // Fixed function to update scorecard for selected tee
  const updateScorecardForTee = (teeId: string, selection: HoleSelection = 'all') => {
    console.log("Updating scorecard for tee", teeId, "with selection", selection);
    
    if (!selectedCourse) {
      console.error("Cannot update scorecard: No course selected");
      return;
    }
    
    // Get holes data for the selected tee
    const allHolesData = getHolesForTee(teeId);
    
    console.log("All holes data for selected tee:", allHolesData);
    
    // Filter holes based on user selection
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
    
    // If we have no holes or not enough holes, create defaults
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
    
    // Create scores array with par values from the selected tee
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
    
    // Update the active tab to match the selection
    if (selection !== 'all') {
      setActiveScoreTab(selection === 'front9' ? "front9" : "back9");
    }
  };

  const handleScoreChange = (index: number, field: 'strokes' | 'putts', value: string) => {
    const newScores = [...scores];
    const parsedValue = value === '' ? undefined : parseInt(value, 10);
    
    if (!isNaN(parsedValue) || value === '') {
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
    setRoundDate(undefined);
    setHoleSelection('all');
    setActiveScoreTab("front9");
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
            gross_score: totalStrokes,
            to_par_gross: toParGross,
            net_score: null,
            to_par_net: null,
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
      
      queryClient.invalidateQueries(['userRounds']);
      handleCloseModal();
    } catch (error: any) {
      console.error("Error saving round:", error);
      toast({
