
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Info, Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";
import ScoreProgressChart from './ScoreProgressChart';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Component to display stats for all courses
export const CourseStatsTable = ({ 
  userRounds, 
  scoreType,
  calculateCourseStats,
  onCourseClick 
}: { 
  userRounds: any[];
  scoreType: 'gross' | 'net';
  calculateCourseStats: (rounds: any[], courseId: number, scoreType: 'gross' | 'net') => any;
  onCourseClick: (courseId: number) => void;
}) => {
  // Get unique courses from rounds
  const courses = useMemo(() => {
    if (!userRounds || userRounds.length === 0) return [];
    
    const courseMap = new Map();
    
    userRounds.forEach(round => {
      if (round.courses && !courseMap.has(round.courses.id)) {
        courseMap.set(round.courses.id, round.courses);
      }
    });
    
    return Array.from(courseMap.values());
  }, [userRounds]);

  if (!userRounds || userRounds.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="text-center p-6">
            <p className="text-muted-foreground">No rounds recorded yet. Add your first round to see course stats.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {courses.map(course => {
        const courseStats = calculateCourseStats(userRounds, course.id, scoreType);
        return (
          <Card 
            key={course.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onCourseClick(course.id)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">{course.clubName}</CardTitle>
              <div className="text-sm text-muted-foreground">{course.courseName}</div>
              {course.city && (
                <div className="text-xs text-muted-foreground mt-1">
                  {course.city}{course.state ? `, ${course.state}` : ''}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xs text-muted-foreground">Rounds</div>
                  <div className="text-xl font-semibold">{courseStats.roundsPlayed}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Best Score</div>
                  <div className="text-xl font-semibold">{courseStats.bestScore || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Best to Par</div>
                  <div className="text-xl font-semibold">
                    {courseStats.bestToPar !== null 
                      ? (courseStats.bestToPar > 0 ? '+' : '') + courseStats.bestToPar 
                      : '-'
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Component to display rounds history for a specific course
export const CourseRoundHistory = ({ 
  userRounds, 
  selectedCourseId,
  onBackClick,
  onViewScorecard,
  onDeleteRound
}: { 
  userRounds: any[];
  selectedCourseId: number;
  onBackClick: () => void;
  onViewScorecard: (round: any) => void;
  onDeleteRound: (roundId: number) => void;
}) => {
  const [roundToDelete, setRoundToDelete] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Filter rounds for the selected course
  const courseRounds = useMemo(() => {
    return userRounds?.filter(round => 
      round.courses && round.courses.id === selectedCourseId
    ) || [];
  }, [userRounds, selectedCourseId]);

  // Get course details
  const courseDetails = useMemo(() => {
    return courseRounds.length > 0 ? courseRounds[0].courses : null;
  }, [courseRounds]);

  const handleDeleteClick = (roundId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    setRoundToDelete(roundId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (roundToDelete) {
      onDeleteRound(roundToDelete);
      setRoundToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBackClick}
          className="mr-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h2 className="text-2xl font-semibold">{courseDetails?.clubName}</h2>
      </div>

      {courseDetails && (
        <div className="mb-6">
          <h3 className="text-lg font-medium">{courseDetails.courseName}</h3>
          {courseDetails.city && (
            <p className="text-sm text-muted-foreground">
              {courseDetails.city}{courseDetails.state ? `, ${courseDetails.state}` : ''}
            </p>
          )}
        </div>
      )}

      {/* Course Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Course Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xs text-muted-foreground">Rounds Played</div>
              <div className="text-xl font-semibold">{courseRounds.length}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Best Score</div>
              <div className="text-xl font-semibold">
                {courseRounds.length > 0 
                  ? Math.min(...courseRounds.map(r => r.gross_score))
                  : '-'
                }
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Best to Par</div>
              <div className="text-xl font-semibold">
                {courseRounds.length > 0 
                  ? (() => {
                    const bestToPar = Math.min(...courseRounds.map(r => r.to_par_gross));
                    return (bestToPar > 0 ? '+' : '') + bestToPar;
                  })()
                  : '-'
                }
              </div>
            </div>
          </div>
          
          {/* Progress Chart */}
          {courseRounds.length > 0 && (
            <ScoreProgressChart 
              rounds={courseRounds} 
              scoreType="gross" 
            />
          )}
        </CardContent>
      </Card>

      {/* Rounds History */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Round History</h3>
        {courseRounds.length === 0 ? (
          <div className="bg-muted/30 p-6 rounded-lg text-center">
            <p className="text-muted-foreground">No rounds recorded for this course yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {courseRounds.map(round => (
              <Card 
                key={round.id} 
                className="hover:shadow-sm transition-shadow"
              >
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <div className="font-medium">
                      {format(new Date(round.date), 'MMMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {round.tee_name && (
                        <Badge variant="outline" className="text-xs">
                          {round.tee_name} tees
                        </Badge>
                      )}
                      <div className="text-sm">
                        <span className="text-muted-foreground mr-1">Score:</span>
                        <span className="font-medium">{round.gross_score}</span>
                        <span className="text-muted-foreground mx-1">|</span>
                        <span className="text-muted-foreground mr-1">To Par:</span>
                        <span className="font-medium">
                          {round.to_par_gross > 0 ? '+' : ''}{round.to_par_gross}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewScorecard(round)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Scorecard
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={(e) => handleDeleteClick(round.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete Round</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Round</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this round? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRoundToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
