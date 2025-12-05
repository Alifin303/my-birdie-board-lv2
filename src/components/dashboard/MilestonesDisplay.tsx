import { getRecentMilestones, getMilestoneIcon, Milestone } from "@/utils/milestonesCalculator";
import { format } from "date-fns";

interface Round {
  id: number;
  date: string;
  gross_score: number;
  hole_scores?: { score: number; par: number }[] | null;
  holes_played?: number;
  course_id?: number;
  courses?: { id: number; name: string };
}

interface MilestonesDisplayProps {
  rounds: Round[];
}

export function MilestonesDisplay({ rounds }: MilestonesDisplayProps) {
  const recentMilestones = getRecentMilestones(rounds, 3);

  if (recentMilestones.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {recentMilestones.map((milestone) => (
        <MilestoneChip key={milestone.id} milestone={milestone} />
      ))}
    </div>
  );
}

function MilestoneChip({ milestone }: { milestone: Milestone }) {
  const icon = getMilestoneIcon(milestone.type);
  const formattedDate = format(new Date(milestone.date), "MMM d, yyyy");

  return (
    <div 
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-sm"
      title={`${milestone.description} - ${formattedDate}`}
    >
      <span className="text-base">{icon}</span>
      <span className="font-medium text-foreground">{milestone.title}</span>
      <span className="text-muted-foreground text-xs">· {formattedDate}</span>
    </div>
  );
}
