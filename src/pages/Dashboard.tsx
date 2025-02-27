import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut, Trophy, Star, ChevronUp, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AddRoundModal } from "@/components/AddRoundModal";

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

interface Stats {
  totalRounds: number;
  bestGrossScore: number;
  bestNetScore: number;
  averageScore: number;
  handicapIndex: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

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

  const { data: userRounds } = useQuery({
    queryKey: ['userRounds'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');
      
      const { data, error } = await supabase
        .from('rounds')
        .select(`
          *,
          courses:course_id(id, name, city, state)
        `)
        .eq('user_id', session.user.id)
        .order('date', { ascending: false });
        
      if (error) throw error;
      return data as Round[] || [];
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

  const calculateStats = (rounds: Round[]): Stats => {
    if (!rounds || rounds.length === 0) {
      return {
        totalRounds: 0,
        bestGrossScore: 0,
        bestNetScore: 0,
        averageScore: 0,
        handicapIndex: 0
      };
    }

    const totalRounds = rounds.length;
    const bestGrossScore = Math.min(...rounds.map(r => r.gross_score));
    const bestNetScore = Math.min(...rounds.filter(r => r.net_score !== undefined).map(r => r.net_score!));
    const averageScore = rounds.reduce((sum, r) => sum + r.gross_score, 0) / totalRounds;
    
    const handicapIndex = rounds.length >= 5 ? 
      ((averageScore - 72) * 0.96) : // Simplified handicap calculation
      0;

    return {
      totalRounds,
      bestGrossScore,
      bestNetScore,
      averageScore,
      handicapIndex: Math.round(handicapIndex * 10) / 10
    };
  };

  const renderStats = () => {
    if (!userRounds) return null;
    
    const stats = calculateStats(userRounds);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-background border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Rounds Played</h3>
          <p className="text-2xl font-bold">{stats.totalRounds}</p>
        </div>
        <div className="bg-background border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Best Gross Score</h3>
          <p className="text-2xl font-bold flex items-center">
            {stats.bestGrossScore} <Trophy className="ml-2 h-5 w-5 text-yellow-500" />
          </p>
        </div>
        <div className="bg-background border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Best Net Score</h3>
          <p className="text-2xl font-bold flex items-center">
            {stats.bestNetScore} <Star className="ml-2 h-5 w-5 text-yellow-500" />
          </p>
        </div>
        <div className="bg-background border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Handicap Index</h3>
          <p className="text-2xl font-bold">{stats.handicapIndex}</p>
        </div>
      </div>
    );
  };

  const renderRoundsTable = () => {
    if (!userRounds || userRounds.length === 0) {
      return (
        <div className="text-center p-6 bg-muted rounded-lg">
          <p className="text-lg">You haven't added any rounds yet.</p>
          <p className="text-muted-foreground">Click "Add a New Round" to get started!</p>
        </div>
      );
    }

    const [sortField, setSortField] = useState<keyof Round>('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const sortedRounds = [...userRounds].sort((a, b) => {
      if (sortField === 'date') {
        return sortDirection === 'desc' 
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return sortDirection === 'desc'
        ? (b[sortField] as number) - (a[sortField] as number)
        : (a[sortField] as number) - (b[sortField] as number);
    });

    const handleSort = (field: keyof Round) => {
      if (sortField === field) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortDirection('desc');
      }
    };

    return (
      <div className="overflow-x-auto rounded-lg border bg-background">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center space-x-1"
                >
                  <span>Date</span>
                  {sortField === 'date' && (
                    sortDirection === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Course</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Tees</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort('gross_score')}
                  className="flex items-center space-x-1"
                >
                  <span>Gross</span>
                  {sortField === 'gross_score' && (
                    sortDirection === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort('net_score')}
                  className="flex items-center space-x-1"
                >
                  <span>Net</span>
                  {sortField === 'net_score' && (
                    sortDirection === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedRounds.map((round) => (
              <tr key={round.id} className="border-b last:border-0">
                <td className="px-4 py-3 text-sm">
                  {new Date(round.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm font-medium">
                  {round.courses?.name || 'Unknown Course'}
                </td>
                <td className="px-4 py-3 text-sm">
                  {round.tee_name}
                </td>
                <td className="px-4 py-3 text-sm">
                  {round.gross_score}
                  {round.to_par_gross !== 0 && (
                    <span className="text-muted-foreground ml-1">
                      ({round.to_par_gross > 0 ? '+' : ''}{round.to_par_gross})
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {round.net_score}
                  {round.to_par_net !== undefined && round.to_par_net !== 0 && (
                    <span className="text-muted-foreground ml-1">
                      ({round.to_par_net > 0 ? '+' : ''}{round.to_par_net})
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="outline" size="sm">View</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderDashboard = () => {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {profile?.first_name || 'Golfer'}!</h1>
            {profile?.handicap && (
              <p className="text-muted-foreground mt-1">
                Current Handicap Index: {profile.handicap}
              </p>
            )}
          </div>
          <Button 
            onClick={handleOpenModal}
            className="relative"
          >
            Add a New Round
          </Button>
        </div>

        {renderStats()}
        
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Your Rounds</h2>
          {renderRoundsTable()}
        </div>
      </div>
    );
  };

  const renderCourseDetail = () => {
    if (!selectedCourse) return null;
    return (
      <div>
        {/* Course detail content here */}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="absolute top-4 right-4 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
              <User className="h-5 w-5" />
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
      
      {selectedCourse ? renderCourseDetail() : renderDashboard()}

      <AddRoundModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
