
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRounds } from "./UserRounds";
import { ArrowLeft, Settings } from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  handicap: number | null;
  email: string;
  last_sign_in: string;
  created_at: string;
  roundsCount: number;
  coursesCount: number;
}

interface UserDetailProps {
  userId: string;
  onBack?: () => void;
}

export function UserDetail({ userId, onBack }: UserDetailProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  
  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*, created_at')
          .eq('id', userId)
          .single();
          
        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          return;
        }
          
        // Fix: Type the response data properly
        const { data: authData, error: authError } = await supabase.auth.admin
          .listUsers();
          
        // Check if users exists before trying to find a specific user
        const authUser = authData && authData.users ? 
          authData.users.find(user => user.id === userId) : 
          undefined;
          
        if (authError) {
          console.error('Error fetching auth user data:', authError);
        }
        
        const { count: roundsCount, error: roundsError } = await supabase
          .from('rounds')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
          
        if (roundsError) {
          console.error('Error counting user rounds:', roundsError);
        }
        
        const { data: coursesData, error: coursesError } = await supabase
          .from('rounds')
          .select('course_id')
          .eq('user_id', userId);
          
        if (coursesError) {
          console.error('Error fetching user courses:', coursesError);
        }
        
        const uniqueCourseIds = new Set(coursesData?.map(r => r.course_id) || []);
        
        const userProfileData: UserProfile = {
          id: profileData.id,
          username: profileData.username,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          handicap: profileData.handicap,
          email: authUser?.email || '',
          last_sign_in: authUser?.last_sign_in_at || '',
          created_at: profileData.created_at,
          roundsCount: roundsCount || 0,
          coursesCount: uniqueCourseIds.size
        };

        setUserProfile(userProfileData);
      } catch (error) {
        console.error('Error in fetchUserDetails:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserDetails();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!userProfile) {
    return (
      <div className="text-center py-8">
        <p>User not found or error loading user data.</p>
        {onBack && (
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        )}
      </div>
    );
  }
  
  if (activeTab === "rounds") {
    return <UserRounds userId={userId} onBack={() => setActiveTab("profile")} />;
  }

  return (
    <div className="space-y-6">
      {onBack && (
        <Button 
          variant="outline" 
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users List
        </Button>
      )}
      
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            {userProfile.first_name} {userProfile.last_name}
          </h2>
          <p className="text-muted-foreground">@{userProfile.username}</p>
        </div>
        
        <Button
          variant="outline"
          onClick={() => setActiveTab("rounds")}
        >
          <Settings className="h-4 w-4 mr-2" />
          Manage Rounds
        </Button>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Account Info</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Email:</dt>
                    <dd>{userProfile.email || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Last Sign In:</dt>
                    <dd>{userProfile.last_sign_in ? new Date(userProfile.last_sign_in).toLocaleString() : 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Joined:</dt>
                    <dd>{userProfile.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'N/A'}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Golf Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Handicap Index:</dt>
                    <dd>{userProfile.handicap !== null ? userProfile.handicap.toFixed(1) : 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Rounds Played:</dt>
                    <dd>{userProfile.roundsCount}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Courses Played:</dt>
                    <dd>{userProfile.coursesCount}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-6">
          <p className="text-muted-foreground">Detailed statistics for this user will be shown here.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
