import { useState, useMemo } from "react";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CourseLeaderboard } from "./CourseLeaderboard";
import { parseCourseName } from "@/integrations/supabase/client";

interface Round {
  id: number;
  courses?: {
    id: number;
    name: string;
    clubName?: string;
    courseName?: string;
  };
}

interface LeaderboardBannerProps {
  userRounds: Round[] | undefined;
  handicapIndex: number;
}

export const LeaderboardBanner = ({ userRounds, handicapIndex }: LeaderboardBannerProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  const uniqueCourses = useMemo(() => {
    if (!userRounds) return [];
    const courseMap = new Map<number, { id: number; displayName: string }>();
    userRounds.forEach(round => {
      if (round.courses && !courseMap.has(round.courses.id)) {
        const clubName = round.courses.clubName || "Unknown Club";
        const courseName = round.courses.courseName || "Unknown Course";
        const displayName = clubName !== courseName
          ? `${clubName} - ${courseName}`
          : courseName;
        courseMap.set(round.courses.id, { id: round.courses.id, displayName });
      }
    });
    return Array.from(courseMap.values()).sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [userRounds]);

  const selectedCourseName = useMemo(() => {
    return uniqueCourses.find(c => c.id === selectedCourseId)?.displayName || "";
  }, [selectedCourseId, uniqueCourses]);

  const handleCourseSelect = (value: string) => {
    const courseId = parseInt(value);
    setSelectedCourseId(courseId);
  };

  const handleViewLeaderboard = () => {
    if (selectedCourseId) {
      setDialogOpen(false);
      setLeaderboardOpen(true);
    }
  };

  const handleOpenDialog = () => {
    setSelectedCourseId(null);
    setDialogOpen(true);
  };

  if (!uniqueCourses.length) return null;

  return (
    <>
      <div className="bg-white/90 rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm sm:text-base text-foreground font-medium">
            Want to see how your scores compare to other golfers?
          </p>
          <Button onClick={handleOpenDialog} className="whitespace-nowrap">
            <Trophy className="h-4 w-4 mr-2" />
            View Course Leaderboards
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Course Leaderboards</DialogTitle>
            <DialogDescription>
              Select a course to view the leaderboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Select onValueChange={handleCourseSelect} value={selectedCourseId?.toString() || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent className="z-[9999] bg-popover">
                {uniqueCourses.map(course => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleViewLeaderboard}
              disabled={!selectedCourseId}
              className="w-full"
            >
              <Trophy className="h-4 w-4 mr-2" />
              View Leaderboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {selectedCourseId && (
        <CourseLeaderboard
          courseId={selectedCourseId}
          courseName={selectedCourseName}
          open={leaderboardOpen}
          onOpenChange={setLeaderboardOpen}
          handicapIndex={handicapIndex}
        />
      )}
    </>
  );
};
