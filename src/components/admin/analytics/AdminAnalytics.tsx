import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserActivityChart } from "./UserActivityChart";
import { ChurnRiskList } from "./ChurnRiskList";
import { RevenueStats } from "./RevenueStats";
import { ActivityLog } from "./ActivityLog";
import { Activity, AlertTriangle, DollarSign } from "lucide-react";

export function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
      
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="churn" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Churn Risk
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Revenue
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-6">
          <UserActivityChart />
          <ActivityLog />
        </TabsContent>

        <TabsContent value="churn">
          <ChurnRiskList />
        </TabsContent>

        <TabsContent value="revenue">
          <RevenueStats />
        </TabsContent>
      </Tabs>
    </div>
  );
}
