
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, parseCourseName } from "@/integrations/supabase/client";
import { AddRoundModal } from "@/components/AddRoundModal";
import { DebugPanel } from "@/components/DebugPanel";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MainStats, HandicapCircle } from "@/components/dashboard/StatsDisplay";
import { CourseStatsTable, CourseRoundHistory } from "@/components/dashboard/CourseStats";
import { calculateStats, calculateCourseStats } from "@/utils/statsCalculator";
import { RoundScorecard } from "@/components/dashboard/RoundScorecard";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Round {
  id: number;
  date: string;
  tee_name: string;
  gross_score: number;
  net_score?: number;
  to_par_gross: number;
  to_par_net?: number;
  hole_scores?: any;
  courses?: {
    id: number;
    name: string;
    city?: string;
    state?: string;
    clubName?: string;
    courseName?: string;
  };
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scoreType, setScoreType] = useState<'gross' | 'net'>('gross');
  
  // State for scorecard modal
  const [selectedRound, setSelectedRound] = useState<Round | null>(null);
  const [isScorecardOpen, setIsScorecardOpen] = useState(false);
  
  // State for delete confirmation
  const [roundToDelete, setRoundToDelete] = useState<number | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  
  // Debug flag for development
  const [showDebugPanel, setShowDebugPanel] = useState(false);

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

  const { data: userRounds, isLoading: roundsLoading, refetch: refetchRounds } = useQuery({
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

  const handleOpenModal = () => {
    console.log("Opening modal...");
    setIsModalOpen(true);
  };

  const handleScoreTypeChange = (type: 'gross' | 'net') => {
    setScoreType(type);
  };

  // Function to handle opening the scorecard
  const handleViewScorecard = (round: Round) => {
    console.log("Opening scorecard for round:", round);
    setSelectedRound(round);
    setIsScorecardOpen(true);
  };

  // Function to handle round deletion confirmation
  const handleConfirmDelete = (roundId: number) => {
    setRoundToDelete(roundId);
    setIsConfirmDeleteOpen(true);
  };

  // Function to handle round deletion
  const handleDeleteRound = async () => {
    if (!roundToDelete) return;
    
    try {
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', roundToDelete);

      if (error) {
        console.error("Error deleting round:", error);
        toast({
          title: "Error",
          description: "Failed to delete round. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Refetch rounds data
      await refetchRounds();
      toast({
        title: "Success",
        description: "Round deleted successfully",
      });
    } catch (err) {
      console.error("Error in delete operation:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConfirmDeleteOpen(false);
      setRoundToDelete(null);
    }
  };

  // Main dashboard content
  const renderDashboard = () => {
    return (
      <div className="space-y-8">
        <DashboardHeader 
          profileData={profile} 
          onAddRound={handleOpenModal} 
        />
        
        {/* Only show the overall stats if not viewing a specific course */}
        {!selectedCourseId && (
          <>
            {/* Main Stats Display */}
            <MainStats 
              userRounds={userRounds}
              roundsLoading={roundsLoading}
              scoreType={scoreType}
              calculateStats={calculateStats}
            />
            
            {/* Handicap Circle */}
            <HandicapCircle 
              userRounds={userRounds}
              roundsLoading={roundsLoading}
              scoreType={scoreType}
              onScoreTypeChange={handleScoreTypeChange}
              calculateStats={calculateStats}
            />
          </>
        )}
        
        {/* Course Stats or Round History */}
        <div className="space-y-4">
          {selectedCourseId 
            ? <CourseRoundHistory 
                userRounds={userRounds} 
                selectedCourseId={selectedCourseId}
                onBackClick={() => setSelectedCourseId(null)}
                onViewScorecard={handleViewScorecard}
                onDeleteRound={handleConfirmDelete}
              /> 
            : (
              <>
                <h2 className="text-2xl font-semibold">Your Courses</h2>
                <CourseStatsTable 
                  userRounds={userRounds}
                  scoreType={scoreType}
                  calculateCourseStats={calculateCourseStats}
                  onCourseClick={(courseId) => setSelectedCourseId(courseId)}
                />
              </>
            )
          }
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {renderDashboard()}

      <AddRoundModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
      />
      
      {/* Scorecard Modal */}
      {selectedRound && (
        <RoundScorecard
          round={selectedRound}
          isOpen={isScorecardOpen}
          onOpenChange={setIsScorecardOpen}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Round</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this round? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRound} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Debug Panel for development */}
      {showDebugPanel && <DebugPanel />}
    </div>
  );
}
