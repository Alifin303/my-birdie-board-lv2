import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Clock, TrendingDown } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AtRiskUser {
  id: string;
  username: string | null;
  email: string | null;
  last_login: string | null;
  last_round_date: string | null;
  days_inactive: number;
  risk_level: "high" | "medium" | "low";
}

export function ChurnRiskList() {
  const [inactiveUsers, setInactiveUsers] = useState<AtRiskUser[]>([]);
  const [noRoundsUsers, setNoRoundsUsers] = useState<AtRiskUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChurnRiskData();
  }, []);

  const getRiskLevel = (days: number): "high" | "medium" | "low" => {
    if (days >= 60) return "high";
    if (days >= 30) return "medium";
    return "low";
  };

  const fetchChurnRiskData = async () => {
    setLoading(true);
    try {
      const now = new Date();

      // Fetch all profiles with their last login
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, email, last_login, created_at");

      // Fetch last round date for each user
      const { data: rounds } = await supabase
        .from("rounds")
        .select("user_id, date")
        .order("date", { ascending: false });

      // Create a map of user_id to their most recent round
      const lastRoundMap = new Map<string, string>();
      rounds?.forEach(round => {
        if (!lastRoundMap.has(round.user_id)) {
          lastRoundMap.set(round.user_id, round.date);
        }
      });

      // Process inactive users (no login in 30+ days)
      const inactive: AtRiskUser[] = [];
      const noRounds: AtRiskUser[] = [];

      profiles?.forEach(profile => {
        const lastLogin = profile.last_login ? new Date(profile.last_login) : new Date(profile.created_at);
        const daysInactive = differenceInDays(now, lastLogin);

        if (daysInactive >= 14) {
          inactive.push({
            id: profile.id,
            username: profile.username,
            email: profile.email,
            last_login: profile.last_login,
            last_round_date: lastRoundMap.get(profile.id) || null,
            days_inactive: daysInactive,
            risk_level: getRiskLevel(daysInactive)
          });
        }

        // Check for users with no rounds in 30+ days
        const lastRoundDate = lastRoundMap.get(profile.id);
        if (lastRoundDate) {
          const daysSinceRound = differenceInDays(now, new Date(lastRoundDate));
          if (daysSinceRound >= 30) {
            noRounds.push({
              id: profile.id,
              username: profile.username,
              email: profile.email,
              last_login: profile.last_login,
              last_round_date: lastRoundDate,
              days_inactive: daysSinceRound,
              risk_level: getRiskLevel(daysSinceRound)
            });
          }
        } else {
          // User has never played a round
          const daysSinceSignup = differenceInDays(now, new Date(profile.created_at));
          if (daysSinceSignup >= 7) {
            noRounds.push({
              id: profile.id,
              username: profile.username,
              email: profile.email,
              last_login: profile.last_login,
              last_round_date: null,
              days_inactive: daysSinceSignup,
              risk_level: daysSinceSignup >= 30 ? "high" : "medium"
            });
          }
        }
      });

      // Sort by days inactive (highest first)
      inactive.sort((a, b) => b.days_inactive - a.days_inactive);
      noRounds.sort((a, b) => b.days_inactive - a.days_inactive);

      setInactiveUsers(inactive.slice(0, 50)); // Top 50
      setNoRoundsUsers(noRounds.slice(0, 50));
    } catch (error) {
      console.error("Error fetching churn risk data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (level: "high" | "medium" | "low") => {
    switch (level) {
      case "high":
        return <Badge variant="destructive">High Risk</Badge>;
      case "medium":
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Churn Risk Indicators</CardTitle>
          <CardDescription>Loading risk data...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const UserTable = ({ users, dateLabel }: { users: AtRiskUser[], dateLabel: string }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>{dateLabel}</TableHead>
          <TableHead>Days Inactive</TableHead>
          <TableHead>Risk Level</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground">
              No at-risk users found
            </TableCell>
          </TableRow>
        ) : (
          users.map(user => (
            <TableRow key={user.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{user.username || "Unknown"}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </div>
              </TableCell>
              <TableCell>
                {dateLabel === "Last Login" 
                  ? (user.last_login ? format(new Date(user.last_login), "MMM dd, yyyy") : "Never")
                  : (user.last_round_date ? format(new Date(user.last_round_date), "MMM dd, yyyy") : "Never")
                }
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  {user.days_inactive} days
                </div>
              </TableCell>
              <TableCell>{getRiskBadge(user.risk_level)}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <div>
            <CardTitle>Churn Risk Indicators</CardTitle>
            <CardDescription>Users who may need re-engagement</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-destructive/10 rounded-lg">
            <div className="text-2xl font-bold text-destructive">
              {inactiveUsers.filter(u => u.risk_level === "high").length}
            </div>
            <div className="text-sm text-muted-foreground">High Risk (60+ days)</div>
          </div>
          <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {inactiveUsers.filter(u => u.risk_level === "medium").length}
            </div>
            <div className="text-sm text-muted-foreground">Medium Risk (30+ days)</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">
              {noRoundsUsers.filter(u => !u.last_round_date).length}
            </div>
            <div className="text-sm text-muted-foreground">Never Played</div>
          </div>
        </div>

        <Tabs defaultValue="inactive">
          <TabsList className="mb-4">
            <TabsTrigger value="inactive" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Inactive Users ({inactiveUsers.length})
            </TabsTrigger>
            <TabsTrigger value="norounds" className="flex items-center gap-1">
              <TrendingDown className="h-4 w-4" />
              No Recent Rounds ({noRoundsUsers.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="inactive">
            <UserTable users={inactiveUsers} dateLabel="Last Login" />
          </TabsContent>
          <TabsContent value="norounds">
            <UserTable users={noRoundsUsers} dateLabel="Last Round" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
