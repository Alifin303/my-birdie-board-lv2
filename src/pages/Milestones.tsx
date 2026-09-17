import { useMemo, useState } from "react";
import { Head } from "vite-react-ssg";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trophy, ArrowLeft } from "lucide-react";
import {
  getMilestoneProgress,
  getMilestoneIcon,
  getMilestoneLabel,
  Milestone,
  MilestoneType,
  MILESTONE_TYPES,
} from "@/utils/milestonesCalculator";
import { UnlockedMilestoneCard, LockedMilestoneCard } from "@/components/milestones/MilestoneCard";
import { ShareMilestoneDialog } from "@/components/milestones/ShareMilestoneDialog";

export default function Milestones() {
  const [shareMilestone, setShareMilestone] = useState<Milestone | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: rounds, isLoading } = useQuery({
    queryKey: ["userRounds"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");
      const { data, error } = await supabase
        .from("rounds")
        .select(`*, courses:course_id(id, name)`)
        .eq("user_id", session.user.id)
        .order("date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const progress = useMemo(
    () => getMilestoneProgress((rounds as any) || [], profile?.handicap as number | undefined),
    [rounds, profile?.handicap]
  );

  const activeTypes = useMemo(() => {
    const present = new Set<MilestoneType>();
    progress.unlocked.forEach((m) => present.add(m.type));
    progress.locked.forEach((m) => present.add(m.type));
    return MILESTONE_TYPES.filter((t) => present.has(t));
  }, [progress]);

  const openShare = (milestone: Milestone) => {
    setShareMilestone(milestone);
    setShareOpen(true);
  };

  const renderList = (type?: MilestoneType) => {
    const unlocked = type ? progress.unlocked.filter((m) => m.type === type) : progress.unlocked;
    const locked = type ? progress.locked.filter((m) => m.type === type) : progress.locked;

    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Unlocked ({unlocked.length})
          </h2>
          {unlocked.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing unlocked here yet — log a round and this fills up fast.
            </p>
          ) : (
            unlocked.map((m) => (
              <UnlockedMilestoneCard key={m.id} milestone={m} onShare={openShare} />
            ))
          )}
        </div>

        {locked.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Up next ({locked.length})
            </h2>
            {locked.map((m) => (
              <LockedMilestoneCard key={m.id} milestone={m} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Your Trophy Case | MyBirdieBoard</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-muted/40 py-6 px-3 sm:px-4">
        <div className="container mx-auto max-w-4xl space-y-6">
          <div className="bg-background rounded-lg shadow-sm p-4 sm:p-6">
            <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2 mb-3">
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </Link>
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
              <Trophy className="h-7 w-7 text-accent" />
              Your Trophy Case
            </h1>
            <p className="text-muted-foreground mt-1">
              {isLoading
                ? "Loading your achievements…"
                : `${progress.unlocked.length} ${progress.unlocked.length === 1 ? "milestone" : "milestones"} unlocked — and there's always another to chase`}
            </p>
          </div>

          <div className="bg-background rounded-lg shadow-sm p-4 sm:p-6">
            <Tabs defaultValue="all">
              <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
                <TabsTrigger value="all" className="text-xs">
                  All
                </TabsTrigger>
                {activeTypes.map((type) => (
                  <TabsTrigger key={type} value={type} className="text-xs gap-1">
                    <span>{getMilestoneIcon(type)}</span>
                    <span className="hidden sm:inline">{getMilestoneLabel(type)}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all" className="mt-4">
                {renderList()}
              </TabsContent>
              {activeTypes.map((type) => (
                <TabsContent key={type} value={type} className="mt-4">
                  {renderList(type)}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>

      <ShareMilestoneDialog
        milestone={shareMilestone}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />
    </>
  );
}
