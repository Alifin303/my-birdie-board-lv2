import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { SearchInput } from "@/components/course-selector/SearchInput";
import { searchForCourses } from "@/components/course-selector/CourseDataService";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { GolfCourse } from "@/services/golfCourseApi";
import { courseDisplayName } from "@/lib/course-seo";
import { useBucketList } from "@/hooks/use-bucket-list";

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
  const [results, setResults] = useState<GolfCourse[]>([]);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const debouncedQuery = useDebounce(searchQuery, 500);
  const { toast } = useToast();
  const { addCourse } = useBucketList();

  const runSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      setResults(await searchForCourses(query));
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
    runSearch(debouncedQuery);
  }, [debouncedQuery, runSearch]);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setResults([]);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a course to your bucket list</DialogTitle>
          <DialogDescription>
            Search for a course you'd love to play. Your bucket list is private to you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <SearchInput
            searchQuery={searchQuery}
            isSearching={isSearching}
            handleSearchChange={(e) => setSearchQuery(e.target.value)}
          />

          {debouncedQuery && !isSearching && results.length === 0 && (
            <p className="text-sm text-muted-foreground py-2 text-center">
              No courses found. Try a different search.
            </p>
          )}

          {results.length > 0 && (
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
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    Add to Bucket List
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
