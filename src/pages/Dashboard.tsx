
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, parseCourseName } from "@/integrations/supabase/client";
import { AddRoundModal } from "@/components/add-round/AddRoundModal";
import { DebugPanel } from "@/components/DebugPanel";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MainStats, HandicapCircle } from "@/components/dashboard/StatsDisplay";
import { CourseStatsTable, CourseRoundHistory } from "@/components/dashboard/CourseStats";
import { calculateStats, calculateCourseStats } from "@/utils/statsCalculator";

interface Round {
  id: number;
  date: string;
  tee_name: string;
  tee_id?: string;
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
      console.log("Tee names in rounds:", data?.map(round => round.tee_name));
      console.log("Tee IDs in rounds:", data?.map(round => round.tee_id));
      
      const processedRounds = data?.map(round => {
        let parsedNames = { clubName: "Unknown Club", courseName: "Unknown Course" };
        
        if (round.courses && round.courses.name) {
          parsedNames = parseCourseName(round.courses.name);
        }
        
        // Log the round tee information for debugging
        console.log("Fetched round data:", { 
          roundId: round.id,
          savedTeeId: round.tee_id, 
          savedTeeName: round.tee_name 
        });
        
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
      // Log specific round info to debug tee name issues
      if (processedRounds.length > 0) {
        console.log("LATEST ROUND TEE INFO:", {
          id: processedRounds[0].id,
          tee_name: processedRounds[0].tee_name,
          tee_id: processedRounds[0].tee_id
        });
      }
      
      return processedRounds as Round[];
    }
  });

  const handleOpenModal = () => {
    console.log("Opening modal...");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log("Closing modal...");
    setIsModalOpen(false);
    // Refresh rounds data when modal closes
    queryClient.invalidateQueries({ queryKey: ['userRounds'] });
  };

  const handleScoreTypeChange = (type: 'gross' | 'net') => {
    setScoreType(type);
  };

  // Reset when switching courses to avoid stale data
  useEffect(() => {
    if (selectedCourseId) {
      console.log("Changed to course ID:", selectedCourseId);
      
      // Invalidate the rounds query to ensure fresh data when returning to dashboard
      return () => {
        console.log("Leaving course view, invalidating rounds data");
        queryClient.invalidateQueries({ queryKey: ['userRounds'] });
      };
    }
  }, [selectedCourseId, queryClient]);

  const renderDashboard = () => {
    return (
      <div className="space-y-8">
        <DashboardHeader 
          profileData={profile} 
          onAddRound={handleOpenModal} 
        />
        
        {!selectedCourseId && (
          <>
            <MainStats 
              userRounds={userRounds}
              roundsLoading={roundsLoading}
              scoreType={scoreType}
              calculateStats={calculateStats}
            />
            
            <HandicapCircle 
              userRounds={userRounds}
              roundsLoading={roundsLoading}
              scoreType={scoreType}
              onScoreTypeChange={handleScoreTypeChange}
              calculateStats={calculateStats}
            />
          </>
        )}
        
        <div className="space-y-4">
          {selectedCourseId 
            ? <CourseRoundHistory 
                userRounds={userRounds} 
                selectedCourseId={selectedCourseId}
                onBackClick={() => {
                  console.log("Going back to dashboard from course view");
                  setSelectedCourseId(null);
                  // Ensure fresh data when returning to dashboard
                  queryClient.invalidateQueries({ queryKey: ['userRounds'] });
                }}
              /> 
            : (
              <>
                <h2 className="text-2xl font-semibold">Your Courses</h2>
                <CourseStatsTable 
                  userRounds={userRounds}
                  scoreType={scoreType}
                  calculateCourseStats={calculateCourseStats}
                  onCourseClick={(courseId) => {
                    console.log("Selected course ID:", courseId);
                    setSelectedCourseId(courseId);
                  }}
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
        onClose={handleCloseModal}
      />
      
      {showDebugPanel && <DebugPanel />}
    </div>
  );
}
