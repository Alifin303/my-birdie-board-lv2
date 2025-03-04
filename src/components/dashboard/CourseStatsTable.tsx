
import { useState, useEffect } from "react";
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
  const [sortedStats, setSortedStats] = useState<CourseStats[]>([]);

  useEffect(() => {
    if (!userRounds || userRounds.length === 0) return;
    
    // Calculate and sort stats whenever userRounds, sortField, sortDirection, or scoreType changes
    const courseStats = calculateCourseStats(userRounds);
    
    // Log courses with their scores for debugging
    console.log("Courses with scores before sorting:", courseStats.map(course => ({
      id: course.courseId,
      name: course.courseName,
      bestGross: course.bestGrossScore,
      bestToPar: course.bestToPar,
      netScore: handicapIndex > 0 ? Math.round(course.bestGrossScore - handicapIndex) : course.bestGrossScore,
      netToPar: handicapIndex > 0 ? Math.round(course.bestToPar - handicapIndex) : course.bestToPar
    })));
    
    // Sort course stats
    const sorted = [...courseStats].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      // Handle special cases for net scores
      if (sortField === 'bestGrossScore' && scoreType === 'net') {
        // For net scores, we need to calculate them on the fly
        aValue = handicapIndex > 0 
          ? Math.round(a.bestGrossScore - handicapIndex)
          : a.bestGrossScore;
        bValue = handicapIndex > 0 
          ? Math.round(b.bestGrossScore - handicapIndex)
          : b.bestGrossScore;
      } 
      else if (sortField === 'bestToPar' && scoreType === 'net') {
        // For net to par, calculate on the fly
        aValue = handicapIndex > 0 
          ? Math.round(a.bestToPar - handicapIndex)
          : a.bestToPar;
        bValue = handicapIndex > 0
          ? Math.round(b.bestToPar - handicapIndex)
          : b.bestToPar;
      }
      else {
        // For all other fields, use them directly
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
    console.log("Courses after sorting:", sorted.map(course => ({
      name: course.courseName,
      field: sortField,
      direction: sortDirection,
      value: sortField === 'bestToPar' && scoreType === 'net' 
        ? Math.round(course.bestToPar - handicapIndex) 
        : course[sortField]
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
          {sortedStats.map((courseStat) => {
            // Calculate net score from gross, accounting for handicap - rounding to nearest integer
            const netScore = handicapIndex > 0 
              ? Math.round(courseStat.bestGrossScore - handicapIndex)
              : courseStat.bestGrossScore;
            
            // Calculate net to par from gross to par, accounting for handicap - rounding to nearest integer
            const netToPar = handicapIndex > 0
              ? Math.round(courseStat.bestToPar - handicapIndex)
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
