
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AddRoundModal } from "@/components/AddRoundModal";

// Define the type for a round
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

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  // Log modal state changes for debugging
  useEffect(() => {
    console.log("Modal state changed:", isModalOpen);
  }, [isModalOpen]);

  // Fetch user profile
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

  // Fetch user's golf rounds
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

  // Handle logout
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

  // Render profile content
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

  // Handle opening the add round modal
  const handleOpenModal = () => {
    console.log("Opening modal...");
    setIsModalOpen(true);
  };

  // Group rounds by course
  const roundsByCourse: Record<string, Round[]> = userRounds ? userRounds.reduce((acc, round) => {
    const courseName = round.courses?.name || 'Unknown Course';
    if (!acc[courseName]) {
      acc[courseName] = [];
    }
    acc[courseName].push(round);
    return acc;
  }, {} as Record<string, Round[]>) : {};

  // Render user's recent rounds
  const renderRecentRounds = () => {
    if (!userRounds || userRounds.length === 0) {
      return (
        <div className="text-center p-6 bg-muted rounded-lg">
          <p className="text-lg">You haven't added any rounds yet.</p>
          <p className="text-muted-foreground">Click "Add a New Round" to get started!</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Your Rounds</h2>
        {Object.entries(roundsByCourse).map(([courseName, rounds]) => (
          <div key={courseName} className="border rounded-lg p-4 space-y-3">
            <h3 className="text-xl font-medium">{courseName}</h3>
            <div className="grid gap-3">
              {rounds.map((round: Round) => (
                <div key={round.id} className="bg-background border rounded-md p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {new Date(round.date).toLocaleDateString()} - {round.tee_name} Tees
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Gross: {round.gross_score} 
                      {round.to_par_gross !== 0 && (
                        <span> ({round.to_par_gross > 0 ? '+' : ''}{round.to_par_gross})</span>
                      )}
                      {round.net_score && (
                        <span className="ml-2">
                          Net: {round.net_score}
                          {round.to_par_net !== 0 && round.to_par_net !== undefined && (
                            <span> ({round.to_par_net > 0 ? '+' : ''}{round.to_par_net})</span>
                          )}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render dashboard content
  const renderDashboard = () => {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Welcome, {profile?.first_name || 'Golfer'}!</h1>
          <Button 
            onClick={handleOpenModal}
            className="relative"
          >
            Add a New Round
          </Button>
        </div>
        
        <div className="grid gap-6">
          {renderRecentRounds()}
        </div>
      </div>
    );
  };

  // Render course detail
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
      {/* User Account Menu */}
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

      {/* Modal for adding a new round */}
      <AddRoundModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
