
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
  
  // Sort course stats
  const sortedCourseStats = [...courseStats].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === null) return 1;
    if (bValue === null) return -1;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    // @ts-ignore - we know these are numbers at this point
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

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
          {sortedCourseStats.map((courseStat) => (
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
                  : handicapIndex > 0 
                    ? Math.max(0, Math.round(courseStat.bestGrossScore - handicapIndex))
                    : courseStat.bestGrossScore}
              </td>
              <td className="px-4 py-3 text-sm">
                {scoreType === 'gross' 
                  ? (courseStat.bestToPar > 0 ? '+' : '') + courseStat.bestToPar
                  : handicapIndex > 0
                    ? ((courseStat.bestToPar - handicapIndex > 0 ? '+' : '') + 
                      (courseStat.bestToPar - handicapIndex))
                    : (courseStat.bestToPar > 0 ? '+' : '') + courseStat.bestToPar}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
