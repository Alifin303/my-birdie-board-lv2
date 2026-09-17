import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, PlusCircle } from "lucide-react";
import { searchForCourses } from "@/components/course-selector/CourseDataService";
import { useToast } from "@/hooks/use-toast";
import { GolfCourse } from "@/services/golfCourseApi";
import { courseDisplayName } from "@/lib/course-seo";
import { useBucketList } from "@/hooks/use-bucket-list";
import { ManualCourseForm } from "@/components/ManualCourseForm";

interface AddToBucketListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function resultName(course: GolfCourse) {
  const raw =
    course.name ||
    [course.club_name, course.course_name].filter(Boolean).join(" - ") ||
    "Unknown course";
  return courseDisplayName(raw);
}

export function AddToBucketListDialog({ open, onOpenChange }: AddToBucketListDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<GolfCourse[]>([]);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [manualCourseOpen, setManualCourseOpen] = useState(false);
  const { toast } = useToast();
  const { addCourse } = useBucketList();

  const runSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setIsSearching(true);
    try {
      setResults(await searchForCourses(query));
      setSearched(true);
    } catch (e) {
      console.error("Bucket list search failed", e);
      toast({
        title: "Search error",
        description: "Couldn't search for courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setResults([]);
      setSearched(false);
      setManualCourseOpen(false);
    }
  }, [open]);

  const handleAdd = async (course: GolfCourse) => {
    setPendingId(String(course.id));
    try {
      await addCourse.mutateAsync(course);
      toast({
        title: "Added to your bucket list",
        description: `${resultName(course)} is on your list.`,
      });
      onOpenChange(false);
    } catch (e: any) {
      toast({
        title: "Couldn't add that course",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setPendingId(null);
    }
  };

  const handleManualCourseCreated = async (courseId: number, courseName: string) => {
    setManualCourseOpen(false);
    setPendingId(String(courseId));
    try {
      await addCourse.mutateAsync({
        id: courseId,
        name: courseName,
        isApiCourse: false,
      } as unknown as GolfCourse);
      toast({
        title: "Added to your bucket list",
        description: `${courseDisplayName(courseName)} is on your list.`,
      });
      onOpenChange(false);
    } catch (e: any) {
      toast({
        title: "Couldn't add that course",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setPendingId(null);
    }
  };

  const noResults = searched && !isSearching && results.length === 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add a course to your bucket list</DialogTitle>
            <DialogDescription>
              Search for a course you'd love to play. Your bucket list is private to you.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.length >= 3 && !isSearching) {
                      e.preventDefault();
                      runSearch(searchQuery);
                    }
                  }}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">Enter a course name and press Enter to search</p>
            </div>

            <Button
              onClick={() => runSearch(searchQuery)}
              disabled={isSearching || searchQuery.length < 3}
              className="w-full"
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setManualCourseOpen(true)}
              className="w-full text-xs sm:text-sm"
            >
              <PlusCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Can&apos;t find your course? Add it now
            </Button>

            {noResults && (
              <div className="bg-muted/50 rounded-md p-4 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">No courses found matching your search. Add it now and it'll go straight on your bucket list!</p>
                <Button variant="outline" size="sm" onClick={() => setManualCourseOpen(true)} className="mt-2 text-xs sm:text-sm">
                  <PlusCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Add Your Course
                </Button>
              </div>
            )}

            {results.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-medium mb-2">Search Results</h3>
                <div className="max-h-72 overflow-y-auto rounded-md border divide-y">
                  {results.map((course, index) => (
                    <div
                      key={`${course.id}-${index}`}
                      className="flex items-center justify-between gap-3 p-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{resultName(course)}</p>
                        {(course.city || course.location?.city || course.state || course.location?.state) && (
                          <p className="text-xs text-muted-foreground truncate">
                            {[course.city || course.location?.city, course.state || course.location?.state]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 gap-1.5"
                        disabled={pendingId === String(course.id)}
                        onClick={() => handleAdd(course)}
                      >
                        {pendingId === String(course.id) ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <PlusCircle className="h-3.5 w-3.5" />
                        )}
                        Add to Bucket List
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ManualCourseForm
        open={manualCourseOpen}
        onOpenChange={setManualCourseOpen}
        onCourseCreated={handleManualCourseCreated}
      />
    </>
  );
}
