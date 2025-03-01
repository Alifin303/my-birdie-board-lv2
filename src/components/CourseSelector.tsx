
import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Course {
  id: number;
  name: string;
  city?: string;
  state?: string;
}

interface CourseSelectorProps {
  selectedCourse: Course | null;
  onCourseChange: (course: Course | null) => void;
}

export const CourseSelector: React.FC<CourseSelectorProps> = ({ 
  selectedCourse, 
  onCourseChange 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchTerm.length >= 3) {
      searchCourses();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const searchCourses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, city, state')
        .ilike('name', `%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (err) {
      console.error('Error searching courses:', err);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCourse = (course: Course) => {
    onCourseChange(course);
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <div className="space-y-2">
      <Card className="p-4 mb-1 bg-white/80 border shadow">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent/60 w-4 h-4" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="absolute z-10 bg-white rounded-md shadow-lg max-h-60 overflow-y-auto w-full max-w-[450px]">
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
        </div>
      )}

      {isLoading && (
        <div className="p-2 text-center text-sm text-muted-foreground">
          Searching courses...
        </div>
      )}

      {searchTerm.length >= 3 && searchResults.length === 0 && !isLoading && (
        <div className="p-2 text-center text-sm text-muted-foreground">
          No courses found. Try a different search.
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
