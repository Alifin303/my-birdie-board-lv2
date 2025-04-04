
import React from 'react';
import { GolfCourse } from '@/services/golfCourseApi';
import { parseCourseName } from '@/integrations/supabase/client';

interface SearchResultsProps {
  searchQuery: string;
  searchResults: GolfCourse[];
  isSearching: boolean;
  handleSelectCourse: (course: GolfCourse) => void;
}

export const SearchResults = ({ 
  searchQuery, 
  searchResults, 
  isSearching, 
  handleSelectCourse 
}: SearchResultsProps) => {
  if (!searchQuery) return null;
  
  if (!isSearching && searchResults.length === 0) {
    return (
      <div className="p-2 text-center text-gray-500">
        No courses found. Try a different search or add your course manually.
      </div>
    );
  }
  
  if (searchResults.length > 0) {
    return (
      <div className="max-h-60 overflow-y-auto border rounded-md bg-white shadow-sm">
        {searchResults.map((course, index) => {
          // Ensure course ID is properly logged before attempting to select
          console.log(`Course ${index}:`, { 
            id: course.id, 
            name: course.name, 
            isUserAdded: course.isUserAdded 
          });
          
          return (
            <div 
              key={`${course.id}-${index}`}
              className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
              onClick={() => {
                console.log("Clicking on course:", { 
                  id: course.id, 
                  type: typeof course.id,
                  name: course.name
                });
                handleSelectCourse(course);
              }}
            >
              <div className="font-medium">{course.isUserAdded 
                ? parseCourseName(course.name || '').clubName 
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
          );
        })}
      </div>
    );
  }
  
  return null;
};
