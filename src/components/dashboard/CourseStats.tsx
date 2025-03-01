
import { ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";

interface Round {
  id: number;
  date: string;
  tee_name: string;
  gross_score: number;
  net_score?: number;
  to_par_gross: number;
  to_par_net?: number;
  courses?: {
    id: number;
    name: string;
    city?: string;
    state?: string;
    clubName?: string;
    courseName?: string;
  };
}

interface CourseStats {
  courseId: number;
  courseName: string;
  clubName: string;
  city?: string;
  state?: string;
  roundsPlayed: number;
  bestGrossScore: number;
  bestNetScore: number | null;
  bestToPar: number;
  bestToParNet: number | null;
}

interface CourseStatsTableProps {
  userRounds: Round[] | undefined;
  scoreType: 'gross' | 'net';
  calculateCourseStats: (rounds: Round[]) => CourseStats[];
  onCourseClick: (courseId: number) => void;
}

export const CourseStatsTable = ({ userRounds, scoreType, calculateCourseStats, onCourseClick }: CourseStatsTableProps) => {
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
                  : courseStat.bestNetScore !== null ? courseStat.bestNetScore : '-'}
              </td>
              <td className="px-4 py-3 text-sm">
                {scoreType === 'gross' 
                  ? (courseStat.bestToPar > 0 ? '+' : '') + courseStat.bestToPar
                  : courseStat.bestToParNet !== null 
                    ? (courseStat.bestToParNet > 0 ? '+' : '') + courseStat.bestToParNet
                    : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const CourseRoundHistory = ({ userRounds, selectedCourseId, onBackClick }: { 
  userRounds: Round[] | undefined; 
  selectedCourseId: number | null;
  onBackClick: () => void;
}) => {
  if (!userRounds || !selectedCourseId) return null;
  
  const courseRounds = userRounds.filter(
    round => round.courses && round.courses.id === selectedCourseId
  );
  
  if (courseRounds.length === 0) return null;
  
  // Get course name, properly formatted
  let courseName = "Course";
  let clubName = "Unknown Club";
  
  if (courseRounds[0].courses) {
    courseName = courseRounds[0].courses.courseName || "Course";
    clubName = courseRounds[0].courses.clubName || "Unknown Club";
  }
  
  const displayName = clubName !== courseName 
    ? `${clubName} - ${courseName}`
    : courseName;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold flex items-center">
          <button 
            className="mr-2 p-1 hover:bg-muted rounded"
            onClick={onBackClick}
          >
            <ChevronUp className="h-5 w-5" />
          </button>
          {displayName} Rounds
        </h2>
      </div>
      
      <div className="space-y-4">
        {courseRounds.map((round) => (
          <div key={round.id} className="bg-background border rounded-md p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{new Date(round.date).toLocaleDateString()}</p>
                <p className="text-sm text-muted-foreground">{round.tee_name} Tees</p>
              </div>
              <div className="text-right">
                <p>
                  Gross: {round.gross_score} 
                  <span className="text-muted-foreground ml-1">
                    ({round.to_par_gross > 0 ? '+' : ''}{round.to_par_gross})
                  </span>
                </p>
                {round.net_score !== undefined && (
                  <p>
                    Net: {round.net_score}
                    <span className="text-muted-foreground ml-1">
                      ({round.to_par_net !== undefined ? (round.to_par_net > 0 ? '+' : '') + round.to_par_net : ''})
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
