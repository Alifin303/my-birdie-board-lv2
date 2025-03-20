
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PenLine } from "lucide-react";
import { ManualCourseForm } from "@/components/ManualCourseForm";

interface CourseStatsTableProps {
  userRounds: any[];
  scoreType: 'gross' | 'net';
  calculateCourseStats: (rounds: any[], courseId: number, handicapIndex: number, scoreType: 'gross' | 'net') => any;
  onCourseClick: (courseId: number) => void;
  handicapIndex: number;
}

export function CourseStatsTable({
  userRounds,
  scoreType,
  calculateCourseStats,
  onCourseClick,
  handicapIndex
}: CourseStatsTableProps) {
  const [courseStats, setCourseStats] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  // Calculate stats for each course
  useEffect(() => {
    if (!userRounds || !userRounds.length) {
      setCourseStats([]);
      return;
    }

    const courseIds = [...new Set(userRounds.map(round => round.course_id))];
    const stats = courseIds.map(courseId => {
      const courseRounds = userRounds.filter(round => round.course_id === courseId);
      const courseName = courseRounds[0]?.courses?.name || "Unknown Course";
      const courseLocation = courseRounds[0]?.courses?.city && courseRounds[0]?.courses?.state 
        ? `${courseRounds[0].courses.city}, ${courseRounds[0].courses.state}` 
        : courseRounds[0]?.courses?.city || courseRounds[0]?.courses?.state || "";
      
      const stats = calculateCourseStats(courseRounds, courseId, handicapIndex, scoreType);
      
      return {
        id: courseId,
        name: courseName,
        location: courseLocation,
        clubName: courseRounds[0]?.courses?.clubName || "Unknown Club",
        courseName: courseRounds[0]?.courses?.courseName || "Unknown Course",
        roundsPlayed: stats.roundsPlayed,
        averageScore: stats.averageScore,
        bestScore: stats.bestScore,
        toPar: stats.toPar,
        lastRound: stats.lastRound,
        trending: stats.trending
      };
    });

    setCourseStats(stats);
  }, [userRounds, scoreType, calculateCourseStats, handicapIndex]);

  if (!courseStats.length) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No rounds recorded yet. Add your first round to see course statistics.
      </div>
    );
  }

  const handleEditCourse = (e: React.MouseEvent, course: any) => {
    e.stopPropagation();
    setSelectedCourse({
      id: course.id,
      name: course.name,
      city: course.location.split(', ')[0] || '',
      state: course.location.split(', ')[1] || '',
    });
    setIsFormOpen(true);
  };

  const handleCourseCreated = (courseId: number, name: string) => {
    console.log("Course updated:", courseId, name);
    // The user rounds will be refreshed when the dashboard component data is invalidated
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-2 font-medium">Course</th>
              <th className="pb-2 font-medium text-center">Rounds</th>
              <th className="pb-2 font-medium text-center">Avg. Score</th>
              <th className="pb-2 font-medium text-center">Best</th>
              <th className="pb-2 font-medium text-center">Last</th>
              <th className="pb-2 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courseStats.map((course) => (
              <tr 
                key={course.id} 
                className="hover:bg-muted/50 cursor-pointer border-b"
                onClick={() => onCourseClick(course.id)}
              >
                <td className="py-3">
                  <div className="font-medium">{course.clubName}</div>
                  <div className="text-muted-foreground text-xs">{course.courseName}</div>
                  {course.location && (
                    <div className="text-muted-foreground text-xs">{course.location}</div>
                  )}
                </td>
                <td className="py-3 text-center">{course.roundsPlayed}</td>
                <td className="py-3 text-center">{course.averageScore}</td>
                <td className="py-3 text-center">{course.bestScore}</td>
                <td className="py-3 text-center">{course.lastRound}</td>
                <td className="py-3 text-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={(e) => handleEditCourse(e, course)}
                  >
                    <PenLine className="h-4 w-4" />
                    <span className="sr-only">Edit Course</span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ManualCourseForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onCourseCreated={handleCourseCreated}
        existingCourse={selectedCourse}
      />
    </>
  );
}
