
import React, { useState, useEffect } from "react";
import { CalendarIcon, TrendingUp, History } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatsCard, ScoreType } from "./StatsCard";

type PeriodType = 'month' | 'year' | 'all';

interface CourseHoleStats {
  eagles: number;
  birdies: number;
  pars: number;
  bogeys: number;
  doubleBogeys: number;
  others: number;
  totalHoles: number;
}

interface CoursePerformanceProps {
  courseHoleStats: CourseHoleStats;
  availableYears: number[];
  availableMonths: number[];
  currentDate: Date;
  periodType: PeriodType;
  setPeriodType: (type: PeriodType) => void;
  setCurrentDate: (date: Date) => void;
  filteredRoundsCount: number;
}

export const CoursePerformance = ({
  courseHoleStats,
  availableYears,
  availableMonths,
  currentDate,
  periodType,
  setPeriodType,
  setCurrentDate,
  filteredRoundsCount
}: CoursePerformanceProps) => {
  
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
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <PieChart className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">Course Performance</h3>
      </div>
      
      <div className="bg-background rounded-lg border p-5">
        <Tabs 
          defaultValue={periodType} 
          onValueChange={(value) => setPeriodType(value as PeriodType)} 
          className="mb-5"
        >
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
  );
};

// Add missing PieChart component
import { PieChart } from "lucide-react";
