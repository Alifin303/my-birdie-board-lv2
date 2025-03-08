
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Flag, Clock, History, Calendar as CalendarIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  
  // Get available years from rounds
  const getAvailableYears = () => {
    if (!userRounds?.length) return [new Date().getFullYear()];
    
    const years = userRounds.map(round => new Date(round.date).getFullYear());
    return [...new Set(years)].sort((a, b) => b - a); // Unique years in descending order
  };
  
  // Get available months for the selected year
  const getAvailableMonths = () => {
    if (!userRounds?.length) return Array.from({ length: 12 }, (_, i) => i);
    
    const selectedYear = currentDate.getFullYear();
    const months = userRounds
      .filter(round => new Date(round.date).getFullYear() === selectedYear)
      .map(round => new Date(round.date).getMonth());
    
    return [...new Set(months)].sort((a, b) => b - a); // Unique months in descending order
  };
  
  // Handle year selection
  const handleYearSelect = (year: string) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(parseInt(year));
    setCurrentDate(newDate);
  };
  
  // Handle month selection
  const handleMonthSelect = (month: string) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(parseInt(month));
    setCurrentDate(newDate);
  };
  
  // Format month number to name
  const formatMonthName = (monthIndex: number) => {
    return new Date(2000, monthIndex, 1).toLocaleString('default', { month: 'long' });
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
  
  // Available years and months
  const availableYears = getAvailableYears();
  const availableMonths = getAvailableMonths();
  
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
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
          
          {periodType === 'month' && (
            <div className="flex items-center gap-2">
              <Select
                value={currentDate.getMonth().toString()}
                onValueChange={handleMonthSelect}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {formatMonthName(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={currentDate.getFullYear().toString()}
                onValueChange={handleYearSelect}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Select year" />
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
                className="ml-1 px-2 py-1 text-xs font-medium text-primary border border-primary rounded-md hover:bg-primary/10 transition-colors"
              >
                Current
              </button>
            </div>
          )}
          
          {periodType === 'year' && (
            <div className="flex items-center gap-2">
              <Select
                value={currentDate.getFullYear().toString()}
                onValueChange={handleYearSelect}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Select year" />
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
                className="ml-1 px-2 py-1 text-xs font-medium text-primary border border-primary rounded-md hover:bg-primary/10 transition-colors"
              >
                Current
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
