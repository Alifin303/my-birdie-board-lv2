import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";

interface ActivityData {
  date: string;
  signups: number;
  rounds: number;
  logins: number;
}

export function UserActivityChart() {
  const [data, setData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    fetchActivityData();
  }, [timeRange]);

  const fetchActivityData = async () => {
    setLoading(true);
    try {
      const days = parseInt(timeRange);
      const startDate = startOfDay(subDays(new Date(), days));
      const endDate = new Date();

      // Generate all dates in range
      const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
      const dateMap = new Map<string, ActivityData>();
      
      dateRange.forEach(date => {
        const key = format(date, "yyyy-MM-dd");
        dateMap.set(key, { date: format(date, "MMM dd"), signups: 0, rounds: 0, logins: 0 });
      });

      // Fetch signups (profiles created)
      const { data: signups } = await supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", startDate.toISOString());

      signups?.forEach(profile => {
        const key = format(new Date(profile.created_at), "yyyy-MM-dd");
        const existing = dateMap.get(key);
        if (existing) {
          existing.signups++;
        }
      });

      // Fetch rounds created
      const { data: rounds } = await supabase
        .from("rounds")
        .select("created_at")
        .gte("created_at", startDate.toISOString());

      rounds?.forEach(round => {
        const key = format(new Date(round.created_at), "yyyy-MM-dd");
        const existing = dateMap.get(key);
        if (existing) {
          existing.rounds++;
        }
      });

      // Fetch logins (last_login within range - note: only captures most recent login per user)
      const { data: logins } = await supabase
        .from("profiles")
        .select("last_login")
        .gte("last_login", startDate.toISOString());

      logins?.forEach(profile => {
        if (profile.last_login) {
          const key = format(new Date(profile.last_login), "yyyy-MM-dd");
          const existing = dateMap.get(key);
          if (existing) {
            existing.logins++;
          }
        }
      });

      setData(Array.from(dateMap.values()));
    } catch (error) {
      console.error("Error fetching activity data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Activity Timeline</CardTitle>
          <CardDescription>Loading activity data...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User Activity Timeline</CardTitle>
          <CardDescription>Signups, rounds played, and logins over time</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
              className="text-muted-foreground"
            />
            <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))", 
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px"
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="signups" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={false}
              name="Signups"
            />
            <Line 
              type="monotone" 
              dataKey="rounds" 
              stroke="hsl(142.1 76.2% 36.3%)" 
              strokeWidth={2}
              dot={false}
              name="Rounds"
            />
            <Line 
              type="monotone" 
              dataKey="logins" 
              stroke="hsl(221.2 83.2% 53.3%)" 
              strokeWidth={2}
              dot={false}
              name="Active Users"
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-muted-foreground mt-2">
          Note: "Active Users" shows users whose last login was on that day
        </p>
      </CardContent>
    </Card>
  );
}
