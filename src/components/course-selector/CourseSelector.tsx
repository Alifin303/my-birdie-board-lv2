
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { GolfCourse } from '@/services/golfCourseApi';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import { SearchInput } from './SearchInput';
import { SearchResults } from './SearchResults';
import { AddCourseButton } from './AddCourseButton';
import { 
  fetchUserCourses, 
  getUserCourseTees, 
  searchForCourses 
} from './CourseDataService';

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
  const loadUserCourses = useCallback(async () => {
    try {
      const courses = await fetchUserCourses();
      setUserCourses(courses);
    } catch (error) {
      console.error("Error fetching user courses:", error);
      toast({
        title: "Error",
        description: "Failed to load your courses. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Handle course selection
  const handleSelectCourse = async (course: GolfCourse) => {
    try {
      let selectedCourse;
      
      // Normalize course ID to ensure consistent type handling 
      // between mobile and desktop platforms
      const courseId = typeof course.id === 'string' ? parseInt(course.id, 10) : course.id;
      
      // Check if this is a user-added course (not from API)
      if (course.isUserAdded && !course.isApiCourse) {
        // This is a manually added course, get the tees from database or localStorage
        console.log("Selected manually-added course:", { id: courseId, name: course.name });
        selectedCourse = await getUserCourseTees(courseId);
        console.log("Selected course with tees:", selectedCourse);
      } 
      // Check if this is an API course that exists in our database
      else if (course.isApiCourse && !course.isUserAdded) {
        // This is an API course, get data from API
        console.log("Selected API course:", { 
          id: courseId, 
          apiId: course.apiCourseId || course.id.toString() 
        });
        
        // Format as API course
        selectedCourse = {
          id: courseId,
          name: course.club_name + " - " + course.course_name,
          clubName: course.club_name,
          courseName: course.course_name,
          city: course.location?.city,
          state: course.location?.state,
          country: course.location?.country || 'United States',
          apiCourseId: course.apiCourseId || course.id.toString(),
          isApiCourse: true
        };
      } 
      else {
        // Fallback for other course types
        console.log("Selected course with unknown source:", { id: courseId, name: course.name });
        selectedCourse = await getUserCourseTees(courseId);
        
        if (!selectedCourse) {
          console.log("Course not found in database, treating as API course");
          // Try to handle as API course if it has an apiCourseId
          selectedCourse = {
            id: courseId,
            name: course.name,
            clubName: course.club_name || course.name,
            courseName: course.name,
            city: course.city || course.location?.city,
            state: course.state || course.location?.state,
            country: course.country || course.location?.country || 'United States',
            apiCourseId: course.apiCourseId || course.id.toString(),
            isApiCourse: true
          };
        }
      }
      
      if (selectedCourse) {
        // Ensure the course ID is normalized before passing to parent
        if (selectedCourse.id && typeof selectedCourse.id === 'string') {
          selectedCourse.id = parseInt(selectedCourse.id, 10);
        }
        
        console.log("Selecting course with data:", selectedCourse);
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

  // Search for courses when query changes
  const handleSearchCourses = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Remove the second parameter that's causing the error
      const results = await searchForCourses(query);
      setSearchResults(results);
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
  }, [toast]);

  // Load user courses on component mount
  useEffect(() => {
    loadUserCourses();
  }, [loadUserCourses]);

  // Search when query changes
  useEffect(() => {
    handleSearchCourses(debouncedSearchQuery);
  }, [debouncedSearchQuery, handleSearchCourses]);

  // Auto-select course if ID is provided
  useEffect(() => {
    const selectCourseById = async () => {
      if (selectedCourseId && userCourses.length > 0) {
        // Normalize courseId to number for consistent comparison
        const normalizedSelectedId = typeof selectedCourseId === 'string' 
          ? parseInt(selectedCourseId, 10) 
          : selectedCourseId;
          
        // Find the course by normalized ID
        const course = userCourses.find(c => {
          const courseId = typeof c.id === 'string' ? parseInt(c.id, 10) : c.id;
          return courseId === normalizedSelectedId;
        });
        
        if (course) {
          // Convert to number if it's a string
          const courseId = typeof course.id === 'string' ? parseInt(course.id, 10) : course.id;
          console.log("Found course by ID:", { courseId, course });
          
          try {
            const courseWithTees = await getUserCourseTees(courseId);
            if (courseWithTees) {
              console.log("Setting selected course:", courseWithTees);
              setSearchQuery(courseWithTees.name);
              onSelectCourse(courseWithTees);
            }
          } catch (err) {
            console.error("Error loading course tees:", err);
          }
        }
      }
    };
    
    selectCourseById();
  }, [selectedCourseId, userCourses, onSelectCourse]);

  return (
    <Card className="p-4 mb-6 backdrop-blur-sm bg-white/80 border-0 shadow-lg">
      <div className="space-y-4">
        <SearchInput 
          searchQuery={searchQuery}
          isSearching={isSearching}
          handleSearchChange={handleSearchChange}
        />
        
        <SearchResults 
          searchQuery={debouncedSearchQuery}
          searchResults={searchResults}
          isSearching={isSearching}
          handleSelectCourse={handleSelectCourse}
        />
        
        <AddCourseButton onAddCourse={onAddCourse} />
      </div>
    </Card>
  );
};
