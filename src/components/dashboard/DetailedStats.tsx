
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Flag, Clock, History, Calendar as CalendarIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Round } from "./types";

// Define the types of golf scores
type ScoreType = 'eagle' | 'birdie' | 'par' | 'bogey' | 'doubleBogey' | 'other';

// Define the period types for filtering
type PeriodType = 'month' | 'year' | 'all';

interface DetailedStatsProps {
  userRounds: Round[] | undefined;
  isLoading: boolean;
}

export const DetailedStats = ({ userRounds, isLoading }: DetailedStatsProps) => {
  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [stats, setStats] = useState<Record<ScoreType, number>>({
    eagle: 0,
    birdie: 0,
    par: 0,
    bogey: 0,
    doubleBogey: 0,
    other: 0
  });
  
  // Function to navigate to previous period
  const goToPreviousPeriod = () => {
    const newDate = new Date(currentDate);
    if (periodType === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (periodType === 'year') {
      newDate.setFullYear(newDate.getFullYear() - 1);
    }
    setCurrentDate(newDate);
  };
  
  // Function to navigate to next period
  const goToNextPeriod = () => {
    const newDate = new Date(currentDate);
    if (periodType === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (periodType === 'year') {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    
    // Don't allow going to future dates
    if (newDate <= new Date()) {
      setCurrentDate(newDate);
    }
  };
  
  // Function to go to current period
  const goToCurrentPeriod = () => {
    setCurrentDate(new Date());
  };
  
  // Function to format the current period for display
  const formatPeriod = () => {
    if (periodType === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (periodType === 'year') {
      return currentDate.getFullYear().toString();
    } else {
      return 'All Time';
    }
  };
  
  // Filter rounds based on the selected period
  const getFilteredRounds = () => {
    if (!userRounds) return [];
    
    return userRounds.filter(round => {
      const roundDate = new Date(round.date);
      
      if (periodType === 'month') {
        return roundDate.getMonth() === currentDate.getMonth() && 
               roundDate.getFullYear() === currentDate.getFullYear();
      } else if (periodType === 'year') {
        return roundDate.getFullYear() === currentDate.getFullYear();
      } else {
        return true; // All time - no filtering
      }
    });
  };
  
  // Calculate stats based on filtered rounds
  useEffect(() => {
    const filteredRounds = getFilteredRounds();
    const newStats: Record<ScoreType, number> = {
      eagle: 0,
      birdie: 0,
      par: 0,
      bogey: 0,
      doubleBogey: 0,
      other: 0
    };
    
    filteredRounds.forEach(round => {
      // Process hole-by-hole scores if available
      if (round.hole_scores) {
        Object.values(round.hole_scores).forEach((holeScore: any) => {
          const strokes = holeScore.strokes;
          const par = holeScore.par;
          
          if (strokes && par) {
            const relativeToPar = strokes - par;
            
            if (relativeToPar <= -2) newStats.eagle++;
            else if (relativeToPar === -1) newStats.birdie++;
            else if (relativeToPar === 0) newStats.par++;
            else if (relativeToPar === 1) newStats.bogey++;
            else if (relativeToPar === 2) newStats.doubleBogey++;
            else newStats.other++;
          }
        });
      }
    });
    
    setStats(newStats);
    
    console.log("Filtered rounds for stats:", {
      period: periodType,
      date: formatPeriod(),
      roundsCount: filteredRounds.length,
      stats: newStats
    });
  }, [userRounds, periodType, currentDate]);
  
  // Calculate the total number of rounds in the current period
  const roundsInPeriod = getFilteredRounds().length;
  
  if (isLoading) {
    return (
      <div className="flex flex-1 h-60 items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-semibold text-primary">Performance Stats</h2>
      
      <Tabs defaultValue="month" onValueChange={(value) => setPeriodType(value as PeriodType)}>
        <div className="flex items-center justify-between mb-2">
          <TabsList>
            <TabsTrigger value="month" className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              <span>Monthly</span>
            </TabsTrigger>
            <TabsTrigger value="year" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Yearly</span>
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-1">
              <History className="h-4 w-4" />
              <span>All Time</span>
            </TabsTrigger>
          </TabsList>
          
          {periodType !== 'all' && (
            <div className="flex items-center space-x-2">
              <button 
                onClick={goToPreviousPeriod} 
                className="p-1 rounded-full hover:bg-muted transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-primary" />
              </button>
              <button 
                onClick={goToCurrentPeriod} 
                className="text-sm font-medium text-primary hover:underline"
              >
                Current
              </button>
              <button 
                onClick={goToNextPeriod} 
                className="p-1 rounded-full hover:bg-muted transition-colors"
                disabled={new Date(currentDate).setDate(1) >= new Date().setDate(1) && periodType === 'month' || 
                           currentDate.getFullYear() >= new Date().getFullYear() && periodType === 'year'}
              >
                <ChevronRight className={`h-5 w-5 ${new Date(currentDate).setDate(1) >= new Date().setDate(1) && periodType === 'month' || 
                                         currentDate.getFullYear() >= new Date().getFullYear() && periodType === 'year' 
                                         ? 'text-gray-300' : 'text-primary'}`} />
              </button>
            </div>
          )}
        </div>

        <TabsContent value="month" className="mt-0">
          <div className="bg-background rounded-lg p-5 border">
            <h3 className="text-lg font-medium mb-2 flex items-center justify-between">
              <span>{formatPeriod()}</span>
              <span className="text-sm text-muted-foreground">{roundsInPeriod} {roundsInPeriod === 1 ? 'round' : 'rounds'}</span>
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(stats).map(([type, count]) => (
                <div key={type} className="text-center p-3 rounded-lg bg-background border">
                  <p className="text-2xl font-bold text-primary">{count}</p>
                  <p className="text-sm font-medium capitalize">{type === 'doubleBogey' ? 'Double Bogey+' : type}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="year" className="mt-0">
          <div className="bg-background rounded-lg p-5 border">
            <h3 className="text-lg font-medium mb-2 flex items-center justify-between">
              <span>{formatPeriod()}</span>
              <span className="text-sm text-muted-foreground">{roundsInPeriod} {roundsInPeriod === 1 ? 'round' : 'rounds'}</span>
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(stats).map(([type, count]) => (
                <div key={type} className="text-center p-3 rounded-lg bg-background border">
                  <p className="text-2xl font-bold text-primary">{count}</p>
                  <p className="text-sm font-medium capitalize">{type === 'doubleBogey' ? 'Double Bogey+' : type}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="all" className="mt-0">
          <div className="bg-background rounded-lg p-5 border">
            <h3 className="text-lg font-medium mb-2 flex items-center justify-between">
              <span>All Time Stats</span>
              <span className="text-sm text-muted-foreground">{roundsInPeriod} {roundsInPeriod === 1 ? 'round' : 'rounds'}</span>
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(stats).map(([type, count]) => (
                <div key={type} className="text-center p-3 rounded-lg bg-background border">
                  <p className="text-2xl font-bold text-primary">{count}</p>
                  <p className="text-sm font-medium capitalize">{type === 'doubleBogey' ? 'Double Bogey+' : type}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
