
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Search, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useDebounce } from '@/hooks/use-debounce';
import { searchCourses, GolfCourse } from '@/services/golfCourseApi';
import { useToast } from '@/hooks/use-toast';
import { supabase, parseCourseName } from '@/integrations/supabase/client';

interface CourseSelectorProps {
  onSelectCourse: (course: any) => void;
  onAddCourse: () => void;
  selectedCourseId?: number | string;
}

export const CourseSelector = ({ 
  onSelectCourse, 
  onAddCourse,
  selectedCourseId 
}: CourseSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GolfCourse[]>([]);
  const [userCourses, setUserCourses] = useState<any[]>([]);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { toast } = useToast();

  // Fetch user-added courses from database
  const fetchUserCourses = useCallback(async () => {
    try {
      console.log("Fetching user-added courses...");
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('name');
        
      if (error) {
        throw error;
      }
      
      console.log("User-added courses:", data);
      setUserCourses(data || []);
    } catch (error) {
      console.error("Error fetching user courses:", error);
      toast({
        title: "Error",
        description: "Failed to load your courses. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Get tee data for a user-added course
  const getUserCourseTees = async (courseId: number | string) => {
    console.log(`Loading user-added course from database: ${courseId}`);
    
    try {
      // Get course data from supabase
      const { data: course, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
        
      if (error) {
        throw error;
      }
      
      // Get tee data from localStorage (original approach)
      const courseDetailsKey = `course_details_${courseId}`;
      const storedDetails = localStorage.getItem(courseDetailsKey);
      
      if (storedDetails) {
        try {
          const parsedDetails = JSON.parse(storedDetails);
          console.log("Found stored course details:", parsedDetails);
          
          // Format the course with the tees
          const courseWithTees = {
            ...course,
            clubName: parseCourseName(course.name).clubName,
            tees: parsedDetails.tees || [],
            isUserAdded: true
          };
          
          return courseWithTees;
        } catch (e) {
          console.error("Error parsing stored course details:", e);
        }
      } else {
        console.log(`No course details found in localStorage for course ID: ${courseId}`);
      }
      
      // Create default course details
      console.log("No cached details found for user-added course, creating defaults");
      const defaultTee = {
        id: `tee-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
        name: "White",
        rating: 72,
        slope: 113,
        par: 72,
        gender: "male",
        originalIndex: 0,
        holes: Array.from({ length: 18 }, (_, i) => ({
          number: i + 1,
          par: 4,
          yards: 400,
          handicap: i + 1
        }))
      };
      
      const defaultCourseDetails = {
        id: courseId,
        name: course.name.replace(' [User added course]', ''),
        tees: [defaultTee]
      };
      
      // Save default details to localStorage
      localStorage.setItem(courseDetailsKey, JSON.stringify(defaultCourseDetails));
      console.log("Saved default course details to localStorage");
      
      // Return the course with default tees
      return {
        ...course,
        clubName: parseCourseName(course.name).clubName,
        tees: [defaultTee],
        isUserAdded: true
      };
    } catch (error) {
      console.error("Error loading user-added course:", error);
      toast({
        title: "Error",
        description: "Failed to load course details.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Search for courses in API and database
  const searchForCourses = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Search API for courses
      const { results } = await searchCourses(query, false);
      console.log(`Found ${results.length} courses from API`);
      
      // Search user-added courses
      const filteredUserCourses = userCourses.filter(course => 
        course.name.toLowerCase().includes(query.toLowerCase()) ||
        (course.city && course.city.toLowerCase().includes(query.toLowerCase())) ||
        (course.state && course.state.toLowerCase().includes(query.toLowerCase()))
      );
      
      // Combine results, putting user courses first
      const combinedResults = [
        ...filteredUserCourses.map(course => ({
          ...course,
          isUserAdded: true,
          course_name: parseCourseName(course.name).courseName,
          club_name: parseCourseName(course.name).clubName,
          location: {
            city: course.city,
            state: course.state,
            country: course.country || 'United States'
          }
        })),
        ...results
      ];
      
      setSearchResults(combinedResults);
    } catch (error) {
      console.error('Error searching for courses:', error);
      toast({
        title: "Search Error",
        description: "Failed to search for courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, [userCourses, toast]);

  // Handle course selection
  const handleSelectCourse = async (course: GolfCourse) => {
    try {
      let selectedCourse;
      
      if (course.isUserAdded) {
        // This is a user-added course, get the tees from localStorage
        selectedCourse = await getUserCourseTees(course.id);
        console.log("Selected course:", selectedCourse);
      } else {
        // This is an API course, format it properly
        selectedCourse = {
          id: course.id,
          name: course.club_name + " - " + course.course_name,
          clubName: course.club_name,
          courseName: course.course_name,
          city: course.location?.city,
          state: course.location?.state,
          country: course.location?.country || 'United States',
          apiCourseId: course.id,
          isUserAdded: false
        };
      }
      
      if (selectedCourse) {
        onSelectCourse(selectedCourse);
        setSearchQuery(selectedCourse.name);
      }
    } catch (error) {
      console.error('Error selecting course:', error);
      toast({
        title: "Error",
        description: "Failed to select this course. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Load user courses on component mount
  useEffect(() => {
    fetchUserCourses();
  }, [fetchUserCourses]);

  // Search when query changes
  useEffect(() => {
    searchForCourses(debouncedSearchQuery);
  }, [debouncedSearchQuery, searchForCourses]);

  // Auto-select course if ID is provided
  useEffect(() => {
    const selectCourseById = async () => {
      if (selectedCourseId && userCourses.length > 0) {
        const course = userCourses.find(c => c.id === selectedCourseId);
        if (course) {
          const courseWithTees = await getUserCourseTees(course.id);
          if (courseWithTees) {
            console.log("Setting selected course:", courseWithTees);
            setSearchQuery(courseWithTees.name);
            onSelectCourse(courseWithTees);
          }
        }
      }
    };
    
    selectCourseById();
  }, [selectedCourseId, userCourses, onSelectCourse]);

  return (
    <Card className="p-4 mb-6 backdrop-blur-sm bg-white/80 border-0 shadow-lg">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent/60 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search for a golf course..."
            className="pl-10 border-accent/20 focus:border-accent/40"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-accent/60 w-4 h-4 animate-spin" />
          )}
        </div>
        
        {/* Search results */}
        {debouncedSearchQuery && searchResults.length > 0 && (
          <div className="max-h-60 overflow-y-auto border rounded-md bg-white shadow-sm">
            {searchResults.map((course, index) => (
              <div 
                key={`${course.id}-${index}`}
                className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                onClick={() => handleSelectCourse(course)}
              >
                <div className="font-medium">{course.isUserAdded 
                  ? parseCourseName(course.name).clubName 
                  : course.club_name}
                </div>
                <div className="text-sm text-gray-600">
                  {course.isUserAdded 
                    ? `${course.city || ''} ${course.state || ''}`
                    : `${course.location?.city || ''} ${course.location?.state || ''}, ${course.location?.country || 'USA'}`}
                </div>
                {course.isUserAdded && (
                  <div className="text-xs mt-1 text-accent italic">
                    Your course
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* "No results" message */}
        {debouncedSearchQuery && !isSearching && searchResults.length === 0 && (
          <div className="p-2 text-center text-gray-500">
            No courses found. Try a different search or add your course manually.
          </div>
        )}
        
        {/* "Add your course" button - always visible */}
        <div className="text-center">
          <Button 
            variant="outline" 
            className="w-full text-accent"
            onClick={onAddCourse}
          >
            Can't find your course? Add it now
          </Button>
        </div>
      </div>
    </Card>
  );
};

