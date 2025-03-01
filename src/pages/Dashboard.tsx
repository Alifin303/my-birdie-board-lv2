
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
    }
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

  return (
    <div className="container mx-auto py-8 px-4">
      <DashboardContent
        userRounds={userRounds}
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
        onSuccess={refetchRounds}
      />
      
      {showDebugPanel && <DebugPanel />}
    </div>
  );
}
