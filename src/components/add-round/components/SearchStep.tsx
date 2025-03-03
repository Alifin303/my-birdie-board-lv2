
import React, { useState, KeyboardEvent } from "react";
import { 
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, PlusCircle, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SimplifiedGolfCourse } from "../types";

interface SearchStepProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => Promise<void>;
  handleCourseSelect: (course: SimplifiedGolfCourse) => Promise<void>;
  handleOpenManualCourseForm: () => void;
  manualCourseFormRef: React.RefObject<any>;
  searchResults: SimplifiedGolfCourse[];
  isLoading: boolean;
  searchError: string | null;
  noResults: boolean;
  setManualCourseOpen: (open: boolean) => void;
}

export const SearchStep: React.FC<SearchStepProps> = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  handleCourseSelect,
  handleOpenManualCourseForm,
  manualCourseFormRef,
  searchResults,
  isLoading,
  searchError,
  noResults,
  setManualCourseOpen
}) => {
  // Handle key press event for the search input
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.length >= 3 && !isLoading) {
      e.preventDefault();
      handleSearch();
    }
  };
  
  return (
    <>
      <DialogHeader>
        <DialogTitle>Add a New Round</DialogTitle>
        <DialogDescription>
          Search for a golf course or add a new one
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <div className="relative rounded-md bg-background shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Search for a course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Enter a course name or location and press Enter to search
          </p>
        </div>
        
        <div className="flex justify-center">
          <Button
            onClick={() => handleSearch()}
            disabled={isLoading || searchQuery.length < 3}
            className="w-full md:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </Button>
        </div>
        
        <div className="mt-2 mb-4 text-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleOpenManualCourseForm}
            className="w-full"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Can&apos;t find your course? Add it now
          </Button>
        </div>
        
        {searchError && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 text-center">
            <p className="text-sm text-destructive">{searchError}</p>
          </div>
        )}
        
        {noResults && (
          <div className="bg-muted/50 rounded-md p-4 text-center">
            <p className="text-sm text-muted-foreground">No courses found matching your search.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenManualCourseForm}
              className="mt-2"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Your Course
            </Button>
          </div>
        )}
        
        {searchResults.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-2">Search Results</h3>
            <div className="border rounded-md divide-y">
              {searchResults.map((course) => (
                <div 
                  key={course.id.toString()}
                  className="flex justify-between items-center px-4 py-3 hover:bg-muted cursor-pointer"
                  onClick={() => handleCourseSelect(course)}
                >
                  <div>
                    <p className="font-medium">
                      {course.clubName !== course.name 
                        ? `${course.clubName} - ${course.name}`
                        : course.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {course.city}{course.state ? `, ${course.state}` : ''}
                      {course.isUserAdded && <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">User Added</span>}
                    </p>
                  </div>
                  
                  {course.isUserAdded && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setManualCourseOpen(true);
                        
                        // Pass the existing course data to the manual course form
                        const existingCourse = {
                          id: course.id,
                          name: course.name,
                          city: course.city || '',
                          state: course.state || ''
                        };
                        
                        // Set a timeout to ensure the form is fully mounted
                        setTimeout(() => {
                          setManualCourseOpen(true);
                          // Pass the existing course data to the form ref
                          if (manualCourseFormRef.current) {
                            manualCourseFormRef.current.setExistingCourse(existingCourse);
                          } else {
                            console.error("Manual course form ref not available");
                          }
                        }, 10);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
