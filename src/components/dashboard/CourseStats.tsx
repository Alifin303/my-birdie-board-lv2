
import { useState } from 'react';
import { ArrowLeft, ArrowUp, ArrowDown, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

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

interface CourseStatsTableProps {
  userRounds: Round[] | undefined;
  scoreType: 'gross' | 'net';
  calculateCourseStats: (rounds: Round[]) => CourseStats[];
  onCourseClick: (courseId: number) => void;
}

export const CourseStatsTable: React.FC<CourseStatsTableProps> = ({
  userRounds,
  scoreType,
  calculateCourseStats,
  onCourseClick
}) => {
  const [sortField, setSortField] = useState<'courseName' | 'roundsPlayed' | 'bestScore' | 'bestToPar'>('courseName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  if (!userRounds || userRounds.length === 0) {
    return (
      <div className="text-center p-8 bg-muted/20 rounded-lg">
        <p className="text-muted-foreground">No rounds recorded yet.</p>
        <p className="text-sm text-muted-foreground mt-2">Add a round to see your stats.</p>
      </div>
    );
  }
  
  // Calculate course stats
  const courseStats = calculateCourseStats(userRounds);
  
  // Sort the course stats
  const sortedCourseStats = [...courseStats].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'courseName') {
      comparison = a.courseName.localeCompare(b.courseName);
    } else if (sortField === 'roundsPlayed') {
      comparison = a.roundsPlayed - b.roundsPlayed;
    } else if (sortField === 'bestScore') {
      const aValue = scoreType === 'gross' ? a.bestGrossScore : (a.bestNetScore || Number.MAX_SAFE_INTEGER);
      const bValue = scoreType === 'gross' ? b.bestGrossScore : (b.bestNetScore || Number.MAX_SAFE_INTEGER);
      comparison = aValue - bValue;
    } else if (sortField === 'bestToPar') {
      const aValue = scoreType === 'gross' ? a.bestToPar : (a.bestToParNet ?? Number.MAX_SAFE_INTEGER);
      const bValue = scoreType === 'gross' ? b.bestToPar : (b.bestToParNet ?? Number.MAX_SAFE_INTEGER);
      comparison = aValue - bValue;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  const handleSort = (field: 'courseName' | 'roundsPlayed' | 'bestScore' | 'bestToPar') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const renderSortIcon = (field: 'courseName' | 'roundsPlayed' | 'bestScore' | 'bestToPar') => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };
  
  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/20">
          <tr>
            <th 
              className="px-4 py-3 text-left font-medium text-sm text-muted-foreground"
              onClick={() => handleSort('courseName')}
            >
              <div className="flex items-center gap-1 cursor-pointer">
                Course Name
                {renderSortIcon('courseName')}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left font-medium text-sm text-muted-foreground"
              onClick={() => handleSort('roundsPlayed')}
            >
              <div className="flex items-center gap-1 cursor-pointer">
                Rounds Played
                {renderSortIcon('roundsPlayed')}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left font-medium text-sm text-muted-foreground"
              onClick={() => handleSort('bestScore')}
            >
              <div className="flex items-center gap-1 cursor-pointer">
                Best Score
                {renderSortIcon('bestScore')}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left font-medium text-sm text-muted-foreground"
              onClick={() => handleSort('bestToPar')}
            >
              <div className="flex items-center gap-1 cursor-pointer">
                Best to Par
                {renderSortIcon('bestToPar')}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedCourseStats.map((course) => (
            <tr 
              key={course.courseId} 
              className="border-t hover:bg-muted/10 cursor-pointer"
              onClick={() => onCourseClick(course.courseId)}
            >
              <td className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{course.clubName}</p>
                    <p className="text-sm text-muted-foreground">{course.courseName !== course.clubName ? course.courseName : ''}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </td>
              <td className="px-4 py-3">{course.roundsPlayed}</td>
              <td className="px-4 py-3">
                {scoreType === 'gross' 
                  ? course.bestGrossScore 
                  : (course.bestNetScore || '-')}
              </td>
              <td className="px-4 py-3">
                {scoreType === 'gross'
                  ? (course.bestToPar > 0 ? '+' : '') + course.bestToPar
                  : course.bestToParNet !== null
                    ? (course.bestToParNet > 0 ? '+' : '') + course.bestToParNet
                    : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const CourseRoundHistory = ({ 
  userRounds, 
  selectedCourseId,
  onBackClick,
  onViewScorecard,
  onDeleteRound
}) => {
  // Filter rounds for selected course
  const courseRounds = userRounds?.filter(round => 
    round.courses && round.courses.id === selectedCourseId
  ).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const courseName = courseRounds && courseRounds.length > 0 && courseRounds[0].courses 
    ? (courseRounds[0].courses.clubName || courseRounds[0].courses.name)
    : "Course";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBackClick} className="px-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>
        <h2 className="text-2xl font-semibold">{courseName} Rounds</h2>
      </div>
      
      {courseRounds && courseRounds.length === 0 && (
        <div className="text-center p-8 bg-muted/20 rounded-lg">
          <p className="text-muted-foreground">No rounds found for this course.</p>
        </div>
      )}
      
      {courseRounds && courseRounds.length > 0 && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/20">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-sm text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left font-medium text-sm text-muted-foreground">Tee</th>
                <th className="px-4 py-3 text-left font-medium text-sm text-muted-foreground">Gross Score</th>
                <th className="px-4 py-3 text-left font-medium text-sm text-muted-foreground">To Par</th>
                <th className="px-4 py-3 text-center font-medium text-sm text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courseRounds.map((round) => {
                const date = new Date(round.date);
                const formattedDate = date.toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });
                
                return (
                  <tr key={round.id} className="border-t hover:bg-muted/10">
                    <td className="px-4 py-3">{formattedDate}</td>
                    <td className="px-4 py-3">{round.tee_name || 'N/A'}</td>
                    <td className="px-4 py-3">{round.gross_score}</td>
                    <td className="px-4 py-3">
                      {round.to_par_gross > 0 ? '+' : ''}{round.to_par_gross}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewScorecard(round);
                          }}
                        >
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteRound(round.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
