
import { useMemo } from "react";
import { CourseStats, Round } from "./types";

interface CourseStatsTableProps {
  userRounds: Round[] | undefined;
  scoreType: 'gross' | 'net';
  calculateCourseStats: (rounds: Round[]) => CourseStats[];
  onCourseClick: (courseId: number) => void;
  handicapIndex: number;
}

export const CourseStatsTable = ({ 
  userRounds, 
  scoreType, 
  calculateCourseStats, 
  onCourseClick,
  handicapIndex 
}: CourseStatsTableProps) => {
  const courseStats = useMemo(() => {
    if (!userRounds || userRounds.length === 0) return [];
    return calculateCourseStats(userRounds);
  }, [userRounds, calculateCourseStats]);

  if (!userRounds || userRounds.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md border-white/20 rounded-lg p-6 text-center text-white">
        <p>You haven't played any rounds yet. Add a round to see your stats.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-white/20 bg-white/10 backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-white/20">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-white/80">Course</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase text-white/80">Rounds</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase text-white/80">
                Best {scoreType === 'gross' ? 'Gross' : 'Net'}
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase text-white/80">
                To Par {scoreType === 'gross' ? '' : '(Net)'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {courseStats.map((course) => (
              <tr 
                key={course.courseId} 
                className="hover:bg-white/20 cursor-pointer transition-colors"
                onClick={() => onCourseClick(course.courseId)}
              >
                <td className="px-4 py-3 text-sm text-white">
                  <div>
                    <p className="font-medium">{course.clubName}</p>
                    <p className="text-white/80 text-xs">{course.courseName}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-center text-white">{course.roundsPlayed}</td>
                <td className="px-4 py-3 text-sm text-center text-white">
                  {scoreType === 'gross' ? 
                    course.bestGrossScore : 
                    (course.bestNetScore !== null ? course.bestNetScore : Math.max(0, course.bestGrossScore - handicapIndex))}
                </td>
                <td className="px-4 py-3 text-sm text-center text-white">
                  {scoreType === 'gross' ? 
                    (course.bestToPar > 0 ? '+' : '') + course.bestToPar : 
                    (course.bestToParNet !== null ? 
                      (course.bestToParNet > 0 ? '+' : '') + course.bestToParNet : 
                      (course.bestToPar - handicapIndex > 0 ? '+' : '') + (course.bestToPar - handicapIndex))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
