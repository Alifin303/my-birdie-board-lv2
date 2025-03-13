
import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, History, TrendingUp } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Round } from "./types";
import { calculateHoleStats } from "@/utils/statsCalculator";

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
    
    if (periodType !== 'month') return [];
    
    const selectedYear = currentDate.getFullYear();
    const months = userRounds
      .filter(round => new Date(round.date).getFullYear() === selectedYear)
      .map(round => new Date(round.date).getMonth());
    
    const availableMonths = [...new Set(months)].sort((a, b) => a - b);
    
    // If no months found for the year, return all months
    return availableMonths.length ? availableMonths : Array.from({ length: 12 }, (_, i) => i);
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
    console.log("Filtered rounds for stats calculation:", filteredRounds.length);
    
    if (filteredRounds.length === 0) {
      setStats({
        eagle: 0,
        birdie: 0,
        par: 0,
        bogey: 0,
        doubleBogey: 0,
        other: 0
      });
      return;
    }
    
    // Use the calculateHoleStats utility function
    const holeStats = calculateHoleStats(filteredRounds);
    
    // Map the hole stats to our component's state format
    const newStats: Record<ScoreType, number> = {
      eagle: holeStats.eagles,
      birdie: holeStats.birdies,
      par: holeStats.pars,
      bogey: holeStats.bogeys,
      doubleBogey: holeStats.doubleBogeys,
      other: holeStats.others
    };
    
    console.log("Setting stats:", newStats);
    setStats(newStats);
  }, [userRounds, periodType, currentDate]);
  
  // Calculate the total number of rounds in the current period
  const roundsInPeriod = getFilteredRounds().length;
  
  // Available years and months
  const availableYears = getAvailableYears();
  const availableMonths = getAvailableMonths();

  // Initialize the default month
  useEffect(() => {
    if (periodType === 'month' && availableMonths.length > 0) {
      // If current month is not available, select the first available month
      if (!availableMonths.includes(currentDate.getMonth())) {
        const newDate = new Date(currentDate);
        newDate.setMonth(availableMonths[0]);
        setCurrentDate(newDate);
      }
    }
  }, [periodType, availableMonths]);
  
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
      
      <div className="bg-background rounded-lg p-5 border shadow-sm">
        <Tabs defaultValue="month" onValueChange={(value) => setPeriodType(value as PeriodType)}>
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
                {roundsInPeriod} {roundsInPeriod === 1 ? 'round' : 'rounds'}
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

          <div className="mt-4 pt-3 border-t">
            <h3 className="text-base font-medium mb-3">{formatPeriod()} Statistics</h3>
            
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <StatsCard type="eagle" count={stats.eagle} />
              <StatsCard type="birdie" count={stats.birdie} />
              <StatsCard type="par" count={stats.par} />
              <StatsCard type="bogey" count={stats.bogey} />
              <StatsCard type="doubleBogey" count={stats.doubleBogey} />
              <StatsCard type="other" count={stats.other} />
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

interface StatsCardProps {
  type: ScoreType;
  count: number;
}

const StatsCard = ({ type, count }: StatsCardProps) => {
  // Assign color based on score type
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
