
import { useState, useEffect } from "react";
import { ArrowLeft, Trophy, Eye, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import ScoreProgressChart from "./ScoreProgressChart";
import { RoundScorecard } from "./scorecard/RoundScorecard";
import { CourseLeaderboard } from "./CourseLeaderboard";
import { PotentialBestScore } from "./PotentialBestScore";
import { CourseAdvancedStats } from "./CourseAdvancedStats";
import { Round } from "./types";
import { calculateHoleStats } from "@/utils/statsCalculator";
import { CourseBasicStats } from "./CourseBasicStats";
import { CoursePerformance } from "./CoursePerformance";
import { 
  calculateCourseSpecificStats, 
  getAvailableYears, 
  getAvailableMonths, 
  getFilteredRounds 
} from "./CourseStatsHelper";

interface CourseRoundHistoryProps {
  userRounds: Round[] | undefined; 
  selectedCourseId: number | null;
  onBackClick: () => void;
  handicapIndex?: number;
  isDemo?: boolean;
}

type PeriodType = 'month' | 'year' | 'all';

export const CourseRoundHistory = ({ 
  userRounds, 
  selectedCourseId, 
  onBackClick,
  handicapIndex = 0,
  isDemo = false
}: CourseRoundHistoryProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [scoreType, setScoreType] = useState<'gross' | 'net'>('gross');
  const [viewingRound, setViewingRound] = useState<Round | null>(null);
  const [scorecardOpen, setScorecardOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [periodType, setPeriodType] = useState<PeriodType>('all');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  useEffect(() => {
    if (selectedCourseId) {
      console.log("Course ID changed, resetting round history state");
      setViewingRound(null);
      setScorecardOpen(false);
    }
  }, [selectedCourseId]);
  
  // Early return if we don't have the necessary data
  if (!userRounds || !selectedCourseId) {
    return null;
  }
  
  const courseRounds = userRounds.filter(
    round => round.courses && round.courses.id === selectedCourseId
  );
  
  if (courseRounds.length === 0) {
    return null;
  }
  
  let courseName = "Course";
  let clubName = "Unknown Club";
  
  if (courseRounds[0].courses) {
    courseName = courseRounds[0].courses.courseName || "Course";
    clubName = courseRounds[0].courses.clubName || "Unknown Club";
  }
  
  const displayName = clubName !== courseName 
    ? `${clubName} - ${courseName}`
    : courseName;
  
  const availableYears = getAvailableYears(courseRounds);
  const availableMonths = getAvailableMonths(courseRounds, periodType, currentDate);
  
  const handleDeleteRound = async (roundId: number) => {
    if (isDemo) return; // Prevent deletion in demo mode
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log(`Deleting round with ID ${roundId} from Supabase database`);
      
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', roundId);
        
      if (error) {
        console.error("Database error when deleting round:", error);
        throw error;
      }
      
      if (session) {
        console.log("Recalculating handicap after round deletion");
        
        const { data: userRounds, error: userRoundsError } = await supabase
          .from('rounds')
          .select('gross_score')
          .eq('user_id', session.user.id)
          .order('date', { ascending: false });
          
        if (userRoundsError) {
          console.error("Error fetching user rounds for handicap update after deletion:", userRoundsError);
        } else if (userRounds) {
          const grossScores = userRounds.map(r => r.gross_score);
          console.log("Updating handicap based on remaining rounds:", grossScores);
          
          const { updateUserHandicap } = await import('@/integrations/supabase');
          
          const newHandicap = await updateUserHandicap(session.user.id, grossScores);
          console.log("Updated handicap after round deletion to:", newHandicap);
          
          toast({
            title: "Handicap Updated",
            description: `Your handicap index is now ${newHandicap}`,
          });
        }
      }
      
      toast({
        title: "Round deleted",
        description: "The round has been permanently removed.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['userRounds'] });
      
    } catch (error: any) {
      console.error("Error deleting round:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete round. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleViewScorecard = (round: Round) => {
    console.log("IMPORTANT - VIEWING ROUND SCORECARD:", {
      id: round.id,
      teeName: round.tee_name,
      teeNameType: typeof round.tee_name,
      teeId: round.tee_id,
      handicapAtPosting: round.handicap_at_posting
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

  const filteredRounds = getFilteredRounds(courseRounds, periodType, currentDate);
  const filteredRoundsCount = filteredRounds.length;
  
  const stats = calculateCourseSpecificStats(courseRounds, handicapIndex);
  const courseHoleStats = calculateHoleStats(filteredRounds);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateNetScore = (round: Round, handicapIndex: number): number => {
    return round.gross_score - handicapIndex;
  };

  const formatToPar = (value: number) => {
    if (value === 0) return 'E';
    return (value > 0 ? '+' : '') + value;
  };

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
            {isDemo ? 'Back to Demo' : 'Back to Dashboard'}
          </Button>
          {displayName}
        </h2>
      </div>
      
      {stats && <CourseBasicStats {...stats} scoreType={scoreType} />}
      
      <div className="pb-2">
        <ScoreProgressChart 
          rounds={courseRounds}
          scoreType={scoreType}
          handicapIndex={handicapIndex}
        />
      </div>
      
      <CoursePerformance 
        courseHoleStats={courseHoleStats}
        availableYears={availableYears}
        availableMonths={availableMonths}
        currentDate={currentDate}
        periodType={periodType}
        setPeriodType={setPeriodType}
        setCurrentDate={setCurrentDate}
        filteredRoundsCount={filteredRoundsCount}
      />
      
      <CourseAdvancedStats 
        rounds={courseRounds}
        isLoading={false}
      />
      
      <PotentialBestScore rounds={courseRounds} />
      
      {!isDemo && (
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
      )}
      
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
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-muted">
                <th className="text-left py-3 px-2 font-semibold text-xs">Date</th>
                <th className="text-center py-3 px-2 font-semibold text-xs">Tee</th>
                <th className="text-center py-3 px-2 font-semibold text-xs">Score</th>
                <th className="text-center py-3 px-2 font-semibold text-xs">To Par</th>
                <th className="text-center py-3 px-2 font-semibold text-xs">HCP</th>
                <th className="text-center py-3 px-2 font-semibold text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courseRounds.map((round) => (
                <tr key={round.id} className="border-b border-muted/50 hover:bg-muted/20">
                  <td className="py-3 px-2 text-xs">
                    {formatDate(round.date)}
                  </td>
                  <td className="text-center py-3 px-2 text-xs">
                    {round.tee_name || 'Unknown'}
                  </td>
                  <td className="text-center py-3 px-2 text-xs font-medium">
                    {scoreType === 'gross' ? round.gross_score : (round.net_score || calculateNetScore(round, handicapIndex))}
                  </td>
                  <td className="text-center py-3 px-2 text-xs font-medium">
                    {formatToPar(scoreType === 'gross' ? (round.to_par_gross || 0) : (round.to_par_net || 0))}
                  </td>
                  <td className="text-center py-3 px-2 text-xs">
                    {round.handicap_at_posting ? round.handicap_at_posting.toFixed(1) : handicapIndex.toFixed(1)}
                  </td>
                  <td className="text-center py-3 px-2">
                    <div className="flex justify-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewScorecard(round)}
                        className="h-7 w-7 p-0"
                        title={isDemo ? "View Demo Scorecard" : "View Scorecard"}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      {!isDemo && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRound(round.id)}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          title="Delete Round"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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
          isDemo={isDemo}
        />
      )}
      
      {!isDemo && (
        <CourseLeaderboard
          courseId={selectedCourseId}
          courseName={displayName}
          open={leaderboardOpen}
          onOpenChange={setLeaderboardOpen}
          handicapIndex={handicapIndex}
        />
      )}
    </div>
  );
};
