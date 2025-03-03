import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, parseCourseName, updateCourseWithUserId } from "@/integrations/supabase/client";
import { AddRoundModal } from "@/components/add-round/AddRoundModal";
import { DebugPanel } from "@/components/DebugPanel";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MainStats, HandicapCircle } from "@/components/dashboard/StatsDisplay";
import { CourseStatsTable, CourseRoundHistory } from "@/components/dashboard/CourseStats";
import { calculateStats, calculateCourseStats } from "@/utils/statsCalculator";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
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
      
      console.log("============= ROUNDS FETCHED FROM SUPABASE =============");
      console.log("Raw rounds data with tee_name field:", data?.map(round => ({ 
        id: round.id, 
        tee_name: round.tee_name,
        tee_id: round.tee_id,
        date: round.date
      })));
      
      const processedRounds = data?.map(round => {
        let parsedNames = { clubName: "Unknown Club", courseName: "Unknown Course" };
        
        if (round.courses && round.courses.name) {
          parsedNames = parseCourseName(round.courses.name);
        }
        
        // Ensure we preserve the EXACT tee_name as it is in the database
        console.log(`Processing round ${round.id} with tee_name: "${round.tee_name}"`);
        
        return {
          ...round,
          tee_name: round.tee_name, // Preserve the exact tee name without modification
          courses: round.courses ? {
            ...round.courses,
            clubName: parsedNames.clubName,
            courseName: parsedNames.courseName
          } : undefined
        };
      }) || [];
      
      console.log("FULLY PROCESSED ROUNDS with tee names:", processedRounds.map(r => ({
        id: r.id,
        tee_name: r.tee_name,
        tee_id: r.tee_id,
        date: new Date(r.date).toLocaleDateString()
      })));
      
      // Update user IDs for courses without them
      if (processedRounds.length > 0) {
        processedRounds.forEach(round => {
          if (round.courses && round.courses.id) {
            updateCourseWithUserId(round.courses.id)
              .then(updated => {
                if (updated) {
                  console.log(`Updated user_id for course ${round.courses?.id}`);
                }
              });
          }
        });
      }
      
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

  useEffect(() => {
    if (!isModalOpen) {
      // Invalidate query cache when modal is closed to refresh data
      queryClient.invalidateQueries({ queryKey: ['userRounds'] });
    }
  }, [isModalOpen, queryClient]);

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
                onBackClick={() => setSelectedCourseId(null)}
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
      
      {showDebugPanel && <DebugPanel />}
    </div>
  );
}
