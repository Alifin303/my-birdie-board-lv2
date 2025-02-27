
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
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Loader2, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

// Types for the form
interface RoundFormData {
  courseId: string;
  teeId: string;
  date: string;
  scores: {
    hole: number;
    par: number;
    strokes: number;
    putts: number;
  }[];
}

export function AddRoundModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<GolfCourse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseDetail | null>(null);
  const [selectedTeeId, setSelectedTeeId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [scores, setScores] = useState<{ hole: number; par: number; strokes: number; putts: number; }[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Reset form when modal is closed
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSearchResults([]);
      setSelectedCourse(null);
      setSelectedTeeId("");
      setScores([]);
    }
  }, [open]);

  // Search for courses as user types
  useEffect(() => {
    const searchCourses = async () => {
      if (!debouncedSearchQuery || debouncedSearchQuery.length < 3) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`https://golfcourseapi.com/api/v1/courses?search=${encodeURIComponent(debouncedSearchQuery)}`, {
          headers: {
            'Authorization': 'Key 7GG4N6R5NOXNHW7H5A7EQVGL2U'
          }
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        setSearchResults(data.courses || []);
      } catch (error) {
        console.error("Course search error:", error);
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
  }, [debouncedSearchQuery, toast]);

  // Fetch course details when a course is selected
  const handleCourseSelect = async (courseId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://golfcourseapi.com/api/v1/courses/${courseId}`, {
        headers: {
          'Authorization': 'Key 7GG4N6R5NOXNHW7H5A7EQVGL2U'
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const courseDetail = await response.json();
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
    } catch (error) {
      console.error("Course detail error:", error);
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
        .eq('api_course_id', selectedCourse.id)
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
      queryClient.invalidateQueries({queryKey: ['userCourses']});
      queryClient.invalidateQueries({queryKey: ['userStats']});
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add a New Round</DialogTitle>
          <DialogDescription>
            Search for a golf course, select tees, and enter your scores.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Course Search */}
          <div className="space-y-2">
            <FormLabel>Search for a Golf Course</FormLabel>
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
                disabled={isLoading || !!selectedCourse}
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            
            {/* Search Results Dropdown */}
            {searchResults.length > 0 && !selectedCourse && (
              <div className="absolute z-10 w-full bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                <ul className="py-1">
                  {searchResults.map((course) => (
                    <li 
                      key={course.id}
                      className="px-4 py-2 hover:bg-muted cursor-pointer"
                      onClick={() => handleCourseSelect(course.id)}
                    >
                      {course.name} - {course.city}, {course.state}
                    </li>
                  ))}
                </ul>
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
          
          {/* Course Details and Score Entry */}
          {selectedCourse && !isLoading && (
            <>
              {/* Tee Selection */}
              <div className="space-y-2">
                <FormLabel>Select Tees</FormLabel>
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
                <FormLabel>Enter Your Scores</FormLabel>
                <div className="border rounded-md overflow-auto max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Hole</TableHead>
                        <TableHead className="w-20">Par</TableHead>
                        <TableHead>Strokes</TableHead>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveRound} 
            disabled={isLoading || !selectedCourse || scores.some(score => score.strokes === 0)}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
