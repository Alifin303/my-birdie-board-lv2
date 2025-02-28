import { useState, useEffect } from "react";
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
import { Loader2, Search, CalendarIcon } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { formatCourseName } from "@/integrations/supabase/client";
import { 
  searchCourses, 
  getCourseDetails, 
  generateMockCourseDetails, 
  GolfCourse, 
  CourseDetail,
  TeeBox
} from "@/services/golfCourseApi";

// Define interface for course search results
interface SimplifiedGolfCourse {
  id: string | number;
  name: string;
  clubName: string;
  city: string;
  state: string;
  country?: string;
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
}

// Type for hole selection (all 18, front 9, or back 9)
type HoleSelection = 'all' | 'front9' | 'back9';

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
      console.log("Tee details:", {
        rating: tee.course_rating,
        slope: tee.slope_rating,
        par: tee.par_total,
        yards: tee.total_yards
      });
      
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
      console.log("Tee details:", {
        rating: tee.course_rating,
        slope: tee.slope_rating,
        par: tee.par_total,
        yards: tee.total_yards
      });
      
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
  let holesData: Array<{par?: number, yardage?: number, handicap?: number}> = [];
  
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
      number: idx + 1,
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
            number: idx + 1,
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
            number: idx + 1,
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

export function AddRoundModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
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
  const [previouslyPlayedCourses, setPreviouslyPlayedCourses] = useState<SimplifiedGolfCourse[]>([]);
  const [roundDate, setRoundDate] = useState<Date>(new Date());
  const [isManualSearch, setIsManualSearch] = useState(false);
  const [holeSelection, setHoleSelection] = useState<HoleSelection>('all');
  const [calendarOpen, setCalendarOpen] = useState(false);
  
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
    } else {
      // Set today's date when modal opens
      setRoundDate(new Date());
      console.log("Modal opened, setting today's date:", new Date());
    }
  }, [open]);

  // Load previously played courses when the modal opens
  useEffect(() => {
    if (open) {
      console.log("Modal opened, fetching previously played courses");
      fetchPreviouslyPlayedCourses();
    }
  }, [open]);

  // Fetch previously played courses from database
  const fetchPreviouslyPlayedCourses = async () => {
    try {
      console.log("Fetching previously played courses");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No session found, can't fetch courses");
        return;
      }

      const { data, error } = await supabase
        .from('courses')
        .select('id, name, city, state')
        .order('name');
      
      if (error) {
        console.error("Error fetching courses:", error);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log("Found previously played courses:", data);
        // Convert to expected format
        const formattedCourses: SimplifiedGolfCourse[] = data.map(course => {
          // Split the name if it contains a dash (club - course format)
          const nameParts = course.name.split(' - ');
          return {
            id: course.id.toString(),
            name: nameParts.length > 1 ? nameParts[1] : course.name,
            clubName: nameParts.length > 1 ? nameParts[0] : course.name,
            city: course.city || '',
            state: course.state || ''
          };
        });
        
        console.log("Formatted previously played courses:", formattedCourses);
        setPreviouslyPlayedCourses(formattedCourses);
      } else {
        console.log("No previously played courses found");
      }
    } catch (error) {
      console.error("Error fetching previously played courses:", error);
    }
  };

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
      // Search for courses via API
      const courses = await searchCourses(searchQuery);
      console.log("API search results (raw):", courses);
      
      // Convert to simplified format for component use
      const simplifiedCourses = courses.map(convertToSimplifiedCourse);
      
      if (simplifiedCourses.length > 0) {
        console.log("Setting search results:", simplifiedCourses);
        setSearchResults(simplifiedCourses);
      } else {
        // If API returns no results, show error
        console.log("No courses found for query:", searchQuery);
        setSearchError("No courses found. Please try a different search term.");
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

  // Update scorecard when tee selection changes
  const updateScorecardForTee = (teeId: string, selection: HoleSelection = 'all') => {
    if (!originalCourseDetail) {
      console.error("No original course detail available");
      return;
    }
    
    console.log("Updating scorecard for tee", teeId, "with selection", selection);
    // Get holes data for the selected tee
    const allHolesData = extractHolesForTee(originalCourseDetail, teeId);
    console.log("All holes data:", allHolesData);
    
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
    
    // Also update the holes in the selected course object
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
    
    if (selectedTeeId && originalCourseDetail) {
      updateScorecardForTee(selectedTeeId, selection);
    }
  };

  // Fetch course details when a course is selected
  const handleCourseSelect = async (course: SimplifiedGolfCourse) => {
    setIsLoading(true);
    setSearchError(null);
    
    try {
      console.log("Selected course:", course);
      
      // Try to get course details from API
      let apiCourseDetail;
      try {
        console.log("Fetching course details for ID:", course.id);
        apiCourseDetail = await getCourseDetails(course.id);
        console.log("API course details (raw):", apiCourseDetail);
      } catch (error) {
        console.error("Error fetching course details from API:", error);
        apiCourseDetail = null;
      }
      
      // If API fails or returns null, generate mock data
      if (!apiCourseDetail || 
          !apiCourseDetail.tees || 
          (!apiCourseDetail.tees.male && !apiCourseDetail.tees.female)) {
        console.log("Using mock data for course details");
        
        // Create a GolfCourse object from SimplifiedGolfCourse
        const golfCourse: GolfCourse = {
          id: typeof course.id === 'string' ? parseInt(course.id) : course.id,
          club_name: course.clubName,
          course_name: course.name,
          location: {
            city: course.city,
            state: course.state,
            country: course.country || 'United States'
          }
        };
        
        apiCourseDetail = generateMockCourseDetails(golfCourse);
        console.log("Generated mock data:", apiCourseDetail);
        
        toast({
          title: "Note",
          description: "Using sample course data. Some details may not be accurate.",
          variant: "default",
        });
      }
      
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
        
        // Update the scorecard based on the selected tee - always default to 'all' 18 holes
        updateScorecardForTee(defaultTeeId, 'all');
        setHoleSelection('all');
      } else {
        // If no tees available, create a default scorecard
        console.log("No tees available, creating default scorecard");
        const defaultScores = Array(18).fill(null).map((_, idx) => ({
          hole: idx + 1,
          par: 4,
          strokes: 0
        }));
        setScores(defaultScores);
      }
      
      // Clear search results and update search query with course name
      setSearchResults([]);
      const displayName = `${simplifiedCourseDetail.clubName} - ${simplifiedCourseDetail.name}`;
      console.log("Setting search query to:", displayName);
      setSearchQuery(displayName);
      
      // Move to scorecard step
      setCurrentStep('scorecard');
    } catch (error) {
      console.error("Course detail error:", error);
      setSearchError("Failed to load course details. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load course details. Please try again.",
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

  // Validate and save the round
  const handleSaveRound = async () => {
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

    if (!selectedCourse || !selectedTeeId) {
      toast({
        title: "Validation Error",
        description: "Please select a course and tee.",
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
      const courseName = formatCourseName(selectedCourse.clubName, selectedCourse.name);
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
          api_course_id: selectedCourse.id.toString(),
          name: courseName,
          city: selectedCourse.city,
          state: selectedCourse.state,
        });
        
        const { data: newCourse, error: newCourseError } = await supabase
          .from('courses')
          .insert({
            api_course_id: selectedCourse.id.toString(),
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
    setSelectedCourse(null
