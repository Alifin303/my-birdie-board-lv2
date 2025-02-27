
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

// Interface for tee box data
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
  return {
    id: course.id,
    name: course.course_name || course.club_name || "Unknown Course",
    clubName: course.club_name || "Unknown Club",
    city: course.location?.city || '',
    state: course.location?.state || '',
    country: course.location?.country || ''
  };
};

// Extract tee data from API response
const extractTeesFromApiResponse = (courseDetail: CourseDetail): SimplifiedTee[] => {
  const tees: SimplifiedTee[] = [];
  
  // Add male tees with unique IDs
  if (courseDetail.tees && courseDetail.tees.male && courseDetail.tees.male.length > 0) {
    courseDetail.tees.male.forEach((tee, index) => {
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
  
  return tees;
};

// Extract hole data for a specific tee
const extractHolesForTee = (courseDetail: CourseDetail, teeId: string): SimplifiedHole[] => {
  // Parse the tee ID to get gender and index
  const [gender, indexStr] = teeId.split('-');
  const index = parseInt(indexStr);
  
  // Get the correct tee data
  let teeData: TeeBox | undefined;
  let holesData: Array<{par: number, yardage?: number, handicap?: number}> = [];
  
  if (courseDetail.tees) {
    if (gender === 'm' && courseDetail.tees.male && courseDetail.tees.male.length > index) {
      teeData = courseDetail.tees.male[index];
      if (teeData.holes && teeData.holes.length > 0) {
        holesData = teeData.holes;
      }
    } else if (gender === 'f' && courseDetail.tees.female && courseDetail.tees.female.length > index) {
      teeData = courseDetail.tees.female[index];
      if (teeData.holes && teeData.holes.length > 0) {
        holesData = teeData.holes;
      }
    }
  }
  
  // If we found hole data for the specific tee, use it
  if (holesData.length > 0) {
    return holesData.map((hole, idx) => ({
      number: idx + 1,
      par: hole.par || 4,
      yards: hole.yardage,
      handicap: hole.handicap
    }));
  }
  
  // Fallback: try to find any hole data in any tee
  if (courseDetail.tees) {
    // Try male tees first
    if (courseDetail.tees.male) {
      for (const tee of courseDetail.tees.male) {
        if (tee.holes && tee.holes.length > 0) {
          return tee.holes.map((hole, idx) => ({
            number: idx + 1,
            par: hole.par || 4,
            yards: hole.yardage,
            handicap: hole.handicap
          }));
        }
      }
    }
    
    // Try female tees if no male tee data found
    if (courseDetail.tees.female) {
      for (const tee of courseDetail.tees.female) {
        if (tee.holes && tee.holes.length > 0) {
          return tee.holes.map((hole, idx) => ({
            number: idx + 1,
            par: hole.par || 4,
            yards: hole.yardage,
            handicap: hole.handicap
          }));
        }
      }
    }
  }
  
  // Last resort: create default holes
  return Array(18).fill(null).map((_, idx) => ({
    number: idx + 1,
    par: 4,
    yards: 400,
    handicap: idx + 1
  }));
};

// Convert API course detail to simplified format
const convertToSimplifiedCourseDetail = (courseDetail: CourseDetail): SimplifiedCourseDetail => {
  // Get course name and club name from the API response
  const name = courseDetail.course_name || "Unknown Course";
  const clubName = courseDetail.club_name || "Unknown Club";
  
  // Extract tee boxes
  const tees = extractTeesFromApiResponse(courseDetail);
  
  // Get holes data for the first tee
  let holes: SimplifiedHole[] = [];
  if (tees.length > 0) {
    const firstTeeId = tees[0].id;
    holes = extractHolesForTee(courseDetail, firstTeeId);
  } else {
    // Default holes if no tees available
    holes = Array(18).fill(null).map((_, idx) => ({
      number: idx + 1,
      par: 4,
      yards: 400,
      handicap: idx + 1
    }));
  }
  
  return {
    id: courseDetail.id || 0,
    name,
    clubName,
    city: courseDetail.location?.city || '',
    state: courseDetail.location?.state || '',
    country: courseDetail.location?.country || 'United States',
    tees,
    holes
  };
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

  // Reset form when modal is closed
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
      setRoundDate(new Date());
      setIsManualSearch(false);
      setHoleSelection('all');
      setCalendarOpen(false);
    }
  }, [open]);

  // Load previously played courses when the modal opens
  useEffect(() => {
    if (open) {
      fetchPreviouslyPlayedCourses();
    }
  }, [open]);

  // Fetch previously played courses from database
  const fetchPreviouslyPlayedCourses = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('courses')
        .select('id, name, city, state')
        .order('name');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
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
        
        setPreviouslyPlayedCourses(formattedCourses);
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
      // Search for courses via API
      const courses = await searchCourses(searchQuery);
      console.log("API search results:", courses);
      
      // Convert to simplified format for component use
      const simplifiedCourses = courses.map(convertToSimplifiedCourse);
      
      if (simplifiedCourses.length > 0) {
        setSearchResults(simplifiedCourses);
      } else {
        // If API returns no results, show error
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

  // Filter holes based on selection (front 9, back 9, or all)
  const getHolesBasedOnSelection = (allHoles: SimplifiedHole[], selection: HoleSelection): SimplifiedHole[] => {
    if (selection === 'front9') {
      return allHoles.slice(0, 9);
    } else if (selection === 'back9') {
      return allHoles.slice(9, 18);
    }
    return allHoles;
  };

  // Update scorecard when tee selection changes
  const updateScorecardForTee = (teeId: string, selection: HoleSelection = 'all') => {
    if (!originalCourseDetail) {
      console.error("No original course detail available");
      return;
    }
    
    // Get holes data for the selected tee
    const allHolesData = extractHolesForTee(originalCourseDetail, teeId);
    console.log("All holes data:", allHolesData);
    
    // Filter holes based on user selection
    let filteredHoles: SimplifiedHole[] = [];
    
    if (selection === 'front9') {
      filteredHoles = allHolesData.slice(0, 9);
    } else if (selection === 'back9') {
      filteredHoles = allHolesData.slice(9, 18);
    } else {
      filteredHoles = allHolesData;
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
      let apiCourseDetail = await getCourseDetails(course.id);
      console.log("API course details:", apiCourseDetail);
      
      // If API fails or returns null, generate mock data
      if (!apiCourseDetail) {
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
        simplifiedCourseDetail.name = course.name;
      }
      if (!simplifiedCourseDetail.clubName && course.clubName) {
        simplifiedCourseDetail.clubName = course.clubName;
      }
      
      setSelectedCourse(simplifiedCourseDetail);
      
      // Set default tee if available
      if (simplifiedCourseDetail.tees && simplifiedCourseDetail.tees.length > 0) {
        const defaultTeeId = simplifiedCourseDetail.tees[0].id;
        setSelectedTeeId(defaultTeeId);
        
        // Update the scorecard based on the selected tee - always default to 'all' 18 holes
        updateScorecardForTee(defaultTeeId, 'all');
        setHoleSelection('all');
      } else {
        // If no tees available, create a default scorecard
        const defaultScores = Array(18).fill(null).map((_, idx) => ({
          hole: idx + 1,
          par: 4,
          strokes: 0
        }));
        setScores(defaultScores);
      }
      
      // Clear search results and update search query with course name
      setSearchResults([]);
      setSearchQuery(`${simplifiedCourseDetail.clubName} - ${simplifiedCourseDetail.name}`);
      
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
    const numValue = parseInt(value);
    
    if (isNaN(numValue) || numValue < 0) return;
    
    setScores(prevScores => {
      const newScores = [...prevScores];
      
      // For the putts field, allow empty input to make it optional
      if (field === 'putts' && value === '') {
        // Set to undefined to make it optional
        newScores[holeIndex] = {
          ...newScores[holeIndex],
          putts: undefined
        };
      } else {
        newScores[holeIndex] = {
          ...newScores[holeIndex],
          [field]: numValue
        };
      }
      
      return newScores;
    });
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setRoundDate(date);
      setCalendarOpen(false); // Close the calendar after selection
    }
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

    setIsLoading(true);
    try {
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
      const courseName = `${selectedCourse.clubName} - ${selectedCourse.name}`;
      
      const { data: existingCourse } = await supabase
        .from('courses')
        .select('id')
        .eq('name', courseName)
        .maybeSingle();
        
      if (existingCourse) {
        courseDbId = existingCourse.id;
      } else {
        // Insert course
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
          throw newCourseError;
        }
        
        courseDbId = newCourse.id;
      }

      // Save the round
      const { error: roundError } = await supabase
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
        });
        
      if (roundError) {
        throw roundError;
      }

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
    onOpenChange(false);
  };

  // Handle back button click when in scorecard step
  const handleBackToSearch = () => {
    setCurrentStep('search');
    setSelectedCourse(null);
    setOriginalCourseDetail(null);
    setSelectedTeeId("");
    setScores([]);
  };

  // Render previously played courses section
  const renderPreviouslyPlayedCourses = () => {
    if (previouslyPlayedCourses.length === 0) return null;

    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">Previously Played Courses</h3>
        <div className="border rounded-md p-2 bg-muted/50 grid gap-2">
          {previouslyPlayedCourses.slice(0, 3).map((course) => (
            <button
              key={course.id.toString()}
              className="text-left px-3 py-2 rounded-md hover:bg-background transition-colors"
              onClick={() => handleCourseSelect(course)}
            >
              <p className="font-medium">{course.clubName} - {course.name}</p>
              <p className="text-xs text-muted-foreground">{course.city}{course.state ? `, ${course.state}` : ''}</p>
            </button>
          ))}
          {previouslyPlayedCourses.length > 3 && (
            <button
              className="text-primary text-sm hover:underline"
              onClick={() => setSearchQuery("")}
            >
              View all previously played courses
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render horizontal scorecard for all 18 holes
  const renderHorizontalScorecardAll = () => {
    if (!selectedCourse) return null;
    
    const frontNine = scores.slice(0, 9);
    const backNine = scores.slice(9, 18);
    
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Round Date</p>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="mt-1"
                  onClick={() => setCalendarOpen(true)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(roundDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={roundDate}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Holes to Play</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="mt-1">
                  {holeSelection === 'all' ? 'All 18 Holes' : 
                   holeSelection === 'front9' ? 'Front 9 Holes' : 'Back 9 Holes'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Select Holes</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleHoleSelectionChange('all')}>
                  All 18 Holes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleHoleSelectionChange('front9')}>
                  Front 9 Holes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleHoleSelectionChange('back9')}>
                  Back 9 Holes
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-8">
          {/* Front Nine */}
          <div className="border rounded-md overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-sm font-medium text-muted-foreground px-2 py-2 text-left">Front</th>
                  {frontNine.map(score => (
                    <th key={`hole-${score.hole}`} className="text-sm font-medium text-muted-foreground px-2 py-2 text-center">
                      {score.hole}
                    </th>
                  ))}
                  <th className="text-sm font-medium text-muted-foreground px-2 py-2 text-center">
                    Out
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="text-sm font-medium text-muted-foreground px-2 py-2">Par</td>
                  {frontNine.map(score => (
                    <td key={`par-${score.hole}`} className="text-sm text-center px-2 py-2">
                      {score.par}
                    </td>
                  ))}
                  <td className="text-sm font-medium px-2 py-2 text-center">
                    {frontNine.reduce((sum, s) => sum + s.par, 0)}
                  </td>
                </tr>
                {/* Yardage row - only show if we have yards data */}
                {frontNine.some(score => score.yards) && (
                  <tr className="border-b">
                    <td className="text-sm font-medium text-muted-foreground px-2 py-2">Yards</td>
                    {frontNine.map(score => (
                      <td key={`yards-${score.hole}`} className="text-sm text-center px-2 py-2">
                        {score.yards || '-'}
                      </td>
                    ))}
                    <td className="text-sm font-medium px-2 py-2 text-center">
                      {frontNine.reduce((sum, s) => sum + (s.yards || 0), 0)}
                    </td>
                  </tr>
                )}
                {/* Handicap row - only show if we have handicap data */}
                {frontNine.some(score => score.handicap) && (
                  <tr className="border-b">
                    <td className="text-sm font-medium text-muted-foreground px-2 py-2">HCP</td>
                    {frontNine.map(score => (
                      <td key={`handicap-${score.hole}`} className="text-sm text-center px-2 py-2">
                        {score.handicap || '-'}
                      </td>
                    ))}
                    <td className="text-sm font-medium px-2 py-2 text-center">
                      -
                    </td>
                  </tr>
                )}
                <tr className="border-b">
                  <td className="text-sm font-medium text-muted-foreground px-2 py-2">Strokes</td>
                  {frontNine.map((score, index) => (
                    <td key={`strokes-${score.hole}`} className="text-center px-2 py-2">
                      <Input
                        type="number"
                        min="1"
                        value={score.strokes || ""}
                        onChange={(e) => handleScoreChange(index, 'strokes', e.target.value)}
                        className="w-12 h-8 text-center"
                        required
                      />
                    </td>
                  ))}
                  <td className="text-sm font-medium px-2 py-2 text-center">
                    {frontNine.reduce((sum, s) => sum + (s.strokes || 0), 0)}
                  </td>
                </tr>
                <tr>
                  <td className="text-sm font-medium text-muted-foreground px-2 py-2">Putts (optional)</td>
                  {frontNine.map((score, index) => (
                    <td key={`putts-${score.hole}`} className="text-center px-2 py-2">
                      <Input
                        type="number"
                        min="0"
                        value={score.putts !== undefined ? score.putts : ""}
                        onChange={(e) => handleScoreChange(index, 'putts', e.target.value)}
                        className="w-12 h-8 text-center"
                        placeholder="-"
                      />
                    </td>
                  ))}
                  <td className="text-sm font-medium px-2 py-2 text-center">
                    {frontNine.reduce((sum, s) => sum + (s.putts || 0), 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Back Nine */}
          <div className="border rounded-md overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-sm font-medium text-muted-foreground px-2 py-2 text-left">Back</th>
                  {backNine.map(score => (
                    <th key={`hole-${score.hole}`} className="text-sm font-medium text-muted-foreground px-2 py-2 text-center">
                      {score.hole}
                    </th>
                  ))}
                  <th className="text-sm font-medium text-muted-foreground px-2 py-2 text-center">
                    In
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="text-sm font-medium text-muted-foreground px-2 py-2">Par</td>
                  {backNine.map(score => (
                    <td key={`par-${score.hole}`} className="text-sm text-center px-2 py-2">
                      {score.par}
                    </td>
                  ))}
                  <td className="text-sm font-medium px-2 py-2 text-center">
                    {backNine.reduce((sum, s) => sum + s.par, 0)}
                  </td>
                </tr>
                {/* Yardage row - only show if we have yards data */}
                {backNine.some(score => score.yards) && (
                  <tr className="border-b">
                    <td className="text-sm font-medium text-muted-foreground px-2 py-2">Yards</td>
                    {backNine.map(score => (
                      <td key={`yards-${score.hole}`} className="text-sm text-center px-2 py-2">
                        {score.yards || '-'}
                      </td>
                    ))}
                    <td className="text-sm font-medium px-2 py-2 text-center">
                      {backNine.reduce((sum, s) => sum + (s.yards || 0), 0)}
                    </td>
                  </tr>
                )}
                {/* Handicap row - only show if we have handicap data */}
                {backNine.some(score => score.handicap) && (
                  <tr className="border-b">
                    <td className="text-sm font-medium text-muted-foreground px-2 py-2">HCP</td>
                    {backNine.map(score => (
                      <td key={`handicap-${score.hole}`} className="text-sm text-center px-2 py-2">
                        {score.handicap || '-'}
                      </td>
                    ))}
                    <td className="text-sm font-medium px-2 py-2 text-center">
                      -
                    </td>
                  </tr>
                )}
                <tr className="border-b">
                  <td className="text-sm font-medium text-muted-foreground px-2 py-2">Strokes</td>
                  {backNine.map((score, index) => (
                    <td key={`strokes-${score.hole}`} className="text-center px-2 py-2">
                      <Input
                        type="number"
                        min="1"
                        value={score.strokes || ""}
                        onChange={(e) => handleScoreChange(index + 9, 'strokes', e.target.value)}
                        className="w-12 h-8 text-center"
                        required
                      />
                    </td>
                  ))}
                  <td className="text-sm font-medium px-2 py-2 text-center">
                    {backNine.reduce((sum, s) => sum + (s.strokes || 0), 0)}
                  </td>
                </tr>
                <tr>
                  <td className="text-sm font-medium text-muted-foreground px-2 py-2">Putts (optional)</td>
                  {backNine.map((score, index) => (
                    <td key={`putts-${score.hole}`} className="text-center px-2 py-2">
                      <Input
                        type="number"
                        min="0"
                        value={score.putts !== undefined ? score.putts : ""}
                        onChange={(e) => handleScoreChange(index + 9, 'putts', e.target.value)}
                        className="w-12 h-8 text-center"
                        placeholder="-"
                      />
                    </td>
                  ))}
                  <td className="text-sm font-medium px-2 py-2 text-center">
                    {backNine.reduce((sum, s) => sum + (s.putts || 0), 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="border rounded-md p-4 bg-muted/50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Total Strokes:</span>{" "}
              {scores.reduce((sum, score) => sum + (score.strokes || 0), 0)}
            </div>
            <div>
              <span className="font-medium">Total Putts:</span>{" "}
              {scores.reduce((sum, score) => sum + (score.putts || 0), 0)}
            </div>
            <div>
              <span className="font-medium">Total Par:</span>{" "}
              {scores.reduce((sum, score) => sum + score.par, 0)}
            </div>
            <div>
              <span className="font-medium">To Par:</span>{" "}
              {scores.reduce((sum, score) => sum + (score.strokes || 0), 0) - 
                scores.reduce((sum, score) => sum + score.par, 0)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render horizontal scorecard for front 9 holes
  const renderHorizontalScorecardFront9 = () => {
    if (!selectedCourse) return null;
    
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Round Date</p>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="mt-1"
                  onClick={() => setCalendarOpen(true)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(roundDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={roundDate}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Holes to Play</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="mt-1">
                  {holeSelection === 'all' ? 'All 18 Holes' : 
                   holeSelection === 'front9' ? 'Front 9 Holes' : 'Back 9 Holes'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Select Holes</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleHoleSelectionChange('all')}>
                  All 18 Holes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleHoleSelectionChange('front9')}>
                  Front 9 Holes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleHoleSelectionChange('back9')}>
                  Back 9 Holes
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-8">
          {/* Front Nine */}
          <div className="border rounded-md overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-sm font-medium text-muted-foreground px-2 py-2 text-left">Front</th>
                  {scores.map(score => (
                    <th key={`hole-${score.hole}`} className="text-sm font-medium text-muted-foreground px-2 py-2 text-center">
                      {score.hole}
                    </th>
                  ))}
                  <th className="text-sm font-medium text-muted-foreground px-2 py-2 text-center">
                    Out
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="text-sm font-medium text-muted-foreground px-2 py-2">Par</td>
                  {scores.map(score => (
                    <td key={`par-${score.hole}`} className="text-sm text-center px-2 py-2">
                      {score.par}
                    </td>
                  ))}
                  <td className="text-sm font-medium px-2 py-2 text-center">
                    {scores.reduce((sum, s) => sum + s.par, 0)}
                  </td>
                </tr>
                {/* Yardage row - only show if we have yards data */}
                {scores.some(score => score.yards) && (
                  <tr className="border-b">
                    <td className="text-sm font-medium text-muted-foreground px-2 py-2">Yards</td>
                    {scores.map(score => (
                      <td key={`yards-${score.hole}`} className="text-sm text-center px-2 py-2">
                        {score.yards || '-'}
                      </td>
                    ))}
                    <td className="text-sm font-medium px-2 py-2 text-center">
                      {scores.reduce((sum, s) => sum + (s.yards || 0), 0)}
                    </td>
                  </tr>
                )}
                {/* Handicap row - only show if we have handicap data */}
                {scores.some(score => score.handicap) && (
                  <tr className="border-b">
                    <td className="text-sm font-medium text-muted-foreground px-2 py-2">HCP</td>
                    {scores.map(score => (
                      <td key={`handicap-${score.hole}`} className="text-sm text-center px-2 py-2">
                        {score.handicap || '-'}
                      </td>
                    ))}
                    <td className="text-sm font-medium px-2 py-2 text-center">
                      -
                    </td>
                  </tr>
                )}
                <tr className="border-b">
                  <td className="text-sm font-medium text-muted-foreground px-2 py-2">Strokes</td>
                  {scores.map((score, index) => (
                    <td key={`strokes-${score.hole}`} className="text-center px-2 py-2">
                      <Input
                        type="number"
                        min="1"
                        value={score.strokes || ""}
                        onChange={(e) => handleScoreChange(index, 'strokes', e.target.value)}
                        className="w-12 h-8 text-center"
                        required
                      />
                    </td>
                  ))}
                  <td className="text-sm font-medium px-2 py-2 text-center">
                    {scores.reduce((sum, s) => sum + (s.strokes || 0), 0)}
                  </td>
                </tr>
                <tr>
                  <td className="text-sm font-medium text-muted-foreground px-2 py-2">Putts (optional)</td>
                  {scores.map((score, index) => (
                    <td key={`putts-${score.hole}`} className="text-center px-2 py-2">
                      <Input
                        type="number"
                        min="0"
                        value={score.putts !== undefined ? score.putts : ""}
                        onChange={(e) => handleScoreChange(index, 'putts', e.target.value)}
                        className="w-12 h-8 text-center"
                        placeholder="-"
                      />
                    </td>
                  ))}
                  <td className="text-sm font-medium px-2 py-2 text-center">
                    {scores.reduce((sum, s) => sum + (s.putts || 0), 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="border rounded-md p-4 bg-muted/50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Total Strokes:</span>{" "}
              {scores.reduce((sum, score) => sum + (score.strokes || 0), 0)}
            </div>
            <div>
              <span className="font-medium">Total Putts:</span>{" "}
              {scores.reduce((sum, score) => sum + (score.putts || 0), 0)}
            </div>
            <div>
              <span className="font-medium">Total Par:</span>{" "}
              {scores.reduce((sum, score) => sum + score.par, 0)}
            </div>
            <div>
              <span className="font-medium">To Par:</span>{" "}
              {scores.reduce((sum, score) => sum + (score.strokes || 0), 0) - 
                scores.reduce((sum, score) => sum + score.par, 0)}
            </div>
            <div className="col-span-2 text-amber-600">
              <p className="text-sm">
                Note: 9-hole rounds will not contribute to handicap calculations.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render horizontal scorecard for back 9 holes
  const renderHorizontalScorecardBack9 = () => {
    if (!selectedCourse) return null;
    
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Round Date</p>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="mt-1"
                  onClick={() => setCalendarOpen(true)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(roundDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={roundDate}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Holes to Play</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="mt-1">
                  {holeSelection === 'all' ? 'All 18 Holes' : 
                   holeSelection === 'front9' ? 'Front 9 Holes' : 'Back 9 Holes'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Select Holes</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleHoleSelectionChange('all')}>
                  All 18 Holes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleHoleSelectionChange('front9')}>
                  Front 9 Holes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleHoleSelectionChange('back9')}>
                  Back 9 Holes
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-8">
          {/* Back Nine */}
          <div className="border rounded-md overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-sm font-medium text-muted-foreground px-2 py-2 text-left">Back</th>
                  {scores.map(score => (
                    <th key={`hole-${score.hole}`} className="text-sm font-medium text-muted-foreground px-2 py-2 text-center">
                      {score.hole}
                    </th>
                  ))}
                  <th className="text-sm font-medium text-muted-foreground px-2 py-2 text-center">
                    In
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="text-sm font-medium text-muted-foreground px-2 py-2">Par</td>
                  {scores.map(score => (
                    <td key={`par-${score.hole}`} className="text-sm text-center px-2 py-2">
                      {score.par}
                    </td>
                  ))}
                  <td className="text-sm font-medium px-2 py-2 text-center">
                    {scores.reduce((sum, s) => sum + s.par, 0)}
                  </td>
                </tr>
                {/* Yardage row - only show if we have yards data */}
                {scores.some(score => score.yards) && (
                  <tr className="border-b">
                    <td className="text-sm font-medium text-muted-foreground px-2 py-2">Yards</td>
                    {scores.map(score => (
                      <td key={`yards-${score.hole}`} className="text-sm text-center px-2 py-2">
                        {score.yards || '-'}
                      </td>
                    ))}
                    <td className="text-sm font-medium px-2 py-2 text-center">
                      {scores.reduce((sum, s) => sum + (s.yards || 0), 0)}
                    </td>
                  </tr>
                )}
                {/* Handicap row - only show if we have handicap data */}
                {scores.some(score => score.handicap) && (
                  <tr className="border-b">
                    <td className="text-sm font-medium text-muted-foreground px-2 py-2">HCP</td>
                    {scores.map(score => (
                      <td key={`handicap-${score.hole}`} className="text-sm text-center px-2 py-2">
                        {score.handicap || '-'}
                      </td>
                    ))}
                    <td className="text-sm font-medium px-2 py-2 text-center">
                      -
                    </td>
                  </tr>
                )}
                <tr className="border-b">
                  <td className="text-sm font-medium text-muted-foreground px-2 py-2">Strokes</td>
                  {scores.map((score, index) => (
                    <td key={`strokes-${score.hole}`} className="text-center px-2 py-2">
                      <Input
                        type="number"
                        min="1"
                        value={score.strokes || ""}
                        onChange={(e) => handleScoreChange(index, 'strokes', e.target.value)}
                        className="w-12 h-8 text-center"
                        required
                      />
                    </td>
                  ))}
                  <td className="text-sm font-medium px-2 py-2 text-center">
                    {scores.reduce((sum, s) => sum + (s.strokes || 0), 0)}
                  </td>
                </tr>
                <tr>
                  <td className="text-sm font-medium text-muted-foreground px-2 py-2">Putts (optional)</td>
                  {scores.map((score, index) => (
                    <td key={`putts-${score.hole}`} className="text-center px-2 py-2">
                      <Input
                        type="number"
                        min="0"
                        value={score.putts !== undefined ? score.putts : ""}
                        onChange={(e) => handleScoreChange(index, 'putts', e.target.value)}
                        className="w-12 h-8 text-center"
                        placeholder="-"
                      />
                    </td>
                  ))}
                  <td className="text-sm font-medium px-2 py-2 text-center">
                    {scores.reduce((sum, s) => sum + (s.putts || 0), 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="border rounded-md p-4 bg-muted/50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Total Strokes:</span>{" "}
              {scores.reduce((sum, score) => sum + (score.strokes || 0), 0)}
            </div>
            <div>
              <span className="font-medium">Total Putts:</span>{" "}
              {scores.reduce((sum, score) => sum + (score.putts || 0), 0)}
            </div>
            <div>
              <span className="font-medium">Total Par:</span>{" "}
              {scores.reduce((sum, score) => sum + score.par, 0)}
            </div>
            <div>
              <span className="font-medium">To Par:</span>{" "}
              {scores.reduce((sum, score) => sum + (score.strokes || 0), 0) - 
                scores.reduce((sum, score) => sum + score.par, 0)}
            </div>
            <div className="col-span-2 text-amber-600">
              <p className="text-sm">
                Note: 9-hole rounds will not contribute to handicap calculations.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the appropriate scorecard based on hole selection
  const renderHorizontalScorecard = () => {
    if (holeSelection === 'all') {
      return renderHorizontalScorecardAll();
    } else if (holeSelection === 'front9') {
      return renderHorizontalScorecardFront9();
    } else {
      return renderHorizontalScorecardBack9();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Add a New Round</DialogTitle>
          <DialogDescription>
            {currentStep === 'search' 
              ? "Search for a golf course, select tees, and enter your scores."
              : "Enter your scores for each hole."
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {currentStep === 'search' && (
            <>
              {/* Course Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search for a Golf Course</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      type="search"
                      placeholder="Type golf course name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearchKeyPress}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                  <Button 
                    onClick={handleSearch}
                    disabled={isLoading || searchQuery.length < 3}
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Search
                  </Button>
                </div>
                
                {/* Search Error Message */}
                {searchError && (
                  <div className="text-destructive text-sm mt-2">
                    {searchError}
                  </div>
                )}
                
                {/* Previously Played Courses */}
                {!isManualSearch && searchQuery.length < 3 && renderPreviouslyPlayedCourses()}
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="border rounded-md mt-4">
                    <div className="p-4">
                      <h3 className="text-sm font-medium mb-3">Search Results</h3>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {searchResults.map((course) => (
                          <div 
                            key={course.id.toString()}
                            className="p-3 border rounded-md hover:bg-muted cursor-pointer transition-colors"
                            onClick={() => handleCourseSelect(course)}
                          >
                            <p className="font-medium">{course.clubName} - {course.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {course.city}{course.state ? `, ${course.state}` : ''}
                              {course.country && course.country !== 'USA' ? `, ${course.country}` : ''}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Loading State */}
              {isLoading && (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading course data...</span>
                </div>
              )}
            </>
          )}
          
          {/* Course Details and Score Entry */}
          {selectedCourse && currentStep === 'scorecard' && !isLoading && (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {selectedCourse.clubName} {selectedCourse.name && selectedCourse.name !== selectedCourse.clubName ? `- ${selectedCourse.name}` : ''}
                  </h3>
                  <Button variant="outline" size="sm" onClick={handleBackToSearch}>
                    Change Course
                  </Button>
                </div>
                <p className="text-muted-foreground">
                  {selectedCourse.city}{selectedCourse.state ? `, ${selectedCourse.state}` : ''}
                  {selectedCourse.country && selectedCourse.country !== 'USA' && selectedCourse.country !== 'United States' ? `, ${selectedCourse.country}` : ''}
                </p>
              </div>
            
              {/* Tee Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Tees</label>
                <Select value={selectedTeeId} onValueChange={handleTeeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tees" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCourse.tees.map((tee) => (
                      <SelectItem key={tee.id} value={tee.id}>
                        {tee.name} - Rating: {tee.rating.toFixed(1)}, Slope: {tee.slope}
                        {tee.yards ? `, ${tee.yards} yards` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Selected Tee Details */}
                {selectedCourse.tees.length > 0 && selectedTeeId && (
                  <div className="mt-4 p-3 border rounded-md bg-muted/30">
                    <h4 className="font-medium mb-1">Selected Tee Details</h4>
                    {(() => {
                      const tee = selectedCourse.tees.find(t => t.id === selectedTeeId);
                      if (!tee) return null;
                      return (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                          <div><span className="font-medium">Tee:</span> {tee.name}</div>
                          <div><span className="font-medium">Gender:</span> {tee.gender === 'male' ? 'Men\'s' : 'Women\'s'}</div>
                          <div><span className="font-medium">Course Rating:</span> {tee.rating.toFixed(1)}</div>
                          <div><span className="font-medium">Slope Rating:</span> {tee.slope}</div>
                          <div><span className="font-medium">Par:</span> {tee.par}</div>
                          {tee.yards && <div><span className="font-medium">Total Yards:</span> {tee.yards}</div>}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
              
              {/* Horizontal Scorecard */}
              {renderHorizontalScorecard()}
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCloseModal} type="button">
            Cancel
          </Button>
          
          {currentStep === 'scorecard' && (
            <Button 
              onClick={handleSaveRound} 
              disabled={isLoading || !selectedCourse || scores.some(score => score.strokes === 0)}
              type="button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Round"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
