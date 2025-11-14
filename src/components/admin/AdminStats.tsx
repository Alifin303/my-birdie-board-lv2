
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { User, BarChart, Users, Flag, CreditCard } from "lucide-react";

export function AdminStats() {
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalRounds: number;
    totalCourses: number;
    activeSubscriptions: number;
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
        
        // Get active and trialing subscriptions
        const { count: activeSubCount, error: subError } = await supabase
          .from('customer_subscriptions')
          .select('*', { count: 'exact', head: true })
          .in('status', ['active', 'trialing']);
          
        if (subError) throw subError;
        
        setStats({
          totalUsers: userCount || 0,
          totalRounds: roundCount || 0,
          totalCourses: courseCount || 0,
          activeSubscriptions: activeSubCount || 0
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
    <div>
      <h2 className="text-2xl font-bold mb-4">Platform Overview</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Users" 
          value={stats?.totalUsers || 0}
          icon={<Users className="h-5 w-5 text-blue-500" />}
          description="Registered users"
        />
        <StatCard 
          title="Active Subscriptions" 
          value={stats?.activeSubscriptions || 0}
          icon={<CreditCard className="h-5 w-5 text-green-500" />}
          description="Users with active subscription"
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
    <div>
      <Skeleton className="h-8 w-48 mb-4" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
