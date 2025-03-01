
import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { searchCourses, GolfCourse } from '@/services/golfCourseApi';

interface Course {
  id: number;
  name: string;
  city?: string;
  state?: string;
}

interface CourseSelectorProps {
  selectedCourse: Course | null;
  onCourseChange: (course: Course | null) => void;
  onAddMissingCourse?: () => void;
  onSearchUpdate?: (searchTerm: string, hasResults: boolean) => void;
  initialSearchTerm?: string;
}

export const CourseSelector: React.FC<CourseSelectorProps> = ({ 
  selectedCourse, 
  onCourseChange,
  onAddMissingCourse,
  onSearchUpdate,
  initialSearchTerm = ''
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [apiResults, setApiResults] = useState<GolfCourse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddMissingCourse, setShowAddMissingCourse] = useState(false);
  const [hasPerformedSearch, setHasPerformedSearch] = useState(false);

  useEffect(() => {
    if (searchTerm.length >= 3) {
      searchCoursesHandler();
    } else {
      setSearchResults([]);
      setApiResults([]);
      setShowAddMissingCourse(false);
      if (onSearchUpdate) {
        onSearchUpdate(searchTerm, true); // No search performed yet
      }
    }
  }, [searchTerm]);

  const searchCoursesHandler = async () => {
    setIsLoading(true);
    setShowAddMissingCourse(false);
    setHasPerformedSearch(true);
    
    try {
      // First, search our Supabase database
      const { data: dbCourses, error } = await supabase
        .from('courses')
        .select('id, name, city, state')
        .ilike('name', `%${searchTerm}%`)
        .limit(5);

      if (error) throw error;
      
      // Then, search the golf course API
      const { results } = await searchCourses(searchTerm);
      console.log("API search results:", results);
      
      // Combine results, preventing duplicates
      const dbCoursesMap = new Map();
      dbCourses?.forEach(course => {
        dbCoursesMap.set(course.name.toLowerCase(), course);
      });
      
      // Filter API results to remove any that are already in the database
      const filteredApiResults = results.filter(apiCourse => {
        // Fix: Get course name by checking different properties in GolfCourse type
        const courseName = apiCourse.club_name || apiCourse.course_name || "";
        return !dbCoursesMap.has(courseName.toLowerCase());
      });
      
      setSearchResults(dbCourses || []);
      setApiResults(filteredApiResults);
      
      // Show "Add Missing Course" button if no matches found
      const hasResults = (dbCourses?.length > 0 || filteredApiResults.length > 0);
      setShowAddMissingCourse(
        !hasResults && searchTerm.length >= 3
      );

      // Update parent component about search results
      if (onSearchUpdate) {
        onSearchUpdate(searchTerm, hasResults);
      }
    } catch (err) {
      console.error('Error searching courses:', err);
      setSearchResults([]);
      setApiResults([]);
      
      // Still show "Add Missing Course" if API fails
      setShowAddMissingCourse(searchTerm.length >= 3);
      
      // Update parent component about search results
      if (onSearchUpdate) {
        onSearchUpdate(searchTerm, false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCourse = (course: Course) => {
    onCourseChange(course);
    setSearchTerm('');
    setSearchResults([]);
    setApiResults([]);
    setShowAddMissingCourse(false);
    setHasPerformedSearch(false);
  };

  const handleSelectApiCourse = async (apiCourse: GolfCourse) => {
    try {
      // Extract course data from API result - Fix: Use correct properties
      const courseName = apiCourse.club_name || apiCourse.course_name || "Unknown Course";
      const city = apiCourse.location?.city || "";
      const state = apiCourse.location?.state || "";
      
      // Insert the course into our database
      const { data: newCourse, error } = await supabase
        .from('courses')
        .insert({
          name: courseName,
          city: city,
          state: state,
          api_course_id: apiCourse.id?.toString() || null
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Select the newly added course
      onCourseChange(newCourse);
      setSearchTerm('');
      setSearchResults([]);
      setApiResults([]);
      setShowAddMissingCourse(false);
      setHasPerformedSearch(false);
    } catch (err) {
      console.error('Error adding course from API:', err);
    }
  };

  const handleAddMissingCourse = () => {
    if (onAddMissingCourse) {
      onAddMissingCourse();
      return;
    }
    
    // Original fallback behavior if no handler is provided
    // Create a new course object with the search term as the name
    const newCourse = {
      id: -1, // Temporary ID that will be replaced on insert
      name: `${searchTerm} [User added course]`,
      city: "",
      state: ""
    };
    
    // Insert the user-added course into our database
    supabase
      .from('courses')
      .insert({
        name: newCourse.name,
        city: "",
        state: ""
      })
      .select()
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('Error adding missing course:', error);
          return;
        }
        
        // Select the newly added course
        onCourseChange(data);
        setSearchTerm('');
        setSearchResults([]);
        setApiResults([]);
        setShowAddMissingCourse(false);
        setHasPerformedSearch(false);
      });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value.length < 3) {
      setHasPerformedSearch(false);
    }
  };

  return (
    <div className="space-y-2">
      <Card className="p-4 mb-1 bg-white/80 border shadow">
        <div className="relative">
          {isLoading ? (
            <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent/60 w-4 h-4 animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent/60 w-4 h-4" />
          )}
          <Input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search for a golf course..."
            className="pl-10 border-accent/20 focus:border-accent/40"
          />
        </div>
      </Card>

      {/* Selected course display */}
      {selectedCourse && (
        <div className="p-3 bg-primary/10 rounded-md">
          <p className="font-medium">{selectedCourse.name}</p>
          <p className="text-sm text-muted-foreground">
            {selectedCourse.city}{selectedCourse.state ? `, ${selectedCourse.state}` : ''}
          </p>
        </div>
      )}

      {/* Database search results */}
      {searchResults.length > 0 && (
        <div className="absolute z-10 bg-white rounded-md shadow-lg max-h-60 overflow-y-auto w-full max-w-[450px]">
          {searchResults.length > 0 && (
            <div className="px-3 py-2 bg-muted/20 text-xs font-medium">
              Courses from Your Database
            </div>
          )}
          {searchResults.map((course) => (
            <div 
              key={course.id}
              className="p-3 hover:bg-accent/10 cursor-pointer border-b last:border-b-0"
              onClick={() => handleSelectCourse(course)}
            >
              <p className="font-medium">{course.name}</p>
              <p className="text-sm text-muted-foreground">
                {course.city}{course.state ? `, ${course.state}` : ''}
              </p>
            </div>
          ))}
          
          {/* API results */}
          {apiResults.length > 0 && (
            <>
              <div className="px-3 py-2 bg-muted/20 text-xs font-medium border-t">
                Courses from API
              </div>
              {apiResults.map((course, index) => (
                <div 
                  key={`api-${course.id || index}`}
                  className="p-3 hover:bg-accent/10 cursor-pointer border-b last:border-b-0"
                  onClick={() => handleSelectApiCourse(course)}
                >
                  <p className="font-medium">{course.club_name || course.course_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {course.location?.city}
                    {course.location?.state ? 
                      `, ${course.location?.state}` : ''}
                  </p>
                </div>
              ))}
            </>
          )}
        </div>
      )}
      
      {/* API results only (no database results) */}
      {searchResults.length === 0 && apiResults.length > 0 && (
        <div className="absolute z-10 bg-white rounded-md shadow-lg max-h-60 overflow-y-auto w-full max-w-[450px]">
          <div className="px-3 py-2 bg-muted/20 text-xs font-medium">
            Courses from API
          </div>
          {apiResults.map((course, index) => (
            <div 
              key={`api-${course.id || index}`}
              className="p-3 hover:bg-accent/10 cursor-pointer border-b last:border-b-0"
              onClick={() => handleSelectApiCourse(course)}
            >
              <p className="font-medium">{course.club_name || course.course_name}</p>
              <p className="text-sm text-muted-foreground">
                {course.location?.city}
                {course.location?.state ? 
                  `, ${course.location?.state}` : ''}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add Missing Course button - Make sure it's always visible even when no results found */}
      {showAddMissingCourse && (
        <div className="mt-2">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
            onClick={handleAddMissingCourse}
          >
            <Plus className="h-4 w-4" />
            Can't find your course? Add it now: {searchTerm}
          </Button>
        </div>
      )}

      {/* Always show the "Add Missing Course" button when searching with no results */}
      {!showAddMissingCourse && hasPerformedSearch && searchTerm.length >= 3 && 
       searchResults.length === 0 && apiResults.length === 0 && !isLoading && (
        <div className="mt-2">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
            onClick={onAddMissingCourse || handleAddMissingCourse}
          >
            <Plus className="h-4 w-4" />
            Can't find your course? Add it now
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="p-2 text-center text-sm text-muted-foreground">
          Searching courses...
        </div>
      )}

      {searchTerm.length > 0 && searchTerm.length < 3 && (
        <div className="p-2 text-center text-sm text-muted-foreground">
          Enter at least 3 characters to search
        </div>
      )}
    </div>
  );
};
