
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
      
      if (course.isUserAdded) {
        // This is a user-added course, get the tees from localStorage
        // Convert the id to a number if it's a string
        const courseId = typeof course.id === 'string' ? parseInt(course.id, 10) : course.id;
        selectedCourse = await getUserCourseTees(courseId);
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
        const course = userCourses.find(c => c.id === selectedCourseId);
        if (course) {
          // Convert to number if it's a string
          const courseId = typeof course.id === 'string' ? parseInt(course.id, 10) : course.id;
          const courseWithTees = await getUserCourseTees(courseId);
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
