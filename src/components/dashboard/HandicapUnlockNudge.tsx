import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { FREE_ROUND_LIMIT } from "@/integrations/supabase/subscription/freemium-utils";

interface HandicapUnlockNudgeProps {
  roundCount: number;
  hasValidSubscription: boolean;
}

/**
 * Achievement-style prompt shown to free users sitting on exactly 4 rounds —
 * round 5 is where the WHS handicap first gets calculated.
 */
export function HandicapUnlockNudge({ roundCount, hasValidSubscription }: HandicapUnlockNudgeProps) {
  if (hasValidSubscription || roundCount !== FREE_ROUND_LIMIT) return null;

  const target = FREE_ROUND_LIMIT + 1;
  const percent = Math.round((roundCount / target) * 100);

  return (
    <div className="rounded-lg border bg-card p-4 sm:p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="text-2xl" aria-hidden="true">
          <Trophy className="h-6 w-6 text-accent" />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <h3 className="font-semibold text-primary">
            One more round to unlock your official handicap
          </h3>
          <p className="text-sm text-muted-foreground">
            Round {target} is where MyBirdieBoard calculates your WHS handicap index automatically.
            Start your 30-day free Pro trial to log it — you won't be charged during the trial.
          </p>
          <div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-accent rounded-full" style={{ width: `${percent}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {roundCount} of {target} rounds
            </p>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button asChild size="sm">
              <Link to="/checkout">Start your free trial</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/milestones">View your trophy case</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
