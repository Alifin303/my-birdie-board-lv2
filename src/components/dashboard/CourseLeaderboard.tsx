
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/core/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface LeaderboardEntry {
  id: number;
  date: string;
  username: string;
  score: number;
  isCurrentUser: boolean;
  rank?: number;
  tee_name?: string;
  user_id?: string; // Added to help with debugging
}

interface CourseLeaderboardProps {
  courseId: number;
  courseName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handicapIndex?: number;
}

export const CourseLeaderboard = ({ 
  courseId, 
  courseName, 
  open, 
  onOpenChange, 
  handicapIndex = 0 
}: CourseLeaderboardProps) => {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<'monthly' | 'yearly' | 'all-time'>('monthly');
  const [scoreType, setScoreType] = useState<'gross' | 'net'>('gross');
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(new Date());
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userBestScore, setUserBestScore] = useState<LeaderboardEntry | null>(null);
  const [availableTees, setAvailableTees] = useState<string[]>([]);
  const [selectedTee, setSelectedTee] = useState<string | null>(null);
  
  const itemsPerPage = 10;
  
  const fetchAvailableTees = async () => {
    try {
      const { data, error } = await supabase
        .from('rounds')
        .select('tee_name')
        .eq('course_id', courseId)
        .not('tee_name', 'is', null);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const tees = [...new Set(data.map(round => round.tee_name).filter(Boolean))];
        setAvailableTees(tees);
      }
    } catch (error) {
      console.error("Error fetching available tees:", error);
    }
  };
  
  const fetchAvailableYears = async () => {
    try {
      const { data, error } = await supabase
        .from('rounds')
        .select('date')
        .eq('course_id', courseId)
        .order('date', { ascending: false });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const years = [...new Set(data.map(round => new Date(round.date).getFullYear().toString()))];
        setAvailableYears(years.sort((a, b) => parseInt(b) - parseInt(a)));
        
        if (years.length > 0) {
          setSelectedYear(years[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching available years:", error);
    }
  };
  
  const fetchLeaderboard = async () => {
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "You need to be logged in to view leaderboards.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      const currentUserId = session.user.id;
      console.log("Current user ID:", currentUserId);
      
      let dateFilter = {};
      if (dateRange === 'monthly' && selectedMonth) {
        const startDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
        const endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
        
        dateFilter = {
          gte: startDate.toISOString(),
          lte: endDate.toISOString()
        };
      } else if (dateRange === 'yearly') {
        const startDate = new Date(parseInt(selectedYear), 0, 1);
        const endDate = new Date(parseInt(selectedYear), 11, 31);
        
        dateFilter = {
          gte: startDate.toISOString(),
          lte: endDate.toISOString()
        };
      }
      
      let query = supabase
        .from('rounds')
        .select(`
          id,
          date,
          gross_score,
          net_score,
          user_id,
          tee_name
        `)
        .eq('course_id', courseId);
        
      if (selectedTee) {
        query = query.eq('tee_name', selectedTee);
      }
      
      if (dateRange !== 'all-time') {
        query = query.filter('date', 'gte', (dateFilter as any).gte)
                    .filter('date', 'lte', (dateFilter as any).lte);
      }
      
      const { data: roundsData, error: roundsError } = await query;
      
      if (roundsError) throw roundsError;
      
      console.log("Fetched rounds data:", roundsData);
      
      if (!roundsData || roundsData.length === 0) {
        setLeaderboard([]);
        setUserRank(null);
        setUserBestScore(null);
        setTotalPages(1);
        toast({
          title: "No rounds found",
          description: "No rounds were found for the selected filters.",
        });
        setIsLoading(false);
        return;
      }
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }
      
      console.log("Fetched profiles data:", profilesData);
      
      if (!profilesData || profilesData.length === 0) {
        console.error("No profiles found");
        toast({
          title: "Error",
          description: "Could not retrieve player information.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      const userMap = new Map();
      profilesData.forEach(profile => {
        // Create a display name by prioritizing username, then combining first/last name, or using fallbacks
        let displayName = profile.username;
        
        if (!displayName && (profile.first_name || profile.last_name)) {
          displayName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
        }
        
        userMap.set(profile.id, displayName || 'Unknown Player');
      });
      
      console.log("User map created:", Array.from(userMap.entries()));
      console.log("Query result data:", roundsData);
      
      let processedData = roundsData.map(round => {
        const username = userMap.get(round.user_id) || 'Unknown Player';
        
        const score = scoreType === 'gross' 
          ? round.gross_score 
          : (round.net_score || (handicapIndex > 0 ? Math.max(0, round.gross_score - handicapIndex) : round.gross_score));
            
        return {
          id: round.id,
          date: round.date,
          username: username,
          score: score,
          isCurrentUser: round.user_id === currentUserId,
          tee_name: round.tee_name,
          user_id: round.user_id // Added for debugging
        };
      });
      
      processedData.sort((a, b) => a.score - b.score);
      
      processedData = processedData.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
      
      const userEntries = processedData.filter(entry => entry.isCurrentUser);
      if (userEntries.length > 0) {
        const bestUserEntry = userEntries.reduce((prev, current) => 
          prev.score < current.score ? prev : current
        ) as LeaderboardEntry;
        
        setUserRank(bestUserEntry.rank !== undefined ? bestUserEntry.rank : null);
        setUserBestScore(bestUserEntry);
      } else {
        setUserRank(null);
        setUserBestScore(null);
      }
      
      console.log("Processed leaderboard data:", processedData);
      console.log("Number of unique users:", new Set(processedData.map(entry => entry.user_id)).size);
      
      setTotalPages(Math.ceil(processedData.length / itemsPerPage));
      setCurrentPage(1);
      
      setLeaderboard(processedData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      toast({
        title: "Error",
        description: "Failed to load leaderboard data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearch = () => {
    fetchLeaderboard();
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return leaderboard.slice(startIndex, endIndex);
  };
  
  const handleDialogOpen = (isOpen: boolean) => {
    if (isOpen) {
      fetchAvailableYears();
      fetchAvailableTees();
    }
    onOpenChange(isOpen);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleDialogOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{courseName} Leaderboards</DialogTitle>
          <DialogDescription>
            Compare your scores with other players on this course.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select 
                value={dateRange} 
                onValueChange={(value) => setDateRange(value as 'monthly' | 'yearly' | 'all-time')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="all-time">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {dateRange === 'monthly' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Month</label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedMonth ? format(selectedMonth, 'MMMM yyyy') : 'Select month'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedMonth}
                      onSelect={(date) => {
                        setSelectedMonth(date);
                        setCalendarOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
            
            {dateRange === 'yearly' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <Select 
                  value={selectedYear} 
                  onValueChange={setSelectedYear}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tee</label>
              <Select 
                value={selectedTee || "all"} 
                onValueChange={(value) => setSelectedTee(value === "all" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Tees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tees</SelectItem>
                  {availableTees.map(tee => (
                    <SelectItem key={tee} value={tee}>{tee}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Score Type</label>
              <Select 
                value={scoreType} 
                onValueChange={(value) => setScoreType(value as 'gross' | 'net')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select score type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gross">Gross Score</SelectItem>
                  <SelectItem value="net">Net Score</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end sm:col-span-2">
              <Button 
                onClick={handleSearch} 
                className="w-full"
                disabled={isLoading}
              >
                <Search className="h-4 w-4 mr-2" />
                Search Leaderboard
              </Button>
            </div>
          </div>
          
          {userBestScore && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
              <h3 className="text-md font-semibold mb-2">Your Best Round</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm">Date: {format(new Date(userBestScore.date), 'MMM d, yyyy')}</p>
                  <p className="text-sm">Score: {userBestScore.score}</p>
                  {userBestScore.tee_name && <p className="text-sm">Tee: {userBestScore.tee_name}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Rank</p>
                  <p className="text-xl font-bold text-primary">#{userRank}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Rank</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Player</th>
                  {availableTees.length > 0 && <th className="text-left p-3 text-sm font-medium text-muted-foreground">Tee</th>}
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">Score</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={availableTees.length > 0 ? 5 : 4} className="text-center p-8">
                      <p className="text-muted-foreground">Loading leaderboard data...</p>
                    </td>
                  </tr>
                ) : leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={availableTees.length > 0 ? 5 : 4} className="text-center p-8">
                      <p className="text-muted-foreground">No leaderboard data available. Try different filters or search again.</p>
                    </td>
                  </tr>
                ) : (
                  getCurrentPageItems().map((entry) => (
                    <tr 
                      key={`${entry.id}-${entry.username}`} 
                      className={`border-b last:border-0 ${entry.isCurrentUser ? 'bg-primary/5' : ''}`}
                    >
                      <td className="p-3 text-sm">{entry.rank}</td>
                      <td className="p-3 text-sm">{format(new Date(entry.date), 'MMM d, yyyy')}</td>
                      <td className="p-3 text-sm font-medium">
                        {entry.username}
                        {entry.isCurrentUser && <span className="ml-2 text-xs text-primary">(You)</span>}
                      </td>
                      {availableTees.length > 0 && <td className="p-3 text-sm">{entry.tee_name || 'N/A'}</td>}
                      <td className="p-3 text-sm text-right">{entry.score}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {leaderboard.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Prev
              </Button>
              
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
