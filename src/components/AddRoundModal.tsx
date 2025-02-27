
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
import { Loader2, Search } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Types for Golf Course API responses
interface GolfCourse {
  id: string;
  name: string;
  city: string;
  state: string;
}

interface CourseTee {
  id: string;
  name: string;
  gender: string;
  rating: number;
  slope: number;
  par: number;
}

interface CourseHole {
  id: string;
  number: number;
  par: number;
  handicap: number;
  yards: {
    [teeId: string]: number;
  };
}

interface CourseDetail {
  id: string;
  name: string;
  city: string;
  state: string;
  holes: CourseHole[];
  tees: CourseTee[];
}

export function AddRoundModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  console.log("AddRoundModal rendered with open:", open);
  
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<GolfCourse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseDetail | null>(null);
  const [selectedTeeId, setSelectedTeeId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [scores, setScores] = useState<{ hole: number; par: number; strokes: number; putts: number; }[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'search' | 'scorecard'>('search');
  const [previouslyPlayedCourses, setPreviouslyPlayedCourses] = useState<GolfCourse[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Reset form when modal is closed
  useEffect(() => {
    console.log("AddRoundModal open state changed to:", open);
    if (!open) {
      setSearchQuery("");
      setSearchResults([]);
      setSelectedCourse(null);
      setSelectedTeeId("");
      setScores([]);
      setSearchError(null);
      setCurrentStep('search');
    }
  }, [open]);

  // Load previously played courses when the modal opens
  useEffect(() => {
    if (open) {
      fetchPreviouslyPlayedCourses();
    }
  }, [open]);

  // Fetch previously played courses
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
        const formattedCourses: GolfCourse[] = data.map(course => ({
          id: course.id.toString(),
          name: course.name,
          city: course.city || '',
          state: course.state || ''
        }));
        
        setPreviouslyPlayedCourses(formattedCourses);
      }
    } catch (error) {
      console.error("Error fetching previously played courses:", error);
    }
  };

  // Search for courses as user types
  useEffect(() => {
    const searchCourses = async () => {
      if (!open || !debouncedSearchQuery || debouncedSearchQuery.length < 3 || currentStep !== 'search') {
        setSearchResults([]);
        setSearchError(null);
        return;
      }

      setIsSearching(true);
      setSearchError(null);
      
      try {
        console.log("Searching for courses with query:", debouncedSearchQuery);
        
        // First, search previously played courses
        const matchingPreviousCourses = previouslyPlayedCourses.filter(
          course => course.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        );
        
        // Then add mock data for demonstration
        const mockCourses = [
          {
            id: "mock1",
            name: "Augusta National Golf Club",
            city: "Augusta",
            state: "GA"
          },
          {
            id: "mock2",
            name: "Pebble Beach Golf Links",
            city: "Pebble Beach",
            state: "CA"
          },
          {
            id: "mock3",
            name: "St Andrews Links",
            city: "St Andrews",
            state: "Scotland"
          },
          {
            id: "mock4",
            name: "TPC Sawgrass",
            city: "Ponte Vedra Beach",
            state: "FL"
          }
        ].filter(
          course => course.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        );
        
        // Combine results, prioritizing previously played courses
        const combinedResults = [...matchingPreviousCourses, ...mockCourses];
        
        if (combinedResults.length > 0) {
          setSearchResults(combinedResults);
        } else {
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

    searchCourses();
  }, [debouncedSearchQuery, toast, open, currentStep, previouslyPlayedCourses]);

  // Fetch course details when a course is selected
  const handleCourseSelect = async (course: GolfCourse) => {
    setIsLoading(true);
    setSearchError(null);
    
    try {
      console.log("Selected course:", course);
      
      // Create mock course details based on the selected course
      const courseDetail: CourseDetail = {
        id: course.id,
        name: course.name,
        city: course.city,
        state: course.state,
        holes: Array(18).fill(null).map((_, i) => ({
          id: `${i + 1}`,
          number: i + 1,
          par: i % 3 === 0 ? 5 : (i % 3 === 1 ? 3 : 4), // Mix of par 3, 4, 5
          handicap: i + 1,
          yards: { 
            "1": 350 + (i * 15), // Blue tees
            "2": 330 + (i * 15), // White tees
            "3": 310 + (i * 15)  // Red tees
          }
        })),
        tees: [
          {
            id: "1",
            name: "Blue",
            gender: "M",
            rating: 72.5,
            slope: 133,
            par: 72
          },
          {
            id: "2",
            name: "White",
            gender: "M",
            rating: 70.8,
            slope: 128,
            par: 72
          },
          {
            id: "3",
            name: "Red",
            gender: "F",
            rating: 69.2,
            slope: 123,
            par: 72
          }
        ]
      };
      
      setSelectedCourse(courseDetail);
      
      // Set default tee if available
      if (courseDetail.tees && courseDetail.tees.length > 0) {
        setSelectedTeeId(courseDetail.tees[0].id);
      }

      // Initialize scores for all holes
      const initialScores = courseDetail.holes.map(hole => ({
        hole: hole.number,
        par: hole.par,
        strokes: 0,
        putts: 0
      }));
      
      setScores(initialScores);
      
      // Clear search results
      setSearchResults([]);
      setSearchQuery(courseDetail.name);
      
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
    setSelectedTeeId(teeId);
  };

  // Handle score input
  const handleScoreChange = (holeIndex: number, field: 'strokes' | 'putts', value: string) => {
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
      
      // Calculate net score based on user's handicap
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('handicap')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) {
        throw profileError;
      }
      
      const userHandicap = profile.handicap || 0;
      const handicapStrokes = Math.round(userHandicap);
      const netScore = totalStrokes - handicapStrokes;
      const toParNet = netScore - totalPar;

      // First, let's add the course to the database if it doesn't exist
      const { data: existingCourse, error: existingCourseError } = await supabase
        .from('courses')
        .select('id')
        .eq('name', selectedCourse.name)
        .single();
        
      let courseDbId;
      
      if (!existingCourse) {
        // Insert course
        const { data: newCourse, error: newCourseError } = await supabase
          .from('courses')
          .insert({
            api_course_id: selectedCourse.id,
            name: selectedCourse.name,
            city: selectedCourse.city,
            state: selectedCourse.state,
          })
          .select('id')
          .single();
          
        if (newCourseError) {
          throw newCourseError;
        }
        
        courseDbId = newCourse.id;
      } else {
        courseDbId = existingCourse.id;
      }

      // Save the round
      const { error: roundError } = await supabase
        .from('rounds')
        .insert({
          user_id: session.user.id,
          course_id: courseDbId,
          date: new Date().toISOString(),
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
    console.log("Manually closing modal");
    onOpenChange(false);
  };

  // Handle back button click when in scorecard step
  const handleBackToSearch = () => {
    setCurrentStep('search');
    setSelectedCourse(null);
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
              key={course.id}
              className="text-left px-3 py-2 rounded-md hover:bg-background transition-colors"
              onClick={() => handleCourseSelect(course)}
            >
              <p className="font-medium">{course.name}</p>
              <p className="text-xs text-muted-foreground">{course.city}, {course.state}</p>
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
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
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    type="search"
                    placeholder="Type to search for a golf course..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                  {isSearching && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                {/* Search Error Message */}
                {searchError && (
                  <div className="text-destructive text-sm mt-2">
                    {searchError}
                  </div>
                )}
                
                {/* Previously Played Courses */}
                {searchQuery.length < 3 && renderPreviouslyPlayedCourses()}
                
                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="border rounded-md shadow-md mt-2 bg-background z-50">
                    <div className="py-1">
                      <h3 className="px-3 py-2 text-sm font-medium text-muted-foreground">Search Results</h3>
                      <ul className="max-h-60 overflow-auto">
                        {searchResults.map((course) => (
                          <li 
                            key={course.id}
                            className="px-4 py-2 hover:bg-muted cursor-pointer transition-colors"
                            onClick={() => handleCourseSelect(course)}
                          >
                            <p className="font-medium">{course.name}</p>
                            <p className="text-xs text-muted-foreground">{course.city}, {course.state}</p>
                          </li>
                        ))}
                      </ul>
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
                  <h3 className="text-lg font-semibold">{selectedCourse.name}</h3>
                  <Button variant="outline" size="sm" onClick={handleBackToSearch}>
                    Change Course
                  </Button>
                </div>
                <p className="text-muted-foreground">{selectedCourse.city}, {selectedCourse.state}</p>
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
                        {tee.name} - Rating: {tee.rating}, Slope: {tee.slope}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Score Entry Table */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Enter Your Scores</label>
                <div className="border rounded-md overflow-auto max-h-96">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead className="w-20">Hole</TableHead>
                        <TableHead className="w-20">Par</TableHead>
                        <TableHead>Strokes*</TableHead>
                        <TableHead>Putts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scores.map((score, index) => (
                        <TableRow key={index}>
                          <TableCell>{score.hole}</TableCell>
                          <TableCell>{score.par}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={score.strokes || ""}
                              onChange={(e) => handleScoreChange(index, 'strokes', e.target.value)}
                              className="w-20"
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              value={score.putts || ""}
                              onChange={(e) => handleScoreChange(index, 'putts', e.target.value)}
                              className="w-20"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground">* Strokes are required for all holes</p>
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
