import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Share2, Lock } from "lucide-react";
import {
  Milestone,
  LockedMilestone,
  getMilestoneIcon,
  getMilestoneLabel,
} from "@/utils/milestonesCalculator";

export function UnlockedMilestoneCard({
  milestone,
  onShare,
}: {
  milestone: Milestone;
  onShare: (milestone: Milestone) => void;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
      <div className="text-3xl flex-shrink-0">{getMilestoneIcon(milestone.type)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold text-foreground">{milestone.title}</h4>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {getMilestoneLabel(milestone.type)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{milestone.description}</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          {format(new Date(milestone.date), "d MMMM yyyy")}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 flex-shrink-0"
        onClick={() => onShare(milestone)}
        aria-label={`Share ${milestone.title}`}
      >
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">Share</span>
      </Button>
    </div>
  );
}

export function LockedMilestoneCard({ milestone }: { milestone: LockedMilestone }) {
  const showBar = milestone.target > 1 && milestone.current >= 0;
  const percent = showBar
    ? Math.min(100, Math.round((milestone.current / milestone.target) * 100))
    : 0;

  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-dashed bg-muted/30">
      <div className="text-3xl flex-shrink-0 opacity-25 grayscale">
        {getMilestoneIcon(milestone.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold text-muted-foreground">{milestone.title}</h4>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Locked
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{milestone.hint}</p>
        {showBar && (
          <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary/60 rounded-full" style={{ width: `${percent}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}
