
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import ScoreProgressChart from "../ScoreProgressChart";
import { formatDate } from "date-fns";

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

interface CourseRoundHistoryProps {
  userRounds: Round[] | null;
  selectedCourseId: number;
  onBackClick: () => void;
  onViewScorecard?: (round: Round) => void;
  onDeleteRound?: (roundId: number) => void;
  scoreType?: 'gross' | 'net';
}

export const CourseRoundHistory = ({ 
  userRounds, 
  selectedCourseId,
  onBackClick,
  onViewScorecard,
  onDeleteRound,
  scoreType = 'gross'
}: CourseRoundHistoryProps) => {
  if (!userRounds) return null;
  
  const courseRounds = userRounds.filter(round => round.courses?.id === selectedCourseId);
  
  if (courseRounds.length === 0) {
    return (
      <div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6"
          onClick={onBackClick}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to courses
        </Button>
        <div className="text-center py-10">
          <p className="text-gray-500">No rounds found for this course.</p>
        </div>
      </div>
    );
  }
  
  const courseInfo = courseRounds[0].courses;
  
  // Calculate course stats
  const roundsPlayed = courseRounds.length;
  const bestScore = Math.min(...courseRounds.map(r => r.gross_score));
  const bestToPar = Math.min(...courseRounds.map(r => r.to_par_gross));
  
  return (
    <div>
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-6"
        onClick={onBackClick}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to courses
      </Button>
      
      <div className="mb-8">
        <h3 className="text-2xl font-semibold">
          {courseInfo?.clubName || 'Unknown Club'}
        </h3>
        <p className="text-muted-foreground">
          {courseInfo?.courseName || 'Unknown Course'}
        </p>
        {(courseInfo?.city || courseInfo?.state) && (
          <p className="text-sm text-muted-foreground mt-1">
            {[courseInfo?.city, courseInfo?.state].filter(Boolean).join(', ')}
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-lg border p-4 text-center">
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Rounds Played</h4>
          <p className="text-3xl font-bold">{roundsPlayed}</p>
        </div>
        <div className="bg-card rounded-lg border p-4 text-center">
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Best Score</h4>
          <p className="text-3xl font-bold">{bestScore}</p>
        </div>
        <div className="bg-card rounded-lg border p-4 text-center">
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Best To Par</h4>
          <p className="text-3xl font-bold">{bestToPar > 0 ? `+${bestToPar}` : bestToPar}</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="text-lg font-medium mb-3">Score Progress</h4>
        <div className="h-[250px]">
          <ScoreProgressChart rounds={courseRounds} scoreType={scoreType} />
        </div>
      </div>
      
      <div>
        <h4 className="text-lg font-medium mb-3">Round History</h4>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Tee</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>To Par</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courseRounds.map((round) => (
                <TableRow key={round.id}>
                  <TableCell>{formatDate(new Date(round.date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{round.tee_name}</TableCell>
                  <TableCell>
                    {scoreType === 'gross' 
                      ? round.gross_score 
                      : round.net_score || round.gross_score}
                  </TableCell>
                  <TableCell>
                    {scoreType === 'gross'
                      ? (round.to_par_gross > 0 ? `+${round.to_par_gross}` : round.to_par_gross)
                      : (round.to_par_net !== undefined 
                          ? (round.to_par_net > 0 ? `+${round.to_par_net}` : round.to_par_net)
                          : (round.to_par_gross > 0 ? `+${round.to_par_gross}` : round.to_par_gross)
                        )
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {onViewScorecard && (
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
                      )}
                      {onDeleteRound && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
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
  );
};
