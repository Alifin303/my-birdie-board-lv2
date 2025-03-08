
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { supabase, parseCourseName, updateCourseWithUserId } from "@/integrations/supabase/client";
import { AddRoundModal } from "@/components/add-round/AddRoundModal";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MainStats, HandicapCircle } from "@/components/dashboard/StatsDisplay";
import { CourseStatsTable, CourseRoundHistory } from "@/components/dashboard/CourseStats";
import { calculateStats, calculateCourseStats } from "@/utils/statsCalculator";
import { useToast } from "@/hooks/use-toast";
import { clearSubscriptionCache } from "@/integrations/supabase/subscription/subscription-utils";

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
  const [searchParams] = useSearchParams();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scoreType, setScoreType] = useState<'gross' | 'net'>('gross');
  const [processingStripeSession, setProcessingStripeSession] = useState(false);
  
  const sessionId = searchParams.get('session_id');
  
  useEffect(() => {
    if (sessionId) {
      console.log("Processing Stripe checkout session:", sessionId);
      setProcessingStripeSession(true);
      
      const initSession = async () => {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user?.id) {
          clearSubscriptionCache(data.session.user.id);
        }
      };
      
      initSession();
      
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      
      toast({
        title: "Payment successful!",
        description: "Thank you for subscribing to BirdieBoard",
        duration: 5000,
      });
      
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      setTimeout(() => {
        setProcessingStripeSession(false);
      }, 3000);
    }
  }, [sessionId, toast, queryClient]);
  
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
    },
    retry: 3,
    retryDelay: 1000
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
    if (processingStripeSession) {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-fade-in">
          <div className="w-20 h-20 relative">
            <div className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-primary">Processing Your Payment</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Your payment was successful! We're setting up your account access.
            <br />This should only take a few seconds...
          </p>
        </div>
      );
    }

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
      <div className="space-y-6 sm:space-y-8 golf-grass-pattern animate-fade-in">
        <div className="mb-4">
          <Link to="/" className="inline-block">
            <img 
              src="/lovable-uploads/e65e4018-8608-4c06-aefc-191f9e9de8e0.png" 
              alt="BirdieBoard Logo" 
              className="h-16 w-auto object-contain" 
            />
          </Link>
        </div>
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
                <h2 className="text-xl sm:text-2xl font-semibold text-primary">Your Courses</h2>
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
