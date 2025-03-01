import { useState } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ArrowUpDown, BarChart } from "lucide-react";
import ScoreProgressChart from "./ScoreProgressChart";

interface Round {
  id: number;
  date: string;
  tee_name: string;
  gross_score: number;
  net_score?: number;
  to_par_gross: number;
  to_par_net?: number;
  hole_scores?: any;
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

export const CourseStatsTable = ({ 
  userRounds, 
  scoreType, 
  calculateCourseStats,
  onCourseClick 
}: CourseStatsTableProps) => {
  const [sortBy, setSortBy] = useState<keyof CourseStats>('courseName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  if (!userRounds || userRounds.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No rounds recorded yet.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Add rounds to see your course statistics here.
        </p>
      </div>
    );
  }

  const courseStats = calculateCourseStats(userRounds);

  const handleSort = (column: keyof CourseStats) => {
    if (column === sortBy) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const sortedCourseStats = [...courseStats].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'courseName' || sortBy === 'clubName' || sortBy === 'city' || sortBy === 'state') {
      comparison = String(a[sortBy] || '').localeCompare(String(b[sortBy] || ''));
    } else {
      comparison = (a[sortBy] as number) - (b[sortBy] as number);
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const renderSortIcon = (column: keyof CourseStats) => {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="ml-1 p-0 h-8 w-8"
        onClick={() => handleSort(column)}
      >
        <ArrowUpDown className="h-4 w-4" />
        <span className="sr-only">Sort by {column}</span>
      </Button>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>Your golf course statistics</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[350px]">
              Course Name {renderSortIcon('courseName')}
            </TableHead>
            <TableHead className="text-center">
              Rounds {renderSortIcon('roundsPlayed')}
            </TableHead>
            <TableHead className="text-center">
              Best Score {renderSortIcon(scoreType === 'gross' ? 'bestGrossScore' : 'bestNetScore')}
            </TableHead>
            <TableHead className="text-center">
              Best to Par {renderSortIcon(scoreType === 'gross' ? 'bestToPar' : 'bestToParNet')}
            </TableHead>
            <TableHead className="text-center">Stats</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCourseStats.map((course) => (
            <TableRow 
              key={course.courseId}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onCourseClick(course.courseId)}
            >
              <TableCell className="font-medium">
                <div>
                  <p>{course.clubName}</p>
                  {course.courseName !== course.clubName && (
                    <p className="text-sm text-muted-foreground">{course.courseName}</p>
                  )}
                  {(course.city || course.state) && (
                    <p className="text-xs text-muted-foreground">
                      {course.city}{course.state ? `, ${course.state}` : ''}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">{course.roundsPlayed}</TableCell>
              <TableCell className="text-center">
                {scoreType === 'gross' 
                  ? course.bestGrossScore 
                  : course.bestNetScore || '-'}
              </TableCell>
              <TableCell className="text-center">
                {scoreType === 'gross' 
                  ? (course.bestToPar > 0 ? '+' : '') + course.bestToPar 
                  : course.bestToParNet !== null 
                    ? (course.bestToParNet > 0 ? '+' : '') + course.bestToParNet
                    : '-'}
              </TableCell>
              <TableCell className="text-center">
                <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                  <BarChart className="h-4 w-4" />
                  <span className="sr-only">View Stats</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

interface CourseRoundHistoryProps {
  userRounds: Round[] | undefined;
  selectedCourseId: number;
  onBackClick: () => void;
  onViewScorecard?: (round: Round) => void;
  onDeleteRound?: (roundId: number) => void;
}

export const CourseRoundHistory = ({ 
  userRounds,
  selectedCourseId,
  onBackClick,
  onViewScorecard,
  onDeleteRound
}: CourseRoundHistoryProps) => {
  if (!userRounds) return null;
  
  const courseRounds = userRounds.filter(round => 
    round.courses && round.courses.id === selectedCourseId
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (courseRounds.length === 0) return null;
  
  const course = courseRounds[0].courses;
  
  // Calculate course stats
  const bestScore = Math.min(...courseRounds.map(r => r.gross_score));
  const bestToPar = Math.min(...courseRounds.map(r => r.to_par_gross));
  const averageScore = courseRounds.reduce((sum, r) => sum + r.gross_score, 0) / courseRounds.length;
  
  // Extract clubName and courseName from course.name if available
  const clubName = course?.clubName || course?.name || 'Unknown Club';
  const courseName = course?.courseName && course.courseName !== course.clubName ? course.courseName : '';
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onBackClick}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
      </div>
      
      <div className="bg-background p-5 rounded-lg border">
        <h3 className="text-xl font-semibold mb-1">{clubName}</h3>
        {courseName && <p className="text-muted-foreground mb-2">{courseName}</p>}
        {(course?.city || course?.state) && (
          <p className="text-sm text-muted-foreground mb-4">
            {course.city}{course.state ? `, ${course.state}` : ''}
          </p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-muted/20 p-4 rounded-md">
            <p className="text-sm font-medium text-muted-foreground">Rounds Played</p>
            <p className="text-2xl font-bold">{courseRounds.length}</p>
          </div>
          <div className="bg-muted/20 p-4 rounded-md">
            <p className="text-sm font-medium text-muted-foreground">Best Score</p>
            <p className="text-2xl font-bold">{bestScore}</p>
          </div>
          <div className="bg-muted/20 p-4 rounded-md">
            <p className="text-sm font-medium text-muted-foreground">Best to Par</p>
            <p className="text-2xl font-bold">{(bestToPar > 0 ? '+' : '') + bestToPar}</p>
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-3">Score Progress</h4>
          <div className="h-[250px]">
            <ScoreProgressChart rounds={courseRounds} />
          </div>
        </div>
        
        <div>
          <h4 className="text-lg font-medium mb-3">Round History</h4>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>To Par</TableHead>
                  <TableHead>Tee</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courseRounds.map((round) => (
                  <TableRow key={round.id}>
                    <TableCell>{new Date(round.date).toLocaleDateString()}</TableCell>
                    <TableCell>{round.gross_score}</TableCell>
                    <TableCell>{(round.to_par_gross > 0 ? '+' : '') + round.to_par_gross}</TableCell>
                    <TableCell>{round.tee_name || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {onViewScorecard && round.hole_scores && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewScorecard(round);
                            }}
                          >
                            View Scorecard
                          </Button>
                        )}
                        {onDeleteRound && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteRound(round.id);
                            }}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};
