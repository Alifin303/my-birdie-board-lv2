import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, Trash, Eye, ArrowLeft, Trophy, PieChart, Calendar as CalendarIcon, TrendingUp, History } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ScoreProgressChart from "./ScoreProgressChart";
import { RoundScorecard } from "./scorecard/RoundScorecard";
import { CourseLeaderboard } from "./CourseLeaderboard";
import { PotentialBestScore } from "./PotentialBestScore";
import { CourseAdvancedStats } from "./CourseAdvancedStats";
import { Round } from "./types";
import { calculateHoleStats } from "@/utils/statsCalculator";

interface CourseRoundHistoryProps {
  userRounds: Round[] | undefined; 
  selectedCourseId: number | null;
  onBackClick: () => void;
  handicapIndex?: number;
}

type ScoreType = 'eagle' | 'birdie' | 'par' | 'bogey' | 'doubleBogey' | 'other';

type PeriodType = 'month' | 'year' | 'all';

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
  const [periodType, setPeriodType] = useState<PeriodType>('all');
  const [currentDate, setCurrentDate] = useState(new Date());
  
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
  
  const getAvailableYears = () => {
    if (!courseRounds?.length) return [new Date().getFullYear()];
    
    const years = courseRounds.map(round => new Date(round.date).getFullYear());
    return [...new Set(years)].sort((a, b) => b - a);
  };
  
  const getAvailableMonths = () => {
    if (!courseRounds?.length) return Array.from({ length: 12 }, (_, i) => i);
    
    if (periodType !== 'month') return [];
    
    const selectedYear = currentDate.getFullYear();
    const months = courseRounds
      .filter(round => new Date(round.date).getFullYear() === selectedYear)
      .map(round => new Date(round.date).getMonth());
    
    const availableMonths = [...new Set(months)].sort((a, b) => a - b);
    
    return availableMonths.length ? availableMonths : Array.from({ length: 12 }, (_, i) => i);
  };
  
  const handleYearSelect = (year: string) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(parseInt(year));
    setCurrentDate(newDate);
  };
  
  const handleMonthSelect = (month: string) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(parseInt(month));
    setCurrentDate(newDate);
  };
  
  const formatMonthName = (monthIndex: number) => {
    return new Date(2000, monthIndex, 1).toLocaleString('default', { month: 'long' });
  };
  
  const goToCurrentPeriod = () => {
    setCurrentDate(new Date());
  };
  
  const formatPeriod = () => {
    if (periodType === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (periodType === 'year') {
      return currentDate.getFullYear().toString();
    } else {
      return 'All Time';
    }
  };
  
  const getFilteredRounds = () => {
    if (!courseRounds) return [];
    
    return courseRounds.filter(round => {
      const roundDate = new Date(round.date);
      
      if (periodType === 'month') {
        return roundDate.getMonth() === currentDate.getMonth() && 
               roundDate.getFullYear() === currentDate.getFullYear();
      } else if (periodType === 'year') {
        return roundDate.getFullYear() === currentDate.getFullYear();
      } else {
        return true;
      }
    });
  };
  
  const filteredRounds = getFilteredRounds();
  const filteredRoundsCount = filteredRounds.length;
  
  const calculateCourseSpecificStats = () => {
    if (courseRounds.length === 0) return null;
    
    const roundsPlayed = courseRounds.length;
    const bestGrossScore = Math.min(...courseRounds.map(r => r.gross_score));
    const bestToPar = Math.min(...courseRounds.map(r => r.to_par_gross));
    
    console.log(`[CourseRoundHistory] Calculating stats with handicap: ${handicapIndex}`);
    
    const roundsWithNetScore = courseRounds.map(r => {
      const calculatedNetScore = Math.round(r.gross_score - handicapIndex);
      const calculatedToParNet = Math.round(r.to_par_gross - handicapIndex);
      
      console.log(`[CourseRoundHistory] Round ${r.id} calculation:`, {
        gross: r.gross_score,
        net: calculatedNetScore,
        toPar: r.to_par_gross,
        toParNet: calculatedToParNet,
        date: new Date(r.date).toLocaleDateString()
      });
      
      return {
        ...r,
        calculatedNetScore,
        calculatedToParNet
      };
    });
    
    const bestNetScore = Math.min(...roundsWithNetScore.map(r => r.calculatedNetScore));
    
    const bestToParNet = Math.min(...roundsWithNetScore.map(r => r.calculatedToParNet));
    
    console.log("[CourseRoundHistory] Rounds with calculated net scores:", 
      roundsWithNetScore.map(r => ({
        id: r.id,
        date: new Date(r.date).toLocaleDateString(),
        gross: r.gross_score,
        net: r.calculatedNetScore,
        toPar: r.to_par_gross,
        toParNet: r.calculatedToParNet
      }))
    );
      
    return { roundsPlayed, bestGrossScore, bestNetScore, bestToPar, bestToParNet };
  };
  
  const stats = calculateCourseSpecificStats();
  
  const courseHoleStats = calculateHoleStats(filteredRounds);
  
  const availableYears = getAvailableYears();
  const availableMonths = getAvailableMonths();
  
  useEffect(() => {
    if (periodType === 'month' && availableMonths.length > 0) {
      if (!availableMonths.includes(currentDate.getMonth())) {
        const newDate = new Date(currentDate);
        newDate.setMonth(availableMonths[0]);
        setCurrentDate(newDate);
      }
    }
  }, [periodType, availableMonths]);
  
  const handleDeleteRound = async () => {
    if (!deletingRoundId) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log(`Deleting round with ID ${deletingRoundId} from Supabase database`);
      
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', deletingRoundId);
        
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
      
      <div className="pb-2">
        <ScoreProgressChart 
          rounds={courseRounds}
          scoreType={scoreType}
          handicapIndex={handicapIndex}
        />
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Course Performance</h3>
        </div>
        
        <div className="bg-background rounded-lg border p-5">
          <Tabs defaultValue="all" onValueChange={(value) => setPeriodType(value as PeriodType)} className="mb-5">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <TabsList className="bg-muted/70">
                  <TabsTrigger value="month" className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Monthly</span>
                  </TabsTrigger>
                  <TabsTrigger value="year" className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>Yearly</span>
                  </TabsTrigger>
                  <TabsTrigger value="all" className="flex items-center gap-1">
                    <History className="h-4 w-4" />
                    <span>All Time</span>
                  </TabsTrigger>
                </TabsList>
                
                <div className="text-sm text-muted-foreground">
                  {filteredRoundsCount} {filteredRoundsCount === 1 ? 'round' : 'rounds'}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 items-center">
                {periodType === 'month' && (
                  <>
                    <div className="flex items-center gap-2">
                      <Select
                        value={currentDate.getFullYear().toString()}
                        onValueChange={handleYearSelect}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableYears.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={currentDate.getMonth().toString()}
                        onValueChange={handleMonthSelect}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMonths.map((month) => (
                            <SelectItem key={month} value={month.toString()}>
                              {formatMonthName(month)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <button 
                      onClick={goToCurrentPeriod} 
                      className="px-3 py-1.5 text-xs font-medium text-primary border border-primary rounded-md hover:bg-primary/10 transition-colors ml-auto"
                    >
                      Show Current Month
                    </button>
                  </>
                )}
                
                {periodType === 'year' && (
                  <>
                    <Select
                      value={currentDate.getFullYear().toString()}
                      onValueChange={handleYearSelect}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableYears.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <button 
                      onClick={goToCurrentPeriod} 
                      className="px-3 py-1.5 text-xs font-medium text-primary border border-primary rounded-md hover:bg-primary/10 transition-colors ml-auto"
                    >
                      Show Current Year
                    </button>
                  </>
                )}
              </div>
            </div>
          </Tabs>
          
          <h4 className="text-base font-medium mb-3">
            {formatPeriod()} Statistics
          </h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            <StatsCard type="eagle" count={courseHoleStats.eagles} />
            <StatsCard type="birdie" count={courseHoleStats.birdies} />
            <StatsCard type="par" count={courseHoleStats.pars} />
            <StatsCard type="bogey" count={courseHoleStats.bogeys} />
            <StatsCard type="doubleBogey" count={courseHoleStats.doubleBogeys} />
            <StatsCard type="other" count={courseHoleStats.others} />
          </div>
          
          <div className="text-sm text-muted-foreground text-center mt-4">
            Total holes played: {courseHoleStats.totalHoles}
          </div>
        </div>
      </div>
      
      <CourseAdvancedStats 
        rounds={courseRounds}
        isLoading={false}
      />
      
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

interface StatsCardProps {
  type: ScoreType;
  count: number;
}

const StatsCard = ({ type, count }: StatsCardProps) => {
  const getColorClass = () => {
    switch(type) {
      case 'eagle': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'birdie': return 'bg-green-50 border-green-200 text-green-700';
      case 'par': return 'bg-gray-50 border-gray-200 text-gray-700';
      case 'bogey': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'doubleBogey': return 'bg-red-50 border-red-200 text-red-700';
      case 'other': return 'bg-purple-50 border-purple-200 text-purple-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };
  
  const getLabel = () => {
    switch(type) {
      case 'doubleBogey': return 'Double Bogey';
      case 'other': return 'Other';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  return (
    <div className={`text-center p-3 rounded-lg ${getColorClass()} border shadow-sm transition-all hover:shadow-md`}>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-sm font-medium">{getLabel()}</p>
    </div>
  );
};

