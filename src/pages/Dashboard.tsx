import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, parseCourseName, updateCourseWithUserId } from "@/integrations/supabase/client";
import { AddRoundModal } from "@/components/add-round/AddRoundModal";
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

interface Subscription {
  id: string;
  subscription_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scoreType, setScoreType] = useState<'gross' | 'net'>('gross');
  
  useEffect(() => {
    console.log("Modal state changed:", isModalOpen);
  }, [isModalOpen]);

  const { data: profile, isLoading: profileLoading } = useQuery({
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
      console.log("Retrieved user profile with handicap:", data?.handicap);
      return data;
    }
  });
  
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');
      
      const { data, error } = await supabase
        .from('customer_subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching subscription:", error);
        throw error;
      }
      
      console.log("Subscription data:", data);
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
      
      console.log("IMPORTANT - RAW ROUNDS FROM DATABASE:", JSON.stringify(data?.slice(0, 3).map(round => ({ 
        id: round.id, 
        tee_name: round.tee_name,
        tee_name_type: typeof round.tee_name,
        tee_id: round.tee_id
      })), null, 2));
      
      const processedRounds = data?.map(round => {
        let parsedNames = { clubName: "Unknown Club", courseName: "Unknown Course" };
        
        if (round.courses && round.courses.name) {
          parsedNames = parseCourseName(round.courses.name);
        }
        
        return {
          ...round,
          tee_name: round.tee_name,
          courses: round.courses ? {
            ...round.courses,
            clubName: parsedNames.clubName,
            courseName: parsedNames.courseName
          } : undefined
        };
      }) || [];
      
      console.log("PROCESSED ROUNDS - First few with tee info:", 
        processedRounds.slice(0, 3).map(r => ({
          id: r.id,
          tee_name: r.tee_name,
          tee_name_type: typeof r.tee_name,
          tee_id: r.tee_id
        }))
      );
      
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
      queryClient.invalidateQueries({ queryKey: ['userRounds'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  }, [isModalOpen, queryClient]);

  const renderDashboard = () => {
    if (profileLoading || !profile) {
      return <div className="flex justify-center py-10"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
    }
    
    const subscriptionStatus = subscription?.status || "none";
    
    const handicapFromProfile = typeof profile.handicap === 'number' ? profile.handicap : 
                               (parseFloat(String(profile.handicap)) || 0);
    
    console.log("Using handicap directly from profile:", {
      rawHandicap: profile.handicap,
      parsedHandicap: handicapFromProfile,
      profileType: typeof profile.handicap
    });
    
    return (
      <div className="space-y-6 sm:space-y-8">
        <DashboardHeader 
          profileData={profile} 
          onAddRound={handleOpenModal}
          subscription={subscription}
        />
        
        {!selectedCourseId && (
          <>
            <MainStats 
              userRounds={userRounds}
              roundsLoading={roundsLoading}
              scoreType={scoreType}
              calculateStats={calculateStats}
              handicapIndex={handicapFromProfile}
            />
            
            <HandicapCircle 
              userRounds={userRounds}
              roundsLoading={roundsLoading}
              scoreType={scoreType}
              onScoreTypeChange={handleScoreTypeChange}
              calculateStats={calculateStats}
              handicapIndex={handicapFromProfile}
              profileHandicap={handicapFromProfile}
            />
          </>
        )}
        
        <div className="space-y-3 sm:space-y-4">
          {selectedCourseId 
            ? <CourseRoundHistory 
                userRounds={userRounds} 
                selectedCourseId={selectedCourseId}
                onBackClick={() => setSelectedCourseId(null)}
                handicapIndex={handicapFromProfile}
              /> 
            : (
              <>
                <h2 className="text-xl sm:text-2xl font-semibold">Your Courses</h2>
                <CourseStatsTable 
                  userRounds={userRounds}
                  scoreType={scoreType}
                  calculateCourseStats={calculateCourseStats}
                  onCourseClick={(courseId) => setSelectedCourseId(courseId)}
                  handicapIndex={handicapFromProfile}
                />
              </>
            )
          }
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4">
      {renderDashboard()}

      <AddRoundModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
