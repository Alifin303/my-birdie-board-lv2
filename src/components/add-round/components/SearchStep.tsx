import React from "react";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Loader2 } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { SimplifiedGolfCourse } from "../types";

export interface SearchStepProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (query: string) => Promise<void>;
  handleCourseSelect: (course: SimplifiedGolfCourse) => Promise<void>;
  handleOpenManualCourseForm: () => void;
  manualCourseFormRef: React.RefObject<{ setExistingCourse: (course: any) => void }>;
  searchResults: SimplifiedGolfCourse[];
  isLoading: boolean;
  searchError: string | null;
  noResults: boolean;
  setManualCourseOpen: (open: boolean) => void;
  handleCloseModal: () => void;
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
  setManualCourseOpen,
  handleCloseModal
}) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Add New Round</DialogTitle>
        <DialogDescription>Search for a course or add one manually.</DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Input
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="col-span-3"
            placeholder="Search for a course..."
          />
          <Button onClick={() => handleSearch(searchQuery)} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search
              </>
            )}
          </Button>
        </div>
      </div>

      {searchError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <h3 className="mb-2 font-medium">Error</h3>
          <p>{searchError}</p>
        </div>
      )}

      {noResults && !isLoading && (
        <div className="rounded-md border border-warning/50 bg-warning/10 p-4 text-warning">
          <h3 className="mb-2 font-medium">No results</h3>
          <p>No courses found for your search query. Please try a different search or add the course manually.</p>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Course Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>State</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searchResults.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium pl-4">{course.name}</TableCell>
                  <TableCell>{course.city}</TableCell>
                  <TableCell>{course.state}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => handleCourseSelect(course)}>
                      Select
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="secondary" onClick={handleCloseModal}>
          Cancel
        </Button>
        <Button type="button" onClick={() => {
          handleOpenManualCourseForm();
          setManualCourseOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Course Manually
        </Button>
      </DialogFooter>
    </>
  );
};
