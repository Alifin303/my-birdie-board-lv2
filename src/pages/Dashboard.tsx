
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, parseCourseName } from "@/integrations/supabase/client";
import { AddRoundModal } from "@/components/AddRoundModal";
import { DebugPanel } from "@/components/DebugPanel";
import { RoundScorecard } from "@/components/dashboard/RoundScorecard";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { DeleteRoundDialog } from "@/components/dashboard/DeleteRoundDialog";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scoreType, setScoreType] = useState<'gross' | 'net'>('gross');
  
  const [selectedRound, setSelectedRound] = useState<Round | null>(null);
  const [isScorecardOpen, setIsScorecardOpen] = useState(false);
  
  const [roundToDelete, setRoundToDelete] = useState<number | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No session found');
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
    }
  });

  const { data: userRounds, isLoading: roundsLoading, error: roundsError, refetch: refetchRounds } = useQuery({
    queryKey: ['userRounds'],
    queryFn: async () => {
      try {
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
        
        const processedRounds = data?.map(round => {
          let parsedNames = { clubName: "Unknown Club", courseName: "Unknown Course" };
          
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
      } catch (error) {
        console.error("Error in userRounds query:", error);
        return [];
      }
    },
    retry: 1,
    retryDelay: 1000
  });

  const handleOpenModal = () => {
    console.log("Opening modal...");
    setIsModalOpen(true);
  };

  const handleScoreTypeChange = (type: 'gross' | 'net') => {
    setScoreType(type);
  };

  const handleViewScorecard = (round: Round) => {
    console.log("Opening scorecard for round:", round);
    setSelectedRound(round);
    setIsScorecardOpen(true);
  };

  const handleConfirmDelete = (roundId: number) => {
    setRoundToDelete(roundId);
    setIsConfirmDeleteOpen(true);
  };

  const handleRefetchRounds = async (): Promise<void> => {
    await refetchRounds();
    return;
  };

  // If there's an error fetching data, display an error message instead of a blank screen
  if (profileError || roundsError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
          <h3 className="text-lg font-medium">Error Loading Dashboard</h3>
          <p className="mt-2">There was a problem loading your dashboard data. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <DashboardContent
        userRounds={userRounds || []}
        roundsLoading={roundsLoading}
        profile={profile}
        scoreType={scoreType}
        onScoreTypeChange={handleScoreTypeChange}
        onAddRound={handleOpenModal}
        onViewScorecard={handleViewScorecard}
        onDeleteRound={handleConfirmDelete}
      />

      <AddRoundModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
      />
      
      {selectedRound && (
        <RoundScorecard
          round={selectedRound}
          isOpen={isScorecardOpen}
          onOpenChange={setIsScorecardOpen}
        />
      )}
      
      <DeleteRoundDialog
        roundId={roundToDelete}
        isOpen={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
        onSuccess={handleRefetchRounds}
      />
      
      {showDebugPanel && <DebugPanel />}
    </div>
  );
}
