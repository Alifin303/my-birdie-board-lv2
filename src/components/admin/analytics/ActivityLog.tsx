import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";
import { CalendarIcon, RefreshCw, LogIn, Plus, Trash2, User, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityLogEntry {
  id: string;
  user_id: string;
  action: string;
  details: any;
  created_at: string;
  user_email?: string;
}

interface GroupedActivity {
  user_id: string;
  user_email: string;
  date: string;
  activities: ActivityLogEntry[];
  summary: { [key: string]: number };
}

const ACTION_LABELS: Record<string, { label: string; icon: React.ReactNode; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  user_login: { label: "Login", icon: <LogIn className="h-3 w-3" />, variant: "default" },
  round_added: { label: "Round Added", icon: <Plus className="h-3 w-3" />, variant: "secondary" },
  round_deleted: { label: "Round Deleted", icon: <Trash2 className="h-3 w-3" />, variant: "destructive" },
  user_signup: { label: "Signup", icon: <User className="h-3 w-3" />, variant: "outline" },
};

export function ActivityLog() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [userProfiles, setUserProfiles] = useState<Record<string, string>>({});
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (actionFilter !== "all") {
        query = query.eq("action", actionFilter);
      }

      if (startDate) {
        query = query.gte("created_at", startDate.toISOString());
      }

      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte("created_at", endOfDay.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching activity logs:", error);
        return;
      }

      setLogs(data || []);

      const userIds = [...new Set((data || []).map((log) => log.user_id))];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email")
          .in("id", userIds);

        if (profiles) {
          const profileMap: Record<string, string> = {};
          profiles.forEach((p) => {
            profileMap[p.id] = p.email || "Unknown";
          });
          setUserProfiles(profileMap);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, startDate, endDate]);

  const groupedActivities = useMemo(() => {
    const groups: Record<string, GroupedActivity> = {};

    logs.forEach((log) => {
      const dateKey = format(new Date(log.created_at), "yyyy-MM-dd");
      const groupKey = `${log.user_id}-${dateKey}`;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          user_id: log.user_id,
          user_email: userProfiles[log.user_id] || log.user_id.slice(0, 8) + "...",
          date: dateKey,
          activities: [],
          summary: {},
        };
      }

      groups[groupKey].activities.push(log);
      groups[groupKey].summary[log.action] = (groups[groupKey].summary[log.action] || 0) + 1;
    });

    // Sort activities within each group by time (newest first)
    Object.values(groups).forEach((group) => {
      group.activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    });

    // Sort groups by most recent activity
    return Object.values(groups).sort((a, b) => {
      const aLatest = new Date(a.activities[0].created_at).getTime();
      const bLatest = new Date(b.activities[0].created_at).getTime();
      return bLatest - aLatest;
    });
  }, [logs, userProfiles]);

  const toggleRow = (key: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const clearFilters = () => {
    setActionFilter("all");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const getActionDisplay = (action: string) => {
    const config = ACTION_LABELS[action] || { label: action, icon: null, variant: "outline" as const };
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const formatDetails = (action: string, details: Record<string, any> | null) => {
    if (!details) return "-";
    
    switch (action) {
      case "round_added":
      case "round_deleted":
        return `Score: ${details.gross_score || "N/A"}`;
      case "user_login":
        return format(new Date(details.sign_in_at), "HH:mm:ss");
      default:
        return JSON.stringify(details).slice(0, 50);
    }
  };

  const getSummaryBadges = (summary: { [key: string]: number }) => {
    return Object.entries(summary).map(([action, count]) => {
      const config = ACTION_LABELS[action] || { label: action, variant: "outline" as const };
      return (
        <Badge key={action} variant={config.variant} className="text-xs">
          {count}x {config.label}
        </Badge>
      );
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Activity Log</span>
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="user_login">Login</SelectItem>
              <SelectItem value="round_added">Round Added</SelectItem>
              <SelectItem value="round_deleted">Round Deleted</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[180px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PP") : "Start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[180px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PP") : "End date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
            </PopoverContent>
          </Popover>

          <Button variant="ghost" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>

        {/* Grouped Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Activity Summary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : groupedActivities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No activity logs found
                  </TableCell>
                </TableRow>
              ) : (
                groupedActivities.map((group) => {
                  const rowKey = `${group.user_id}-${group.date}`;
                  const isExpanded = expandedRows.has(rowKey);

                  return (
                    <Collapsible key={rowKey} asChild open={isExpanded} onOpenChange={() => toggleRow(rowKey)}>
                      <>
                        <TableRow className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          </TableCell>
                          <TableCell className="font-medium">
                            {format(new Date(group.date), "PPP")}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {group.user_email}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {getSummaryBadges(group.summary)}
                            </div>
                          </TableCell>
                        </TableRow>
                        <CollapsibleContent asChild>
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={4} className="p-0">
                              <div className="p-4 space-y-2">
                                {group.activities.map((activity) => (
                                  <div
                                    key={activity.id}
                                    className="flex items-center gap-4 text-sm py-2 px-3 rounded-md bg-background border"
                                  >
                                    <span className="text-muted-foreground whitespace-nowrap">
                                      {format(new Date(activity.created_at), "HH:mm:ss")}
                                    </span>
                                    {getActionDisplay(activity.action)}
                                    <span className="text-muted-foreground">
                                      {formatDetails(activity.action, activity.details)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {groupedActivities.length} user-day groups ({logs.length} total activities)
        </p>
      </CardContent>
    </Card>
  );
}
