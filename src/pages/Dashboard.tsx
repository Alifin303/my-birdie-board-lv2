
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut, Trophy, ChevronUp, ChevronDown, Flag, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase, parseCourseName } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AddRoundModal } from "@/components/AddRoundModal";
import { DebugPanel } from "@/components/DebugPanel";

interface Round {
  id: number;
  date: string;
  tee_name: string;
  gross_score: number;
  net_score?: number;
  to_par_gross: number;
  to_par_net?: number;
  courses?: {
    id: number;
    name: string;
    city?: string;
    state?: string;
  };
}

interface CourseStats {
  courseId: number;
  courseName: string;
  clubName: string; // Added for clarity
  city?: string;
  state?: string;
  roundsPlayed: number;
  bestGrossScore: number;
  bestNetScore: number | null;
  bestToPar: number;
  bestToParNet: number | null;
}

interface Stats {
  totalRounds: number;
  bestGrossScore: number;
  bestNetScore: number | null;
  bestToPar: number;
  bestToParNet: number | null;
  averageScore: number;
  handicapIndex: number;
  roundsNeededForHandicap: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [scoreType, setScoreType] = useState<'gross' | 'net'>('gross');
  const [sortField, setSortField] = useState<keyof CourseStats>('courseName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Debug flag for development
  const [showDebugPanel, setShowDebugPanel] = useState(true);

  useEffect(() => {
    console.log("Modal state changed:", isModalOpen);
  }, [isModalOpen]);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (error) throw error;
      return data;
    }
  });

  const { data: userRounds, isLoading: roundsLoading } = useQuery({
    queryKey: ['userRounds'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');
      
      console.log("Fetching user rounds...");
      const { data, error } = await supabase
        .from('rounds')
        .select(`
          *,
          courses:course_id(id, name, city, state)
        `)
        .eq('user_id', session.user.id)
        .order('date', { ascending: false });
        
      if (error) {
        console.error("Error fetching user rounds:", error);
        throw error;
      }
      
      console.log("Fetched rounds data from Supabase:", data);
      
      // Process rounds to include parsed course names
      const processedRounds = data?.map(round => {
        let parsedNames = { clubName: "Unknown Club", courseName: "Unknown Course" };
        
        // Try to parse the course name if available
        if (round.courses && round.courses.name) {
          parsedNames = parseCourseName(round.courses.name);
        }
        
        return {
          ...round,
          courses: round.courses ? {
            ...round.courses,
            clubName: parsedNames.clubName,
            courseName: parsedNames.courseName
          } : undefined
        };
      }) || [];
      
      console.log("Processed rounds with parsed course names:", processedRounds);
      
      return processedRounds as Round[];
    }
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderProfileContent = () => {
    if (!profile) return null;
    return (
      <div className="space-y-4">
        <div>
          <p><strong>Name:</strong> {profile.first_name} {profile.last_name}</p>
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Handicap:</strong> {profile.handicap || 'Not set'}</p>
        </div>
      </div>
    );
  };

  const handleOpenModal = () => {
    console.log("Opening modal...");
    setIsModalOpen(true);
  };

  // Calculate overall user stats from rounds
  const calculateStats = (rounds: Round[]): Stats => {
    const ROUNDS_NEEDED_FOR_HANDICAP = 5;
    
    if (!rounds || rounds.length === 0) {
      return {
        totalRounds: 0,
        bestGrossScore: 0,
        bestNetScore: null,
        bestToPar: 0,
        bestToParNet: null,
        averageScore: 0,
        handicapIndex: 0,
        roundsNeededForHandicap: ROUNDS_NEEDED_FOR_HANDICAP
      };
    }

    // Filter out incomplete rounds and par-3 only courses for handicap calculation
    const validRoundsForHandicap = rounds.filter(round => {
      // Here we're assuming incomplete rounds would have either undefined scores
      // or some indicator in the data structure. Adjust based on your data model.
      const isComplete = round.gross_score > 0;
      
      // For par-3 courses, you'd need some indicator in your data model
      // This is a placeholder - replace with actual logic based on your data
      const isPar3OnlyCourse = false; // Implement actual check based on your data
      
      return isComplete && !isPar3OnlyCourse;
    });

    const totalRounds = rounds.length;
    const bestGrossScore = Math.min(...rounds.map(r => r.gross_score));
    const bestToPar = Math.min(...rounds.map(r => r.to_par_gross));
    
    // Net scores may not be available for all rounds
    const roundsWithNetScore = rounds.filter(r => r.net_score !== undefined && r.to_par_net !== undefined);
    const bestNetScore = roundsWithNetScore.length > 0 ? 
      Math.min(...roundsWithNetScore.map(r => r.net_score!)) : null;
    const bestToParNet = roundsWithNetScore.length > 0 ? 
      Math.min(...roundsWithNetScore.map(r => r.to_par_net!)) : null;
    
    const averageScore = rounds.reduce((sum, r) => sum + r.gross_score, 0) / totalRounds;
    
    // Calculate handicap based on official handicap system
    // This follows a simplified version of the World Handicap System
    // Best 8 of last 20 rounds for established players
    const validRoundsCount = validRoundsForHandicap.length;
    
    // Calculate differentials (adjusted gross score - course rating) * 113 / slope rating
    // For simplicity we're using to_par_gross as a proxy for differentials
    // In a real system, you'd need course rating and slope rating
    const differentials = validRoundsForHandicap.map(round => (round.to_par_gross));
    differentials.sort((a, b) => a - b);
    
    // Number of scores to use depends on how many rounds are available
    let scoresToUse = 0;
    if (validRoundsCount >= 20) scoresToUse = 8;       // Use best 8 of 20
    else if (validRoundsCount >= 15) scoresToUse = 6;  // Use best 6 of 15-19
    else if (validRoundsCount >= 10) scoresToUse = 4;  // Use best 4 of 10-14
    else if (validRoundsCount >= 5) scoresToUse = 3;   // Use best 3 of 5-9
    else scoresToUse = 0;                             // Not enough rounds
    
    const bestDifferentials = differentials.slice(0, scoresToUse);
    const averageDifferential = bestDifferentials.length > 0 ? 
      bestDifferentials.reduce((sum, diff) => sum + diff, 0) / bestDifferentials.length : 0;
    
    // Apply handicap formula (0.96 multiplier as per WHS)
    const handicapIndex = scoresToUse > 0 ? 
      Math.max(0, Math.round(averageDifferential * 0.96 * 10) / 10) : 0;
    
    const roundsNeededForHandicap = validRoundsCount >= ROUNDS_NEEDED_FOR_HANDICAP ? 
      0 : ROUNDS_NEEDED_FOR_HANDICAP - validRoundsCount;

    return {
      totalRounds,
      bestGrossScore,
      bestNetScore,
      bestToPar,
      bestToParNet,
      averageScore,
      handicapIndex,
      roundsNeededForHandicap
    };
  };

  // Group rounds by course and calculate course stats
  const calculateCourseStats = (rounds: Round[]): CourseStats[] => {
    if (!rounds || rounds.length === 0) return [];
  
    // Group rounds by course
    const courseMap = new Map<number, Round[]>();
    
    rounds.forEach(round => {
      if (round.courses) {
        const courseId = round.courses.id;
        if (!courseMap.has(courseId)) {
          courseMap.set(courseId, []);
        }
        courseMap.get(courseId)!.push(round);
      }
    });
  
    // Calculate stats for each course
    return Array.from(courseMap.entries()).map(([courseId, courseRounds]) => {
      const firstRound = courseRounds[0]; // For course name and details
      
      // Get course name, handling possible formatting in the database
      let courseName = "Unknown Course";
      let clubName = "Unknown Club";
      
      if (firstRound.courses) {
        if (firstRound.courses.name) {
          // Parse the stored name into club and course components
          const { clubName: parsedClub, courseName: parsedCourse } = parseCourseName(firstRound.courses.name);
          clubName = parsedClub;
          courseName = parsedCourse;
          
          console.log(`Course ID ${courseId} parsed as: Club = "${clubName}", Course = "${courseName}"`);
        }
      }
      
      const roundsPlayed = courseRounds.length;
      const bestGrossScore = Math.min(...courseRounds.map(r => r.gross_score));
      const bestToPar = Math.min(...courseRounds.map(r => r.to_par_gross));
      
      // Net scores may not be available for all rounds
      const roundsWithNetScore = courseRounds.filter(r => r.net_score !== undefined && r.to_par_net !== undefined);
      const bestNetScore = roundsWithNetScore.length > 0 ? 
        Math.min(...roundsWithNetScore.map(r => r.net_score!)) : null;
      const bestToParNet = roundsWithNetScore.length > 0 ? 
        Math.min(...roundsWithNetScore.map(r => r.to_par_net!)) : null;
  
      return {
        courseId,
        courseName,
        clubName,
        city: firstRound.courses?.city,
        state: firstRound.courses?.state,
        roundsPlayed,
        bestGrossScore,
        bestNetScore,
        bestToPar,
        bestToParNet
      };
    });
  };

  // Main Stats Display
  const renderMainStats = () => {
    if (roundsLoading || !userRounds) {
      return (
        <div className="grid grid-cols-3 gap-6 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-background/50 animate-pulse h-24 rounded-lg border"></div>
          ))}
        </div>
      );
    }

    const stats = calculateStats(userRounds);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-background rounded-lg p-5 border">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Rounds Played</p>
              <p className="text-3xl font-bold">{stats.totalRounds}</p>
            </div>
            <div className="h-12 w-12 rounded-full flex items-center justify-center bg-primary/10">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="bg-background rounded-lg p-5 border">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Best Score</p>
              <p className="text-3xl font-bold">{scoreType === 'gross' ? stats.bestGrossScore : (stats.bestNetScore || '-')}</p>
            </div>
            <div className="h-12 w-12 rounded-full flex items-center justify-center bg-primary/10">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="bg-background rounded-lg p-5 border">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Best to Par</p>
              <p className="text-3xl font-bold">
                {scoreType === 'gross' 
                  ? (stats.bestToPar > 0 ? '+' : '') + stats.bestToPar 
                  : stats.bestToParNet !== null 
                    ? (stats.bestToParNet > 0 ? '+' : '') + stats.bestToParNet 
                    : '-'}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full flex items-center justify-center bg-primary/10">
              <Flag className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Handicap Circle Display
  const renderHandicapCircle = () => {
    if (roundsLoading || !userRounds) {
      return (
        <div className="flex justify-center mb-8">
          <div className="w-60 h-60 rounded-full border-8 border-muted animate-pulse flex items-center justify-center">
          </div>
        </div>
      );
    }
    
    const stats = calculateStats(userRounds);
    const hasHandicap = stats.roundsNeededForHandicap === 0;
    
    return (
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="relative mb-3">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setScoreType('gross')} 
              className={`px-3 py-1 rounded-full text-sm font-medium ${scoreType === 'gross' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
            >
              Gross
            </button>
            <button 
              onClick={() => setScoreType('net')} 
              className={`px-3 py-1 rounded-full text-sm font-medium ${scoreType === 'net' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
            >
              Net
            </button>
          </div>
        </div>
        
        <div className="w-60 h-60 rounded-full border-8 border-primary flex items-center justify-center">
          <div className="text-center px-6">
            {hasHandicap ? (
              <>
                <p className="text-sm font-medium text-muted-foreground">Handicap Index</p>
                <p className="text-5xl font-bold my-2">{stats.handicapIndex}</p>
                <p className="text-sm text-muted-foreground">Based on {stats.totalRounds} rounds</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-muted-foreground">Handicap Status</p>
                <p className="text-xl font-bold my-3">You need {stats.roundsNeededForHandicap} more {stats.roundsNeededForHandicap === 1 ? 'round' : 'rounds'} to get your handicap.</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Course Stats Table - updated to better show sortable columns
  const renderCourseStatsTable = () => {
    if (!userRounds || userRounds.length === 0) {
      return (
        <div className="text-center p-6 bg-muted rounded-lg">
          <p className="text-lg">You haven't added any rounds yet.</p>
          <p className="text-muted-foreground">Click "Add a New Round" to get started!</p>
        </div>
      );
    }

    const courseStats = calculateCourseStats(userRounds);
    console.log("Calculated course stats:", courseStats);
    
    // Sort course stats
    const sortedCourseStats = [...courseStats].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === null) return 1;
      if (bValue === null) return -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // @ts-ignore - we know these are numbers at this point
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

    const handleSort = (field: keyof CourseStats) => {
      if (sortField === field) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    };

    const handleCourseClick = (courseId: number) => {
      setSelectedCourseId(courseId);
    };

    // Helper function to render sort indicator
    const renderSortIndicator = (field: keyof CourseStats) => {
      if (sortField !== field) {
        return <span className="text-muted-foreground opacity-50 ml-1">↕️</span>;
      }
      return sortDirection === 'asc' 
        ? <ChevronUp className="inline-block h-4 w-4 ml-1" /> 
        : <ChevronDown className="inline-block h-4 w-4 ml-1" />;
    };

    return (
      <div className="overflow-x-auto rounded-lg border bg-background">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort('courseName')}
                  className="flex items-center cursor-pointer hover:text-primary transition-colors"
                >
                  <span>Course</span>
                  {renderSortIndicator('courseName')}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort('roundsPlayed')}
                  className="flex items-center cursor-pointer hover:text-primary transition-colors"
                >
                  <span>Rounds Played</span>
                  {renderSortIndicator('roundsPlayed')}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort(scoreType === 'gross' ? 'bestGrossScore' : 'bestNetScore')}
                  className="flex items-center cursor-pointer hover:text-primary transition-colors"
                >
                  <span>Best Score</span>
                  {renderSortIndicator(scoreType === 'gross' ? 'bestGrossScore' : 'bestNetScore')}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort(scoreType === 'gross' ? 'bestToPar' : 'bestToParNet')}
                  className="flex items-center cursor-pointer hover:text-primary transition-colors"
                >
                  <span>Best to Par</span>
                  {renderSortIndicator(scoreType === 'gross' ? 'bestToPar' : 'bestToParNet')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedCourseStats.map((courseStat) => (
              <tr key={courseStat.courseId} className="border-b last:border-0">
                <td className="px-4 py-3 text-sm font-medium">
                  <button 
                    className="hover:underline text-primary"
                    onClick={() => handleCourseClick(courseStat.courseId)}
                  >
                    {courseStat.clubName !== courseStat.courseName 
                      ? `${courseStat.clubName} - ${courseStat.courseName}`
                      : courseStat.courseName}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    {courseStat.city}{courseStat.state ? `, ${courseStat.state}` : ''}
                  </p>
                </td>
                <td className="px-4 py-3 text-sm">
                  {courseStat.roundsPlayed}
                </td>
                <td className="px-4 py-3 text-sm">
                  {scoreType === 'gross' 
                    ? courseStat.bestGrossScore 
                    : courseStat.bestNetScore !== null ? courseStat.bestNetScore : '-'}
                </td>
                <td className="px-4 py-3 text-sm">
                  {scoreType === 'gross' 
                    ? (courseStat.bestToPar > 0 ? '+' : '') + courseStat.bestToPar
                    : courseStat.bestToParNet !== null 
                      ? (courseStat.bestToParNet > 0 ? '+' : '') + courseStat.bestToParNet
                      : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Course Round History
  const renderCourseRoundHistory = () => {
    if (!userRounds || !selectedCourseId) return null;
    
    const courseRounds = userRounds.filter(
      round => round.courses && round.courses.id === selectedCourseId
    );
    
    if (courseRounds.length === 0) return null;
    
    // Get course name, properly formatted
    let courseName = "Course";
    let clubName = "Unknown Club";
    
    if (courseRounds[0].courses?.name) {
      const { clubName: parsedClub, courseName: parsedCourse } = parseCourseName(courseRounds[0].courses.name);
      clubName = parsedClub;
      courseName = parsedCourse;
    }
    
    const displayName = clubName !== courseName 
      ? `${clubName} - ${courseName}`
      : courseName;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold flex items-center">
            <button 
              className="mr-2 p-1 hover:bg-muted rounded"
              onClick={() => setSelectedCourseId(null)}
            >
              <ChevronUp className="h-5 w-5" />
            </button>
            {displayName} Rounds
          </h2>
        </div>
        
        <div className="space-y-4">
          {courseRounds.map((round) => (
            <div key={round.id} className="bg-background border rounded-md p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{new Date(round.date).toLocaleDateString()}</p>
                  <p className="text-sm text-muted-foreground">{round.tee_name} Tees</p>
                </div>
                <div className="text-right">
                  <p>
                    Gross: {round.gross_score} 
                    <span className="text-muted-foreground ml-1">
                      ({round.to_par_gross > 0 ? '+' : ''}{round.to_par_gross})
                    </span>
                  </p>
                  {round.net_score !== undefined && (
                    <p>
                      Net: {round.net_score}
                      <span className="text-muted-foreground ml-1">
                        ({round.to_par_net !== undefined ? (round.to_par_net > 0 ? '+' : '') + round.to_par_net : ''})
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Main dashboard content
  const renderDashboard = () => {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {profile?.first_name || 'Golfer'}!</h1>
          </div>
          <Button 
            onClick={handleOpenModal}
            className="relative"
          >
            Add a New Round
          </Button>
        </div>
        
        {/* Main Stats Display */}
        {renderMainStats()}
        
        {/* Handicap Circle */}
        {renderHandicapCircle()}
        
        {/* Course Stats or Round History */}
        <div className="space-y-4">
          {selectedCourseId 
            ? renderCourseRoundHistory() 
            : (
              <>
                <h2 className="text-2xl font-semibold">Your Courses</h2>
                {renderCourseStatsTable()}
              </>
            )
          }
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="absolute top-4 right-4 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="lg" className="rounded-full h-12 w-12 flex items-center justify-center border border-muted bg-background/80 backdrop-blur-sm">
              <User className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => {
                  e.preventDefault();
                  setProfileDialogOpen(true);
                }}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Profile Settings</DialogTitle>
                  <DialogDescription>
                    Update your profile information
                  </DialogDescription>
                </DialogHeader>
                {renderProfileContent()}
              </DialogContent>
            </Dialog>
            
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {renderDashboard()}

      <AddRoundModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
      />
      
      {/* Debug Panel for development */}
      {showDebugPanel && <DebugPanel />}
    </div>
  );
}
