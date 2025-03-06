
import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { CourseStats, Round } from "./types";

interface CourseStatsTableProps {
  userRounds: Round[] | undefined;
  scoreType: 'gross' | 'net';
  calculateCourseStats: (rounds: Round[], handicapIndex?: number) => CourseStats[];
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
  const [sortField, setSortField] = useState<keyof CourseStats>('courseName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [sortedStats, setSortedStats] = useState<CourseStats[]>([]);

  useEffect(() => {
    if (!userRounds || userRounds.length === 0) return;
    
    // Pass the handicap index to ensure consistency with other components
    const courseStats = calculateCourseStats(userRounds, handicapIndex);
    
    // Log courses with their scores for debugging
    console.log("[CourseStatsTable] Courses with scores before sorting:", courseStats.map(course => ({
      id: course.courseId,
      name: course.courseName,
      club: course.clubName,
      bestGross: course.bestGrossScore,
      bestToPar: course.bestToPar,
      bestNetScore: course.bestNetScore,
      bestToParNet: course.bestToParNet,
      handicapUsed: handicapIndex
    })));
    
    // Sort based on the field and using the appropriate scores
    const sorted = [...courseStats].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      // Use the correct field based on score type
      if (sortField === 'bestGrossScore' && scoreType === 'net') {
        aValue = a.bestNetScore !== null ? a.bestNetScore : Number.MAX_SAFE_INTEGER;
        bValue = b.bestNetScore !== null ? b.bestNetScore : Number.MAX_SAFE_INTEGER;
      } 
      else if (sortField === 'bestToPar' && scoreType === 'net') {
        aValue = a.bestToParNet !== null ? a.bestToParNet : Number.MAX_SAFE_INTEGER;
        bValue = b.bestToParNet !== null ? b.bestToParNet : Number.MAX_SAFE_INTEGER;
      }
      else {
        aValue = a[sortField];
        bValue = b[sortField];
      }
      
      // Handle null values
      if (aValue === null) return 1;
      if (bValue === null) return -1;
      
      // Sort strings and numbers accordingly
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // For numerical values (including to par scores)
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
    
    // Log the sorted results
    console.log("[CourseStatsTable] Courses after sorting:", sorted.map(course => ({
      name: course.courseName,
      club: course.clubName,
      field: sortField,
      direction: sortDirection,
      value: sortField === 'bestToPar' && scoreType === 'net' 
        ? course.bestToParNet 
        : (sortField === 'bestGrossScore' && scoreType === 'net'
            ? course.bestNetScore
            : course[sortField])
    })));
    
    setSortedStats(sorted);
  }, [userRounds, sortField, sortDirection, scoreType, handicapIndex, calculateCourseStats]);

  if (!userRounds || userRounds.length === 0) {
    return (
      <div className="text-center p-6 bg-muted rounded-lg">
        <p className="text-lg">You haven't added any rounds yet.</p>
        <p className="text-muted-foreground">Click "Add a New Round" to get started!</p>
      </div>
    );
  }

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
                onClick={() => handleSort('bestGrossScore')}
                className="flex items-center cursor-pointer hover:text-primary transition-colors"
              >
                <span>Best Score</span>
                {renderSortIndicator('bestGrossScore')}
              </button>
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              <button
                onClick={() => handleSort('bestToPar')}
                className="flex items-center cursor-pointer hover:text-primary transition-colors"
              >
                <span>Best to Par</span>
                {renderSortIndicator('bestToPar')}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedStats.map((courseStat) => (
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
                  : courseStat.bestNetScore}
              </td>
              <td className="px-4 py-3 text-sm">
                {scoreType === 'gross' 
                  ? (courseStat.bestToPar > 0 ? '+' : '') + courseStat.bestToPar
                  : courseStat.bestToParNet !== null 
                    ? (courseStat.bestToParNet > 0 ? '+' : '') + courseStat.bestToParNet
                    : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
