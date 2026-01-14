
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Users, Flag, Crown, Gift, UserX } from "lucide-react";

export function AdminStats() {
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalRounds: number;
    totalCourses: number;
    freeAccounts: number;
    proAccounts: number;
    complimentaryAccounts: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        
        // Get total users
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        if (userError) throw userError;
        
        // Get total rounds
        const { count: roundCount, error: roundError } = await supabase
          .from('rounds')
          .select('*', { count: 'exact', head: true });
          
        if (roundError) throw roundError;
        
        // Get unique courses
        const { count: courseCount, error: courseError } = await supabase
          .from('courses')
          .select('*', { count: 'exact', head: true });
          
        if (courseError) throw courseError;

        // Fetch complimentary emails from database
        const { data: complimentaryData, error: compError } = await supabase
          .from('complimentary_accounts')
          .select('email');
        
        if (compError) throw compError;

        const complimentaryEmails = complimentaryData?.map(c => c.email.toLowerCase()) || [];

        // Fetch user base split data
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email');
        
        if (profilesError) throw profilesError;

        // Get all active subscriptions with user IDs
        const { data: subscriptions, error: subsError } = await supabase
          .from('customer_subscriptions')
          .select('user_id')
          .in('status', ['active', 'trialing']);
        
        if (subsError) throw subsError;

        // Create a set of user IDs with active subscriptions
        const subscribedUserIds = new Set(subscriptions?.map(s => s.user_id) || []);

        // Categorize users
        let freeCount = 0;
        let proCount = 0;
        let complimentaryCount = 0;

        profiles?.forEach(profile => {
          const email = profile.email?.toLowerCase() || '';
          const isComplimentary = complimentaryEmails.includes(email);
          const hasSubscription = subscribedUserIds.has(profile.id);

          if (isComplimentary) {
            complimentaryCount++;
          } else if (hasSubscription) {
            proCount++;
          } else {
            freeCount++;
          }
        });
        
        setStats({
          totalUsers: userCount || 0,
          totalRounds: roundCount || 0,
          totalCourses: courseCount || 0,
          freeAccounts: freeCount,
          proAccounts: proCount,
          complimentaryAccounts: complimentaryCount
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
  }, []);

  if (loading) {
    return <StatsCardSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Platform Overview</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard 
            title="Total Users" 
            value={stats?.totalUsers || 0}
            icon={<Users className="h-5 w-5 text-blue-500" />}
            description="Registered users"
          />
          <StatCard 
            title="Total Rounds" 
            value={stats?.totalRounds || 0}
            icon={<Flag className="h-5 w-5 text-purple-500" />}
            description="Rounds played"
          />
          <StatCard 
            title="Unique Courses" 
            value={stats?.totalCourses || 0}
            icon={<BarChart className="h-5 w-5 text-orange-500" />}
            description="All courses in database"
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">User Base Split</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard 
            title="Free Accounts" 
            value={stats?.freeAccounts || 0}
            icon={<UserX className="h-5 w-5 text-gray-500" />}
            description="No active subscription"
          />
          <StatCard 
            title="Pro Accounts" 
            value={stats?.proAccounts || 0}
            icon={<Crown className="h-5 w-5 text-yellow-500" />}
            description="Paying subscribers"
          />
          <StatCard 
            title="Complimentary Accounts" 
            value={stats?.complimentaryAccounts || 0}
            icon={<Gift className="h-5 w-5 text-pink-500" />}
            description="Manually granted premium"
          />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function StatsCardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div>
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
