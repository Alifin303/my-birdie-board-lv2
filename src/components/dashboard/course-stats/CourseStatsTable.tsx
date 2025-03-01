
import { useState, useMemo } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CourseStatsTableProps {
  userRounds: any[] | null;
  scoreType: 'gross' | 'net';
  calculateCourseStats: (rounds: any[], scoreType: 'gross' | 'net') => any;
  onCourseClick: (courseId: number) => void;
}

export const CourseStatsTable = ({ 
  userRounds, 
  scoreType, 
  calculateCourseStats,
  onCourseClick
}: CourseStatsTableProps) => {
  const [sortField, setSortField] = useState<string>('roundsPlayed');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="inline-block h-4 w-4" /> : <ChevronDown className="inline-block h-4 w-4" />;
  };

  const coursesData = useMemo(() => {
    if (!userRounds) return [];

    // Group rounds by course
    const courseGroups = userRounds.reduce((acc, round) => {
      if (!round.courses) return acc;
      
      const courseId = round.courses.id;
      if (!acc[courseId]) {
        acc[courseId] = {
          id: courseId,
          name: round.courses.name,
          clubName: round.courses.clubName || 'Unknown Club',
          courseName: round.courses.courseName || 'Unknown Course',
          city: round.courses.city || '',
          state: round.courses.state || '',
          rounds: []
        };
      }
      acc[courseId].rounds.push(round);
      return acc;
    }, {} as Record<string, any>);

    // Calculate stats for each course
    return Object.values(courseGroups).map(course => {
      const stats = calculateCourseStats(course.rounds, scoreType);
      return {
        ...course,
        roundsPlayed: stats.roundsPlayed,
        bestScore: stats.bestScore,
        averageScore: stats.averageScore,
        bestToPar: stats.bestToPar
      };
    }).sort((a, b) => {
      let valueA = a[sortField];
      let valueB = b[sortField];
      
      // Special case for bestToPar - lower is better
      if (sortField === 'bestToPar') {
        return sortDirection === 'asc'
          ? valueA - valueB
          : valueB - valueA;
      }
      
      // For all other fields, higher is typically better
      return sortDirection === 'asc'
        ? valueA - valueB
        : valueB - valueA;
    });
  }, [userRounds, calculateCourseStats, sortField, sortDirection, scoreType]);

  if (!userRounds || userRounds.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">You haven't played any rounds yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course</TableHead>
            <TableHead 
              className="cursor-pointer" 
              onClick={() => handleSort('roundsPlayed')}
            >
              Rounds Played {renderSortIcon('roundsPlayed')}
            </TableHead>
            <TableHead 
              className="cursor-pointer" 
              onClick={() => handleSort('bestScore')}
            >
              Best Score {renderSortIcon('bestScore')}
            </TableHead>
            <TableHead 
              className="cursor-pointer" 
              onClick={() => handleSort('averageScore')}
            >
              Avg. Score {renderSortIcon('averageScore')}
            </TableHead>
            <TableHead 
              className="cursor-pointer" 
              onClick={() => handleSort('bestToPar')}
            >
              Best to Par {renderSortIcon('bestToPar')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coursesData.map((course) => (
            <TableRow 
              key={course.id} 
              className="cursor-pointer hover:bg-muted/60"
              onClick={() => onCourseClick(course.id)}
            >
              <TableCell>
                <div>
                  <div className="font-medium">{course.clubName}</div>
                  <div className="text-sm text-muted-foreground">{course.courseName}</div>
                  {(course.city || course.state) && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {[course.city, course.state].filter(Boolean).join(', ')}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{course.roundsPlayed}</TableCell>
              <TableCell>{course.bestScore}</TableCell>
              <TableCell>{course.averageScore.toFixed(1)}</TableCell>
              <TableCell>{course.bestToPar > 0 ? `+${course.bestToPar}` : course.bestToPar}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
