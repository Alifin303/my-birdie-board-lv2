
import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, Trash, Eye, ArrowLeft, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import ScoreProgressChart from "./ScoreProgressChart";
import { RoundScorecard } from "./scorecard/RoundScorecard";
import { CourseLeaderboard } from "./CourseLeaderboard";
import { PotentialBestScore } from "./PotentialBestScore";
import { Round } from "./types";

interface CourseRoundHistoryProps {
  userRounds: Round[] | undefined; 
  selectedCourseId: number | null;
  onBackClick: () => void;
  handicapIndex?: number;
}

export const CourseRoundHistory = ({ 
  userRounds, 
  selectedCourseId, 
  onBackClick,
  handicapIndex = 0
}: CourseRoundHistoryProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [scoreType, setScoreType] = useState<'gross' | 'net'>('gross');
  const [deletingRoundId, setDeletingRoundId] = useState<number | null>(null);
  const [viewingRound, setViewingRound] = useState<Round | null>(null);
  const [scorecardOpen, setScorecardOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [sortField, setSortField] = useState<'date' | 'gross_score' | 'to_par_gross'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  useEffect(() => {
    if (selectedCourseId) {
      console.log("Course ID changed, resetting round history state");
      setViewingRound(null);
      setScorecardOpen(false);
    }
  }, [selectedCourseId]);
  
  if (!userRounds || !selectedCourseId) return null;
  
  const courseRounds = userRounds.filter(
    round => round.courses && round.courses.id === selectedCourseId
  );
  
  console.log("All rounds for this course with tee info:", 
    courseRounds.map(round => ({
      id: round.id,
      tee_name: round.tee_name,
      tee_name_type: typeof round.tee_name,
      tee_id: round.tee_id,
      date: new Date(round.date).toLocaleDateString()
    }))
  );
  
  if (courseRounds.length === 0) return null;
  
  let courseName = "Course";
  let clubName = "Unknown Club";
  
  if (courseRounds[0].courses) {
    courseName = courseRounds[0].courses.courseName || "Course";
    clubName = courseRounds[0].courses.clubName || "Unknown Club";
  }
  
  const displayName = clubName !== courseName 
    ? `${clubName} - ${courseName}`
    : courseName;
  
  const calculateCourseSpecificStats = () => {
    if (courseRounds.length === 0) return null;
    
    const roundsPlayed = courseRounds.length;
    const bestGrossScore = Math.min(...courseRounds.map(r => r.gross_score));
    const bestToPar = Math.min(...courseRounds.map(r => r.to_par_gross));
    
    const roundsWithNetScore = courseRounds.map(r => ({
      ...r,
      calculatedNetScore: r.net_score !== undefined && r.net_score !== null 
        ? r.net_score 
        : Math.max(0, r.gross_score - handicapIndex)
    }));
    
    const bestNetScore = Math.min(...roundsWithNetScore.map(r => r.calculatedNetScore));
    
    const roundsWithToParNet = courseRounds.map(r => ({
      ...r,
      calculatedToParNet: r.to_par_net !== undefined && r.to_par_net !== null
        ? r.to_par_net
        : Math.max(-72, r.to_par_gross - handicapIndex)
    }));
    
    const bestToParNet = Math.min(...roundsWithToParNet.map(r => r.calculatedToParNet));
      
    return { roundsPlayed, bestGrossScore, bestNetScore, bestToPar, bestToParNet };
  };
  
  const stats = calculateCourseSpecificStats();
  
  const handleDeleteRound = async () => {
    if (!deletingRoundId) return;
    
    try {
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', deletingRoundId);
        
      if (error) throw error;
      
      toast({
        title: "Round deleted",
        description: "The round has been permanently removed.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['userRounds'] });
      
    } catch (error) {
      console.error("Error deleting round:", error);
      toast({
        title: "Error",
        description: "Failed to delete round. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingRoundId(null);
    }
  };
  
  const handleViewScorecard = (round: Round) => {
    console.log("IMPORTANT - VIEWING ROUND SCORECARD:", {
      id: round.id,
      teeName: round.tee_name,
      teeNameType: typeof round.tee_name,
      teeId: round.tee_id
    });
    
    if (scorecardOpen) {
      setScorecardOpen(false);
      setTimeout(() => {
        setViewingRound(round);
        setScorecardOpen(true);
      }, 50);
    } else {
      setViewingRound(round);
      setScorecardOpen(true);
    }
  };

  const handleSort = (field: 'date' | 'gross_score' | 'to_par_gross') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const renderSortIndicator = (field: 'date' | 'gross_score' | 'to_par_gross') => {
    if (sortField !== field) {
      return <span className="text-muted-foreground opacity-50 ml-1">↕️</span>;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="inline-block h-4 w-4 ml-1" /> 
      : <ChevronDown className="inline-block h-4 w-4 ml-1" />;
  };

  const formatTeeName = (teeName: string | null | undefined): string => {
    console.log(`CRITICAL - Formatting tee name in CourseRoundHistory: "${teeName}" (${typeof teeName})`);
    
    if (!teeName || teeName === '') {
      return 'Standard Tees';
    }
    return teeName;
  };
  
  const sortedRounds = [...courseRounds].sort((a, b) => {
    if (sortField === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortField === 'gross_score') {
      return sortDirection === 'asc' ? a.gross_score - b.gross_score : b.gross_score - a.gross_score;
    } else { // to_par_gross
      return sortDirection === 'asc' ? a.to_par_gross - b.to_par_gross : b.to_par_gross - a.to_par_gross;
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold flex items-center">
          <Button 
            variant="outline"
            className="mr-3 gap-2"
            onClick={onBackClick}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          {displayName}
        </h2>
      </div>
      
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-background border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Rounds Played</p>
            <p className="text-3xl font-bold">{stats.roundsPlayed}</p>
          </div>
          <div className="bg-background border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Best Score</p>
            <p className="text-3xl font-bold">
              {scoreType === 'gross' 
                ? stats.bestGrossScore 
                : stats.bestNetScore}
            </p>
          </div>
          <div className="bg-background border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Best to Par</p>
            <p className="text-3xl font-bold">
              {scoreType === 'gross' 
                ? (stats.bestToPar > 0 ? '+' : '') + stats.bestToPar
                : (stats.bestToParNet > 0 ? '+' : '') + stats.bestToParNet}
            </p>
          </div>
        </div>
      )}
      
      <div className="pb-8">
        <ScoreProgressChart 
          rounds={courseRounds}
          scoreType={scoreType}
          handicapIndex={handicapIndex}
        />
      </div>
      
      {/* Add the new Potential Best Score component here */}
      <PotentialBestScore rounds={courseRounds} />
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 bg-muted/30 rounded-lg border mt-16">
        <p className="text-sm sm:text-base">
          Want to see how your score compares to other golfers at this course?
        </p>
        <Button 
          onClick={() => setLeaderboardOpen(true)}
          className="whitespace-nowrap"
        >
          <Trophy className="h-4 w-4 mr-2" />
          View Course Leaderboards
        </Button>
      </div>
      
      <div className="space-y-4 mt-6">
        <h3 className="text-lg font-medium">Round History</h3>
        <div className="flex justify-end space-x-2 mb-2">
          <Button 
            variant={scoreType === 'gross' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setScoreType('gross')}
            className="text-xs"
          >
            Gross Score
          </Button>
          <Button 
            variant={scoreType === 'net' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setScoreType('net')}
            className="text-xs"
          >
            Net Score
          </Button>
        </div>
        
        <div className="overflow-x-auto rounded-lg border bg-background">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center cursor-pointer hover:text-primary transition-colors"
                  >
                    <span>Date</span>
                    {renderSortIndicator('date')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  <span>Tee</span>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort('gross_score')}
                    className="flex items-center cursor-pointer hover:text-primary transition-colors"
                  >
                    <span>{scoreType === 'gross' ? 'Gross Score' : 'Net Score'}</span>
                    {renderSortIndicator('gross_score')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort('to_par_gross')}
                    className="flex items-center cursor-pointer hover:text-primary transition-colors"
                  >
                    <span>To Par</span>
                    {renderSortIndicator('to_par_gross')}
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                  <span>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedRounds.map((round) => {
                const netScore = round.net_score !== undefined && round.net_score !== null
                  ? round.net_score
                  : Math.max(0, round.gross_score - handicapIndex);
                
                const netToPar = round.to_par_net !== undefined && round.to_par_net !== null
                  ? round.to_par_net
                  : Math.max(-72, round.to_par_gross - handicapIndex);
                
                return (
                  <tr key={round.id} className="border-b last:border-0">
                    <td className="px-4 py-3 text-sm font-medium">
                      {new Date(round.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatTeeName(round.tee_name)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {scoreType === 'gross' 
                        ? round.gross_score 
                        : netScore}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {scoreType === 'gross' 
                        ? (round.to_par_gross > 0 ? '+' : '') + round.to_par_gross
                        : (netToPar > 0 ? '+' : '') + netToPar}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewScorecard(round)}
                          title="View scorecard"
                          className="h-8 px-2"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setDeletingRoundId(round.id)}
                              className="h-8 px-2 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                              title="Delete round"
                            >
                              <Trash className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure you want to delete this round?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the round
                                data and remove it from all statistics.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setDeletingRoundId(null)}>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteRound} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {viewingRound && (
        <RoundScorecard 
          round={viewingRound}
          isOpen={scorecardOpen}
          onOpenChange={(open) => {
            setScorecardOpen(open);
            if (!open) {
              setTimeout(() => setViewingRound(null), 100);
            }
          }}
          handicapIndex={handicapIndex}
        />
      )}
      
      <CourseLeaderboard
        courseId={selectedCourseId}
        courseName={displayName}
        open={leaderboardOpen}
        onOpenChange={setLeaderboardOpen}
        handicapIndex={handicapIndex}
      />
    </div>
  );
};
