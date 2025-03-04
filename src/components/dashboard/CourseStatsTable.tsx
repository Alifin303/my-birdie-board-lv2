
import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { CourseStats, Round } from "./types";

interface CourseStatsTableProps {
  userRounds: Round[] | undefined;
  scoreType: 'gross' | 'net';
  calculateCourseStats: (rounds: Round[]) => CourseStats[];
  onCourseClick: (courseId: number) => void;
  handicapIndex?: number;
}

export const CourseStatsTable = ({ 
  userRounds, 
  scoreType, 
  calculateCourseStats, 
  onCourseClick,
  handicapIndex = 0
}: CourseStatsTableProps) => {
  const [sortField, setSortField] = useState<keyof CourseStats>('courseName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  if (!userRounds || userRounds.length === 0) {
    return (
      <div className="text-center p-6 bg-muted rounded-lg">
        <p className="text-lg">You haven't added any rounds yet.</p>
        <p className="text-muted-foreground">Click "Add a New Round" to get started!</p>
      </div>
    );
  }

  const courseStats = calculateCourseStats(userRounds);
  
  // Log course stats with net scores for debugging
  console.log("Course stats before sorting:", courseStats.map(course => ({
    courseName: course.courseName,
    bestGrossScore: course.bestGrossScore,
    bestNetScore: handicapIndex > 0 
      ? Math.max(0, Math.round(course.bestGrossScore - handicapIndex))
      : course.bestGrossScore,
    bestToPar: course.bestToPar,
    bestToParNet: handicapIndex > 0
      ? course.bestToPar - handicapIndex
      : course.bestToPar
  })));
  
  // Sort course stats
  const sortedCourseStats = [...courseStats].sort((a, b) => {
    let aValue;
    let bValue;
    
    // Determine which value to use based on sort field and score type
    if (sortField === 'bestGrossScore' && scoreType === 'net') {
      // For net scores, calculate them from gross scores
      aValue = handicapIndex > 0 
        ? Math.max(0, Math.round(a.bestGrossScore - handicapIndex)) 
        : a.bestGrossScore;
      bValue = handicapIndex > 0 
        ? Math.max(0, Math.round(b.bestGrossScore - handicapIndex))
        : b.bestGrossScore;
    } else if (sortField === 'bestToPar' && scoreType === 'net') {
      // For net to par, calculate it from gross to par
      aValue = handicapIndex > 0 
        ? a.bestToPar - handicapIndex
        : a.bestToPar;
      bValue = handicapIndex > 0
        ? b.bestToPar - handicapIndex
        : b.bestToPar;
    } else {
      // For all other fields, use the field directly
      aValue = a[sortField];
      bValue = b[sortField];
    }
    
    if (aValue === null) return 1;
    if (bValue === null) return -1;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    // For numerical values (including to par scores)
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });
  
  console.log("Course stats after sorting:", sortedCourseStats.map(course => ({
    courseName: course.courseName,
    bestToPar: course.bestToPar,
    bestToParNet: handicapIndex > 0
      ? course.bestToPar - handicapIndex
      : course.bestToPar,
    sortField,
    sortDirection
  })));

  const handleSort = (field: keyof CourseStats) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Helper function to render sort indicator
  const renderSortIndicator = (field: keyof CourseStats) => {
    if (sortField !== field) {
      return <span className="text-muted-foreground opacity-50 ml-1">↕️</span>;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="inline-block h-4 w-4 ml-1" /> 
      : <ChevronDown className="inline-block h-4 w-4 ml-1" />;
  };

  return (
    <div className="overflow-x-auto rounded-lg border bg-background">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              <button
                onClick={() => handleSort('courseName')}
                className="flex items-center cursor-pointer hover:text-primary transition-colors"
              >
                <span>Course</span>
                {renderSortIndicator('courseName')}
              </button>
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              <button
                onClick={() => handleSort('roundsPlayed')}
                className="flex items-center cursor-pointer hover:text-primary transition-colors"
              >
                <span>Rounds Played</span>
                {renderSortIndicator('roundsPlayed')}
              </button>
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              <button
                onClick={() => handleSort(scoreType === 'gross' ? 'bestGrossScore' : 'bestNetScore')}
                className="flex items-center cursor-pointer hover:text-primary transition-colors"
              >
                <span>Best Score</span>
                {renderSortIndicator(scoreType === 'gross' ? 'bestGrossScore' : 'bestNetScore')}
              </button>
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              <button
                onClick={() => handleSort(scoreType === 'gross' ? 'bestToPar' : 'bestToParNet')}
                className="flex items-center cursor-pointer hover:text-primary transition-colors"
              >
                <span>Best to Par</span>
                {renderSortIndicator(scoreType === 'gross' ? 'bestToPar' : 'bestToParNet')}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedCourseStats.map((courseStat) => {
            // Calculate net score from gross, accounting for handicap
            const netScore = handicapIndex > 0 
              ? Math.max(0, Math.round(courseStat.bestGrossScore - handicapIndex))
              : courseStat.bestGrossScore;
            
            // Calculate net to par from gross to par, accounting for handicap
            const netToPar = handicapIndex > 0
              ? courseStat.bestToPar - handicapIndex
              : courseStat.bestToPar;
            
            return (
              <tr key={courseStat.courseId} className="border-b last:border-0">
                <td className="px-4 py-3 text-sm font-medium">
                  <button 
                    className="hover:underline text-primary"
                    onClick={() => onCourseClick(courseStat.courseId)}
                  >
                    {courseStat.clubName !== courseStat.courseName 
                      ? `${courseStat.clubName} - ${courseStat.courseName}`
                      : courseStat.courseName}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    {courseStat.city}{courseStat.state ? `, ${courseStat.state}` : ''}
                  </p>
                </td>
                <td className="px-4 py-3 text-sm">
                  {courseStat.roundsPlayed}
                </td>
                <td className="px-4 py-3 text-sm">
                  {scoreType === 'gross' 
                    ? courseStat.bestGrossScore 
                    : netScore}
                </td>
                <td className="px-4 py-3 text-sm">
                  {scoreType === 'gross' 
                    ? (courseStat.bestToPar > 0 ? '+' : '') + courseStat.bestToPar
                    : (netToPar > 0 ? '+' : '') + netToPar}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
