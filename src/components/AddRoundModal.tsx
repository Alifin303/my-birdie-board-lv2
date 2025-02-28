
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
import { Loader2, Search, CalendarIcon, Edit, PlusCircle } from "lucide-react";
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
import { supabase, formatCourseName, parseCourseName } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { 
  searchCourses, 
  getCourseDetails, 
  generateMockCourseDetails, 
  GolfCourse, 
  CourseDetail,
  TeeBox
} from "@/services/golfCourseApi";
import { ManualCourseForm } from "@/components/ManualCourseForm";

// Define interface for course search results
interface SimplifiedGolfCourse {
  id: string | number;
  name: string;
  clubName: string;
  city: string;
  state: string;
  country?: string;
  isUserAdded?: boolean;
}

// Interface for the tee box data
interface SimplifiedTee {
  id: string;
  name: string;
  rating: number;
  slope: number;
  par: number;
  yards?: number;
  gender: 'male' | 'female';
  originalIndex: number;
}

// Interface for individual hole data
interface SimplifiedHole {
  number: number;
  par: number;
  yards?: number;
  handicap?: number;
}

// Interface for detailed course information
interface SimplifiedCourseDetail {
  id: string | number;
  name: string;
  clubName: string;
  city: string;
  state: string;
  country?: string;
  tees: SimplifiedTee[];
  holes: SimplifiedHole[];
  isUserAdded?: boolean;
}

// Type for hole selection (all 18, front 9, or back 9)
type HoleSelection = 'all' | 'front9' | 'back9';

// Define props for AddRoundModal component
export interface AddRoundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Convert API course search result to simplified format
const convertToSimplifiedCourse = (course: GolfCourse): SimplifiedGolfCourse => {
  console.log("Converting course to simplified format:", course);
  
  const simplified = {
    id: course.id,
    name: course.course_name || course.club_name || "Unknown Course",
    clubName: course.club_name || "Unknown Club",
    city: course.location?.city || '',
    state: course.location?.state || '',
    country: course.location?.country || ''
  };
  
  console.log("Simplified course:", simplified);
  return simplified;
};

// Extract tee data from API response
const extractTeesFromApiResponse = (courseDetail: CourseDetail): SimplifiedTee[] => {
  const tees: SimplifiedTee[] = [];
  
  console.log("Extracting tees from course detail:", courseDetail);
  
  // Add male tees with unique IDs
  if (courseDetail.tees && courseDetail.tees.male && courseDetail.tees.male.length > 0) {
    courseDetail.tees.male.forEach((tee, index) => {
      console.log("Adding male tee:", tee.tee_name || `Tee ${index + 1}`);
      
      tees.push({
        id: `m-${index}`,
        name: tee.tee_name || `Tee ${index + 1}`,
        rating: tee.course_rating || 72,
        slope: tee.slope_rating || 113,
        par: tee.par_total || 72,
        yards: tee.total_yards,
        gender: 'male',
        originalIndex: index
      });
    });
  }
  
  // Add female tees with unique IDs
  if (courseDetail.tees && courseDetail.tees.female && courseDetail.tees.female.length > 0) {
    courseDetail.tees.female.forEach((tee, index) => {
      console.log("Adding female tee:", tee.tee_name || `Tee ${index + 1}`);
      
      tees.push({
        id: `f-${index}`,
        name: (tee.tee_name || `Tee ${index + 1}`) + " (W)",
        rating: tee.course_rating || 72,
        slope: tee.slope_rating || 113,
        par: tee.par_total || 72,
        yards: tee.total_yards,
        gender: 'female',
        originalIndex: index
      });
    });
  }
  
  // If no tees were found, create a default tee
  if (tees.length === 0) {
    console.log("No tees found, creating default tee");
    tees.push({
      id: 'm-0',
      name: 'Default Tees',
      rating: 72,
      slope: 113,
      par: 72,
      gender: 'male',
      originalIndex: 0
    });
  }
  
  console.log("Extracted tees:", tees);
  return tees;
};

// Extract hole data for a specific tee
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
    
    // Try male tees first
    if (courseDetail.tees.male) {
      for (const tee of courseDetail.tees.male) {
        if (tee.holes && tee.holes.length > 0) {
          console.log("Found hole data in male tee:", tee.tee_name);
          const mappedHoles = tee.holes.map((hole, idx) => ({
            number: hole.number || idx + 1,
            par: hole.par || 4,
            yards: hole.yardage,
            handicap: hole.handicap
          }));
          
          console.log("Mapped holes from alternative male tee:", mappedHoles);
          return mappedHoles;
        }
      }
    }
    
    // Try female tees if no male tee data found
    if (courseDetail.tees.female) {
      for (const tee of courseDetail.tees.female) {
        if (tee.holes && tee.holes.length > 0) {
          console.log("Found hole data in female tee:", tee.tee_name);
          const mappedHoles = tee.holes.map((hole, idx) => ({
            number: hole.number || idx + 1,
            par: hole.par || 4,
            yards: hole.yardage,
            handicap: hole.handicap
          }));
          
          console.log("Mapped holes from alternative female tee:", mappedHoles);
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

// Convert API course detail to simplified format
const convertToSimplifiedCourseDetail = (courseDetail: CourseDetail): SimplifiedCourseDetail => {
  console.log("Converting course detail to simplified format:", courseDetail);
  
  // Get course name and club name from the API response
  const name = courseDetail.course_name || "Unknown Course";
  const clubName = courseDetail.club_name || "Unknown Club";
  
  console.log("Course name:", name);
  console.log("Club name:", clubName);
  
  // Extract tee boxes
  const tees = extractTeesFromApiResponse(courseDetail);
  
  // Get holes data for the first tee
  let holes: SimplifiedHole[] = [];
  if (tees.length > 0) {
    const firstTeeId = tees[0].id;
    console.log("Getting holes for first tee:", firstTeeId);
    holes = extractHolesForTee(courseDetail, firstTeeId);
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
    tees,
    holes
  };
  
  console.log("Simplified course detail:", simplified);
  return simplified;
};

// Load tee details from localStorage for a user-added course
const loadUserAddedCourseDetails = (courseId: number): { tees: SimplifiedTee[], holes: SimplifiedHole[] } | null => {
  try {
    const courseDetailsKey = `course_details_${courseId}`;
    const storedDetails = localStorage.getItem(courseDetailsKey);
    
    if (!storedDetails) return null;
    
    const parsedDetails = JSON.parse(storedDetails);
    console.log("Loaded user-added course details:", parsedDetails);
    
    return {
      tees: parsedDetails.tees || [],
      holes: parsedDetails.tees && parsedDetails.tees.length > 0 ? 
        parsedDetails.tees[0].holes || [] : []
    };
  } catch (error) {
    console.error("Error loading user-added course details:", error);
    return null;
  }
};

export function AddRoundModal({ open, onOpenChange }: AddRoundModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<SimplifiedGolfCourse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<SimplifiedCourseDetail | null>(null);
  const [selectedTeeId, setSelectedTeeId] = useState<string>("");
  const [originalCourseDetail, setOriginalCourseDetail] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scores, setScores] = useState<{ hole: number; par: number; strokes: number; putts?: number; yards?: number; handicap?: number; }[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'search' | 'scorecard'>('search');
  const [roundDate, setRoundDate] = useState<Date>(new Date());
  const [isManualSearch, setIsManualSearch] = useState(false);
  const [holeSelection, setHoleSelection] = useState<HoleSelection>('all');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [manualCourseFormOpen, setManualCourseFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<SimplifiedGolfCourse | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get today's date for max date validation
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  useEffect(() => {
    console.log("AddRoundModal rendered, open state:", open);
  }, [open]);

  // Reset form when modal is closed and set today's date when opened
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSearchResults([]);
      setSelectedCourse(null);
      setOriginalCourseDetail(null);
      setSelectedTeeId("");
      setScores([]);
      setSearchError(null);
      setCurrentStep('search');
      setRoundDate(new Date()); // Reset to today's date
      setIsManualSearch(false);
      setHoleSelection('all');
      setCalendarOpen(false);
      setManualCourseFormOpen(false);
      setEditingCourse(null);
    } else {
      // Set today's date when modal opens
      setRoundDate(new Date());
      console.log("Modal opened, setting today's date:", new Date());
    }
  }, [open]);

  // Handle search button click or Enter key
  const handleSearch = async () => {
    if (!searchQuery || searchQuery.length < 3) {
      toast({
        title: "Validation Error",
        description: "Please enter at least 3 characters to search",
        variant: "destructive",
      });
      return;
    }
    
    setIsManualSearch(true);
    setIsSearching(true);
    setSearchError(null);
    
    try {
      console.log("Searching for courses with query:", searchQuery);
      
      // First, check the database for user-added courses
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No session found, can't search database");
        throw new Error("You must be logged in to search for courses");
      }
      
      const { data: dbCourses, error: dbError } = await supabase
        .from('courses')
        .select('id, name, city, state')
        .ilike('name', `%${searchQuery}%`)
        .order('name');
        
      if (dbError) {
        console.error("Error searching database courses:", dbError);
        throw dbError;
      }
      
      // Create array for user-added courses
      const userAddedCourses: SimplifiedGolfCourse[] = [];
      
      // Process database courses
      if (dbCourses && dbCourses.length > 0) {
        console.log("Found courses in database:", dbCourses);
        
        dbCourses.forEach(course => {
          // Check if it's a user-added course
          const isUserAdded = course.name.includes('[User added course]');
          if (isUserAdded) {
            const nameParts = parseCourseName(course.name);
            userAddedCourses.push({
              id: course.id.toString(),
              name: nameParts.courseName.replace(' [User added course]', ''),
              clubName: nameParts.clubName.replace(' [User added course]', ''),
              city: course.city || '',
              state: course.state || '',
              isUserAdded: true
            });
          }
        });
      }
      
      // Search for courses via API
      const apiCourses = await searchCourses(searchQuery);
      console.log("API search results (raw):", apiCourses);
      
      // Convert to simplified format for component use
      const simplifiedApiCourses = apiCourses.map(convertToSimplifiedCourse);
      
      // Combine user-added courses with API results
      const combinedResults = [...userAddedCourses, ...simplifiedApiCourses];
      
      if (combinedResults.length > 0) {
        console.log("Setting combined search results:", combinedResults);
        setSearchResults(combinedResults);
      } else {
        // If no results, show error message
        console.log("No courses found for query:", searchQuery);
        setSearchError("No courses found. Please try a different search term or add a new course.");
      }
    } catch (error) {
      console.error("Course search error:", error);
      setSearchError("Failed to search for courses. Please try again.");
      toast({
        title: "Search Error",
        description: "Failed to search for courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle key press on search input
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  // Update scorecard when tee selection changes - Fixed to use the correct par values for the selected tee
  const updateScorecardForTee = (teeId: string, selection: HoleSelection = 'all') => {
    console.log("Updating scorecard for tee", teeId, "with selection", selection);
    
    // Get holes data for the selected tee
    let allHolesData: SimplifiedHole[] = [];
    
    if (selectedCourse?.isUserAdded) {
      // For user-added courses, get holes from the selected tee in the course
      const selectedTee = selectedCourse.tees.find(t => t.id === teeId);
      if (selectedTee) {
        allHolesData = selectedCourse.holes;
      } else {
        allHolesData = Array(18).fill(null).map((_, idx) => ({
          number: idx + 1,
          par: 4,
          yards: 400,
          handicap: idx + 1
        }));
      }
    } else if (originalCourseDetail) {
      // For API courses, extract from the original course detail - specifically for the selected tee
      allHolesData = extractHolesForTee(originalCourseDetail, teeId);
    } else {
      // Fallback to default holes
      allHolesData = Array(18).fill(null).map((_, idx) => ({
        number: idx + 1,
        par: 4,
        yards: 400,
        handicap: idx + 1
      }));
    }
    
    console.log("All holes data for selected tee:", allHolesData);
    
    // Filter holes based on user selection
    let filteredHoles: SimplifiedHole[] = [];
    
    if (selection === 'front9') {
      filteredHoles = allHolesData.slice(0, 9);
      console.log("Filtered for front 9:", filteredHoles);
    } else if (selection === 'back9') {
      filteredHoles = allHolesData.slice(9, 18);
      console.log("Filtered for back 9:", filteredHoles);
    } else {
      filteredHoles = allHolesData;
      console.log("Using all 18 holes");
    }
    
    console.log(`Filtered holes for ${selection}:`, filteredHoles);
    
    // Create scores array with par values from the selected tee
    const newScores = filteredHoles.map(hole => ({
      hole: hole.number,
      par: hole.par,
      strokes: 0,
      putts: undefined,
      yards: hole.yards,
      handicap: hole.handicap
    }));
    
    console.log("New scores array:", newScores);
    setScores(newScores);
    
    // Also update the holes in the selected course object to reflect the current tee's pars
    if (selectedCourse) {
      setSelectedCourse(prev => {
        if (!prev) return null;
        return {
          ...prev,
          holes: allHolesData
        };
      });
    }
  };

  // Handle hole selection change (front 9, back 9, all)
  const handleHoleSelectionChange = (selection: HoleSelection) => {
    console.log("Changing hole selection to:", selection);
    setHoleSelection(selection);
    
    if (selectedTeeId) {
      updateScorecardForTee(selectedTeeId, selection);
    }
  };

  // Fetch course details when a course is selected
  const handleCourseSelect = async (course: SimplifiedGolfCourse) => {
    setIsLoading(true);
    setSearchError(null);
    
    try {
      console.log("Selected course:", course);
      
      // If it's a user-added course, load from local storage or database
      if (course.isUserAdded) {
        console.log("Loading user-added course:", course);
        
        // Get course details from localStorage
        const courseDetails = loadUserAddedCourseDetails(Number(course.id));
        
        let simplifiedCourseDetail: SimplifiedCourseDetail;
        
        if (courseDetails) {
          console.log("User-added course details found:", courseDetails);
          
          simplifiedCourseDetail = {
            id: course.id,
            name: course.name,
            clubName: course.clubName,
            city: course.city,
            state: course.state,
            tees: courseDetails.tees,
            holes: courseDetails.holes,
            isUserAdded: true
          };
        } else {
          // Create default course details if not found
          console.log("No user-added course details found, creating defaults");
          const defaultTee: SimplifiedTee = {
            id: 'm-0',
            name: 'White',
            rating: 72,
            slope: 113,
            par: 72,
            gender: 'male',
            originalIndex: 0
          };
          
          const defaultHoles = Array(18).fill(null).map((_, idx) => ({
            number: idx + 1,
            par: 4,
            yards: 400,
            handicap: idx + 1
          }));
          
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
        }
        
        console.log("Using user-added course details:", simplifiedCourseDetail);
        setSelectedCourse(simplifiedCourseDetail);
        
        // Set default tee
        if (simplifiedCourseDetail.tees.length > 0) {
          const defaultTeeId = simplifiedCourseDetail.tees[0].id;
          console.log("Setting default tee ID:", defaultTeeId);
          setSelectedTeeId(defaultTeeId);
          
          // Update the scorecard
          setHoleSelection('all');
          
          // Create scores array
          const newScores = simplifiedCourseDetail.holes.map(hole => ({
            hole: hole.number,
            par: hole.par,
            strokes: 0,
            putts: undefined,
            yards: hole.yards,
            handicap: hole.handicap
          }));
          
          setScores(newScores);
        }
      } else {
        // For courses from the API, fetch details
        try {
          // Fetch details from the API
          console.log("Fetching course details for ID:", course.id);
          const apiCourseDetail = await getCourseDetails(course.id);
          console.log("API course details (raw):", apiCourseDetail);
          
          // Save the original API course detail for reference
          setOriginalCourseDetail(apiCourseDetail);
          
          // Convert API response to the format expected by the component
          const simplifiedCourseDetail = convertToSimplifiedCourseDetail(apiCourseDetail);
          
          // Make sure course and club names are set properly
          if (!simplifiedCourseDetail.name && course.name) {
            console.log("Setting missing course name from search result:", course.name);
            simplifiedCourseDetail.name = course.name;
          }
          if (!simplifiedCourseDetail.clubName && course.clubName) {
            console.log("Setting missing club name from search result:", course.clubName);
            simplifiedCourseDetail.clubName = course.clubName;
          }
          
          console.log("Final course detail after processing:", simplifiedCourseDetail);
          setSelectedCourse(simplifiedCourseDetail);
          
          // Set default tee if available
          if (simplifiedCourseDetail.tees && simplifiedCourseDetail.tees.length > 0) {
            const defaultTeeId = simplifiedCourseDetail.tees[0].id;
            console.log("Setting default tee ID:", defaultTeeId);
            setSelectedTeeId(defaultTeeId);
            
            // Update the scorecard based on the selected tee
            updateScorecardForTee(defaultTeeId, 'all');
            setHoleSelection('all');
          }
        } catch (error) {
          console.error("Error fetching course details from API:", error);
          throw new Error(`Failed to load course details for ${course.name}. Please try again.`);
        }
      }
      
      // Clear search results and update search query with course name
      setSearchResults([]);
      const displayName = `${course.clubName} - ${course.name}`;
      console.log("Setting search query to:", displayName);
      setSearchQuery(displayName);
      
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

  // Handle tee selection
  const handleTeeChange = (teeId: string) => {
    console.log("Selected tee ID:", teeId);
    setSelectedTeeId(teeId);
    
    // Update the scorecard based on the new selected tee
    updateScorecardForTee(teeId, holeSelection);
  };

  // Handle score input
  const handleScoreChange = (holeIndex: number, field: 'strokes' | 'putts', value: string) => {
    console.log(`Updating ${field} for hole index ${holeIndex} to ${value}`);
    
    // Handle empty input
    if (value === '') {
      setScores(prevScores => {
        const newScores = [...prevScores];
        if (field === 'putts') {
          newScores[holeIndex] = {
            ...newScores[holeIndex],
            putts: undefined
          };
        } else {
          newScores[holeIndex] = {
            ...newScores[holeIndex],
            strokes: 0
          };
        }
        return newScores;
      });
      return;
    }
    
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 0) return;
    
    setScores(prevScores => {
      const newScores = [...prevScores];
      newScores[holeIndex] = {
        ...newScores[holeIndex],
        [field]: numValue
      };
      return newScores;
    });
  };

  // Handle date selection with improved behavior and debugging
  const handleDateSelect = (date: Date | undefined) => {
    console.log("Date selection triggered:", date);
    
    if (!date) {
      console.log("No date selected or date is undefined");
      return;
    }
    
    // Check if the selected date is in the future
    const isDateInFuture = date > today;
    console.log("Selected date:", date, "Today:", today, "Is future date:", isDateInFuture);
    
    if (isDateInFuture) {
      console.log("Future date detected, showing error toast");
      toast({
        title: "Invalid Date",
        description: "You cannot select a future date",
        variant: "destructive",
      });
      return;
    }
    
    // Valid date selected
    console.log("Valid date selected, updating state:", date);
    setRoundDate(date);
    
    // Force close the popover after successful selection
    console.log("Closing calendar popover");
    setCalendarOpen(false);
  };

  // Open the manual course form
  const handleAddManualCourse = () => {
    setManualCourseFormOpen(true);
  };

  // Open the edit course form
  const handleEditCourse = (course: SimplifiedGolfCourse) => {
    setEditingCourse(course);
    setManualCourseFormOpen(true);
  };

  // Handle course creation or update
  const handleCourseCreated = (courseId: number, courseName: string) => {
    console.log("Course created/updated:", courseId, courseName);
    
    toast({
      title: editingCourse ? "Course Updated" : "Course Created",
      description: `The course has been successfully ${editingCourse ? 'updated' : 'created'}.`
    });
    
    // Fetch the new course details and select it
    const newCourse: SimplifiedGolfCourse = {
      id: courseId.toString(),
      name: courseName.replace(' [User added course]', ''),
      clubName: courseName.replace(' [User added course]', ''),
      city: '',
      state: '',
      isUserAdded: true
    };
    
    // Reset editing course
    setEditingCourse(null);
    
    // Select the course
    handleCourseSelect(newCourse);
  };

  // Validate and save the round
  const handleSaveRound = async () => {
    // Validate course selection
    if (!selectedCourse) {
      toast({
        title: "Validation Error",
        description: "Please select a course.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate tee selection
    if (!selectedTeeId) {
      toast({
        title: "Validation Error",
        description: "Please select a tee box.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate scores
    const invalidScores = scores.filter(score => score.strokes === 0);
    if (invalidScores.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please enter strokes for all holes.`,
        variant: "destructive",
      });
      return;
    }
    
    // Additional date validation before submission
    console.log("Validating date before submission:", roundDate, "Today:", today);
    if (roundDate > today) {
      console.log("Future date detected during submission, blocking");
      toast({
        title: "Validation Error",
        description: "Round date cannot be in the future.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Saving round with data:", {
        course: selectedCourse,
        teeId: selectedTeeId,
        date: roundDate,
        scores,
        holeSelection
      });
      
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("You must be logged in to save a round.");
      }

      // Calculate round totals
      const totalStrokes = scores.reduce((sum, score) => sum + score.strokes, 0);
      const totalPar = scores.reduce((sum, score) => sum + score.par, 0);
      const toParGross = totalStrokes - totalPar;
      
      // Get selected tee
      const selectedTee = selectedCourse.tees.find(tee => tee.id === selectedTeeId);
      
      if (!selectedTee) {
        throw new Error("Selected tee not found.");
      }
      
      // Calculate net score based on user's handicap, but not for 9-hole rounds
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('handicap')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        throw profileError;
      }
      
      const userHandicap = profile.handicap || 0;
      
      // Only apply handicap for 18-hole rounds
      let handicapStrokes = 0;
      if (holeSelection === 'all') {
        handicapStrokes = Math.round(userHandicap);
      }
      
      const netScore = totalStrokes - handicapStrokes;
      const toParNet = netScore - totalPar;

      // First, check if the course exists in the database
      let courseDbId: number;
      const courseName = selectedCourse.isUserAdded ? 
        `${selectedCourse.name} [User added course]` : 
        formatCourseName(selectedCourse.clubName, selectedCourse.name);
        
      console.log("Formatted course name for DB:", courseName);
      
      const { data: existingCourse } = await supabase
        .from('courses')
        .select('id')
        .eq('name', courseName)
        .maybeSingle();
        
      if (existingCourse) {
        courseDbId = existingCourse.id;
        console.log("Found existing course in database:", courseDbId);
      } else {
        // Insert course
        console.log("Course not found in database, creating new course");
        console.log("Course data to insert:", {
          api_course_id: selectedCourse.isUserAdded ? null : selectedCourse.id.toString(),
          name: courseName,
          city: selectedCourse.city,
          state: selectedCourse.state,
        });
        
        const { data: newCourse, error: newCourseError } = await supabase
          .from('courses')
          .insert({
            api_course_id: selectedCourse.isUserAdded ? null : selectedCourse.id.toString(),
            name: courseName,
            city: selectedCourse.city,
            state: selectedCourse.state,
          })
          .select('id')
          .single();
          
        if (newCourseError) {
          console.error("Error creating new course:", newCourseError);
          throw newCourseError;
        }
        
        courseDbId = newCourse.id;
        console.log("Created new course with ID:", courseDbId);
      }

      console.log("Saving round with calculated data:", {
        userId: session.user.id,
        courseId: courseDbId,
        date: roundDate.toISOString(),
        teeId: selectedTeeId,
        teeName: selectedTee.name,
        grossScore: totalStrokes,
        netScore,
        toParGross,
        toParNet,
        holeScores: scores
      });

      // Save the round
      const { data: savedRound, error: roundError } = await supabase
        .from('rounds')
        .insert({
          user_id: session.user.id,
          course_id: courseDbId,
          date: roundDate.toISOString(),
          tee_id: selectedTeeId,
          tee_name: selectedTee.name,
          gross_score: totalStrokes,
          net_score: netScore,
          to_par_gross: toParGross,
          to_par_net: toParNet,
          hole_scores: scores,
        })
        .select();
        
      if (roundError) {
        console.error("Error saving round:", roundError);
        throw roundError;
      }

      console.log("Round saved successfully:", savedRound);
      
      toast({
        title: "Round Saved",
        description: "Your round has been successfully saved.",
      });
      
      // Close the modal
      onOpenChange(false);
      
      // Refresh data
      queryClient.invalidateQueries({queryKey: ['userRounds']});
    } catch (error: any) {
      console.error("Save round error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save round. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle modal close button click
  const handleCloseModal = () => {
    console.log("Closing modal");
    onOpenChange(false);
  };

  // Handle back button click when in scorecard step
  const handleBackToSearch = () => {
    console.log("Going back to search");
    setCurrentStep('search');
    setSelectedCourse(null);
    setOriginalCourseDetail(null);
    setSelectedTeeId("");
    setScores([]);
  };

  // Render course search step
  const renderSearchStep = () => {
    return (
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
              onKeyDown={handleSearchKeyPress}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Enter a course name or location and press Enter to search
          </p>
        </div>
        
        <div className="flex justify-center">
          <Button
            onClick={handleSearch}
            disabled={isSearching || searchQuery.length < 3}
            className="w-full md:w-auto"
          >
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </Button>
        </div>
        
        {/* "Add a new course" always visible regardless of search results */}
        <div className="mt-2 mb-4 text-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddManualCourse}
            className="w-full"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Can't find your course? Add it now
          </Button>
        </div>
        
        {/* Search Error */}
        {searchError && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 text-center">
            <p className="text-sm text-destructive">{searchError}</p>
          </div>
        )}
        
        {/* Search Results */}
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
                        handleEditCourse(course);
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
        
        {/* Manual Course Entry Form Dialog */}
        <ManualCourseForm
          open={manualCourseFormOpen}
          onOpenChange={setManualCourseFormOpen}
          onCourseCreated={handleCourseCreated}
          existingCourse={editingCourse ? {
            id: Number(editingCourse.id),
            name: editingCourse.name,
            city: editingCourse.city,
            state: editingCourse.state
          } : undefined}
        />
      </div>
    );
  };

  // Render scorecard step
  const renderScorecardStep = () => {
    if (!selectedCourse) return null;
    
    // Get all holes and split them into front 9 and back 9
    const frontNine = scores.filter(score => score.hole <= 9);
    const backNine = scores.filter(score => score.hole > 9);
    
    // Show front 9, back 9, or both based on hole selection
    const showFrontNine = holeSelection === 'all' || holeSelection === 'front9';
    const showBackNine = holeSelection === 'all' || holeSelection === 'back9';

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{selectedCourse.clubName !== selectedCourse.name ? 
              `${selectedCourse.clubName} - ${selectedCourse.name}` : 
              selectedCourse.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {selectedCourse.city}{selectedCourse.state ? `, ${selectedCourse.state}` : ''}
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Date Selector */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Date Played</label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
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
          
          {/* Tee Box Selector */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Tee Played</label>
            <Select value={selectedTeeId} onValueChange={handleTeeChange}>
              <SelectTrigger className="h-10">
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
        </div>
        
        {/* Hole Selection */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Holes Played</label>
          <div className="flex space-x-2">
            <Button 
              variant={holeSelection === 'all' ? "default" : "outline"}
              size="sm"
              onClick={() => handleHoleSelectionChange('all')}
            >
              All 18
            </Button>
            <Button 
              variant={holeSelection === 'front9' ? "default" : "outline"} 
              size="sm"
              onClick={() => handleHoleSelectionChange('front9')}
            >
              Front 9
            </Button>
            <Button 
              variant={holeSelection === 'back9' ? "default" : "outline"} 
              size="sm"
              onClick={() => handleHoleSelectionChange('back9')}
            >
              Back 9
            </Button>
          </div>
        </div>
        
        {/* Scorecard Table - Front 9 */}
        {showFrontNine && frontNine.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Front Nine</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="pl-2 pr-4 py-2 text-left text-sm font-medium whitespace-nowrap">Hole</th>
                    {frontNine.map(score => (
                      <th key={`hole-${score.hole}`} className="px-2 py-2 text-center text-sm font-medium">{score.hole}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="pl-2 pr-4 py-2 text-sm font-medium">Par</td>
                    {frontNine.map(score => (
                      <td key={`par-${score.hole}`} className="px-2 py-2 text-center">
                        <div className="bg-muted/40 border border-muted rounded-md w-8 h-8 flex items-center justify-center font-medium mx-auto">
                          {score.par}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="pl-2 pr-4 py-2 text-sm font-medium">Strokes</td>
                    {frontNine.map((score, index) => (
                      <td key={`strokes-${score.hole}`} className="px-2 py-2 text-center">
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          value={score.strokes || ''}
                          onChange={(e) => handleScoreChange(index, 'strokes', e.target.value)}
                          className="w-10 h-8 text-center mx-auto"
                          inputMode="numeric"
                        />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="pl-2 pr-4 py-2 text-sm font-medium">Putts</td>
                    {frontNine.map((score, index) => (
                      <td key={`putts-${score.hole}`} className="px-2 py-2 text-center">
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          value={score.putts || ''}
                          onChange={(e) => handleScoreChange(index, 'putts', e.target.value)}
                          className="w-10 h-8 text-center mx-auto"
                          inputMode="numeric"
                          placeholder="-"
                        />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Scorecard Table - Back 9 */}
        {showBackNine && backNine.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Back Nine</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="pl-2 pr-4 py-2 text-left text-sm font-medium whitespace-nowrap">Hole</th>
                    {backNine.map(score => (
                      <th key={`hole-${score.hole}`} className="px-2 py-2 text-center text-sm font-medium">{score.hole}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="pl-2 pr-4 py-2 text-sm font-medium">Par</td>
                    {backNine.map(score => (
                      <td key={`par-${score.hole}`} className="px-2 py-2 text-center">
                        <div className="bg-muted/40 border border-muted rounded-md w-8 h-8 flex items-center justify-center font-medium mx-auto">
                          {score.par}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="pl-2 pr-4 py-2 text-sm font-medium">Strokes</td>
                    {backNine.map((score, index) => {
                      // Adjust the index to account for front nine
                      const adjustedIndex = index + frontNine.length;
                      return (
                        <td key={`strokes-${score.hole}`} className="px-2 py-2 text-center">
                          <Input
                            type="number"
                            min="1"
                            max="20"
                            value={score.strokes || ''}
                            onChange={(e) => handleScoreChange(adjustedIndex, 'strokes', e.target.value)}
                            className="w-10 h-8 text-center mx-auto"
                            inputMode="numeric"
                          />
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="pl-2 pr-4 py-2 text-sm font-medium">Putts</td>
                    {backNine.map((score, index) => {
                      // Adjust the index to account for front nine
                      const adjustedIndex = index + frontNine.length;
                      return (
                        <td key={`putts-${score.hole}`} className="px-2 py-2 text-center">
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            value={score.putts || ''}
                            onChange={(e) => handleScoreChange(adjustedIndex, 'putts', e.target.value)}
                            className="w-10 h-8 text-center mx-auto"
                            inputMode="numeric"
                            placeholder="-"
                          />
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Score Summary */}
        <div className="bg-muted/20 rounded-md p-4 border">
          <h3 className="text-sm font-medium mb-2">Round Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Gross Score:</span>{' '}
              <span className="font-medium">
                {scores.reduce((sum, score) => sum + (score.strokes || 0), 0) || '-'}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">To Par:</span>{' '}
              <span className="font-medium">
                {(() => {
                  const totalStrokes = scores.reduce((sum, score) => sum + (score.strokes || 0), 0);
                  const totalPar = scores.reduce((sum, score) => sum + score.par, 0);
                  if (!totalStrokes) return '-';
                  const toPar = totalStrokes - totalPar;
                  return toPar > 0 ? `+${toPar}` : toPar;
                })()}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Total Putts:</span>{' '}
              <span className="font-medium">
                {scores.some(s => s.putts !== undefined) ? 
                  scores.reduce((sum, score) => sum + (score.putts || 0), 0) : 
                  'Not Recorded'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={handleCloseModal} type="button">
            Cancel
          </Button>
          <Button onClick={handleSaveRound} disabled={isLoading} type="button">
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
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-[600px] ${currentStep === 'scorecard' ? 'sm:max-w-[650px]' : ''}`}>
        <DialogHeader>
          <DialogTitle>{currentStep === 'search' ? "Add a New Round" : "Enter Scores"}</DialogTitle>
          <DialogDescription>
            {currentStep === 'search' 
              ? "Search for a course or select from your previously played courses."
              : "Enter your scores for each hole."}
          </DialogDescription>
        </DialogHeader>
        
        {currentStep === 'search' ? renderSearchStep() : renderScorecardStep()}
      </DialogContent>
    </Dialog>
  );
}
