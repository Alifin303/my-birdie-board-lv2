import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Round } from "./types";

interface CourseStatsTableProps {
  userRounds: Round[] | undefined;
  scoreType: 'gross' | 'net';
  calculateCourseStats: any;
  onCourseClick: (courseId: number) => void;
  handicapIndex: number;
  isDemo?: boolean;
}

export const CourseStatsTable = ({ 
  userRounds, 
  scoreType, 
  calculateCourseStats, 
  onCourseClick, 
  handicapIndex,
  isDemo = false 
}: CourseStatsTableProps) => {
  if (!userRounds || userRounds.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {isDemo ? 'Demo data loading...' : 'No rounds recorded yet. Add your first round to get started!'}
      </div>
    );
  }

  const courseGroups = Object.entries(
    userRounds.reduce((acc: { [key: number]: Round[] }, round) => {
      if (round.courses && round.courses.id) {
        const courseId = round.courses.id;
        acc[courseId] = acc[courseId] || [];
        acc[courseId].push(round);
      }
      return acc;
    }, {})
  );

  const formatToPar = (value: number) => {
    if (value === 0) return 'E';
    return (value > 0 ? '+' : '') + value;
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-muted">
              <th className="text-left py-3 px-2 font-semibold text-sm">Course</th>
              <th className="text-center py-3 px-2 font-semibold text-sm">Rounds</th>
              <th className="text-center py-3 px-2 font-semibold text-sm">Avg Score</th>
              <th className="text-center py-3 px-2 font-semibold text-sm">Best Score</th>
              <th className="text-center py-3 px-2 font-semibold text-sm">Best to Par</th>
              <th className="text-center py-3 px-2 font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courseGroups.map(([courseId, rounds]) => {
              const stats = calculateCourseStats(rounds, handicapIndex);
              const course = rounds[0].courses;
              
              return (
                <tr key={courseId} className="border-b border-muted/50 hover:bg-muted/20">
                  <td className="py-4 px-2">
                    <div>
                      <div className="font-medium text-sm">
                        {course?.clubName || 'Unknown Club'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {course?.courseName || 'Unknown Course'}
                      </div>
                      {course?.city && course?.state && (
                        <div className="text-xs text-muted-foreground">
                          {course.city}, {course.state}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="text-center py-4 px-2 text-sm font-medium">
                    {stats.roundsPlayed}
                  </td>
                  <td className="text-center py-4 px-2 text-sm font-medium">
                    {scoreType === 'gross' ? stats.avgGrossScore : stats.avgNetScore}
                  </td>
                  <td className="text-center py-4 px-2 text-sm font-medium">
                    {scoreType === 'gross' ? stats.bestGrossScore : stats.bestNetScore}
                  </td>
                  <td className="text-center py-4 px-2 text-sm font-medium">
                    {formatToPar(scoreType === 'gross' ? stats.bestToPar : stats.bestToParNet)}
                  </td>
                  <td className="text-center py-4 px-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCourseClick(Number(courseId))}
                      className="text-xs"
                    >
                      {isDemo ? 'View Demo' : 'View Details'}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {!isDemo && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-3">
            Want to see how you stack up against other golfers?
          </p>
          <Button variant="outline" className="gap-2">
            <Trophy className="h-4 w-4" />
            View Course Leaderboards
          </Button>
        </div>
      )}
    </div>
  );
};
