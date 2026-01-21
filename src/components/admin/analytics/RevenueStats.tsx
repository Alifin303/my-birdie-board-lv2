import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DollarSign, TrendingUp, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

interface RevenueData {
  totalUsers: number;
  freeUsers: number;
  proUsers: number;
  complimentaryUsers: number;
  conversionRate: number;
  mrr: number;
  monthlyData: { month: string; subscriptions: number; revenue: number }[];
}

// Assuming monthly price - you may want to make this configurable
const MONTHLY_PRICE = 9.99;

export function RevenueStats() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Get active paid subscriptions
      const { data: subscriptions } = await supabase
        .from("customer_subscriptions")
        .select("*")
        .in("status", ["active", "trialing"]);

      // Separate pro (paid) from complimentary
      const proSubs = subscriptions?.filter(s => s.status !== "complimentary") || [];
      const complimentarySubs = subscriptions?.filter(s => s.status === "complimentary") || [];

      // Also check for complimentary accounts table
      const { count: complimentaryCount } = await supabase
        .from("complimentary_accounts")
        .select("*", { count: "exact", head: true });

      const proUsers = proSubs.length;
      const complimentaryUsers = complimentarySubs.length + (complimentaryCount || 0);
      const freeUsers = (totalUsers || 0) - proUsers - complimentaryUsers;

      // Calculate MRR
      const mrr = proUsers * MONTHLY_PRICE;

      // Calculate conversion rate
      const conversionRate = totalUsers ? ((proUsers / totalUsers) * 100) : 0;

      // Get monthly subscription data for the last 6 months
      const monthlyData: { month: string; subscriptions: number; revenue: number }[] = [];
      
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(new Date(), i));
        const monthEnd = endOfMonth(subMonths(new Date(), i));

        const { data: monthSubs } = await supabase
          .from("customer_subscriptions")
          .select("created_at, status")
          .gte("created_at", monthStart.toISOString())
          .lte("created_at", monthEnd.toISOString())
          .neq("status", "complimentary");

        const activeCount = monthSubs?.filter(s => 
          s.status === "active" || s.status === "trialing"
        ).length || 0;

        monthlyData.push({
          month: format(monthStart, "MMM"),
          subscriptions: activeCount,
          revenue: activeCount * MONTHLY_PRICE
        });
      }

      setData({
        totalUsers: totalUsers || 0,
        freeUsers: Math.max(0, freeUsers),
        proUsers,
        complimentaryUsers,
        conversionRate,
        mrr,
        monthlyData
      });
    } catch (error) {
      console.error("Error fetching revenue data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const pieData = [
    { name: "Free", value: data.freeUsers, color: "hsl(var(--muted-foreground))" },
    { name: "Pro", value: data.proUsers, color: "hsl(var(--primary))" },
    { name: "Complimentary", value: data.complimentaryUsers, color: "hsl(142.1 76.2% 36.3%)" }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Recurring Revenue</p>
                <p className="text-3xl font-bold">${data.mrr.toFixed(2)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold">{data.conversionRate.toFixed(1)}%</p>
                  {data.conversionRate > 5 ? (
                    <ArrowUpRight className="h-5 w-5 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pro Subscribers</p>
                <p className="text-3xl font-bold">{data.proUsers}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{data.totalUsers}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>New Subscriptions by Month</CardTitle>
            <CardDescription>New pro subscriptions created each month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                  formatter={(value: number, name: string) => [
                    name === "revenue" ? `$${value.toFixed(2)}` : value,
                    name === "revenue" ? "Revenue" : "Subscriptions"
                  ]}
                />
                <Bar dataKey="subscriptions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Breakdown of user account types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> MRR is calculated at ${MONTHLY_PRICE}/month per subscriber. 
            Adjust the MONTHLY_PRICE constant in the code if your pricing differs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
