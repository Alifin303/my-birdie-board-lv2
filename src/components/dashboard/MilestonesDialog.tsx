import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, X } from "lucide-react";
import { format } from "date-fns";
import { 
  calculateMilestones, 
  getMilestonesByType, 
  getMilestoneIcon, 
  getMilestoneLabel,
  Milestone 
} from "@/utils/milestonesCalculator";

interface Round {
  id: number;
  date: string;
  gross_score: number;
  hole_scores?: { score?: number; strokes?: number; par: number }[] | null;
  holes_played?: number;
  course_id?: number;
  courses?: { id: number; name: string };
  stableford_gross?: number;
  handicap_at_posting?: number;
}

interface MilestonesDialogProps {
  rounds: Round[];
}

export function MilestonesDialog({ rounds }: MilestonesDialogProps) {
  const [open, setOpen] = useState(false);
  const allMilestones = calculateMilestones(rounds);
  const milestonesByType = getMilestonesByType(rounds);
  
  const milestoneTypes = [
    'birdie', 'eagle', 'hole_in_one', 'round', 'course', 
    'score', 'best_round', 'stableford', 'handicap'
  ] as const;
  
  // Filter to only show types with milestones
  const activeTypes = milestoneTypes.filter(type => milestonesByType[type]?.length > 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Trophy className="h-4 w-4" />
          View Milestones
          {allMilestones.length > 0 && (
            <span className="ml-1 bg-accent text-accent-foreground text-xs px-1.5 py-0.5 rounded-full">
              {allMilestones.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" />
            Your Golf Milestones
          </DialogTitle>
        </DialogHeader>
        
        {allMilestones.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No milestones yet! Keep playing to unlock achievements.</p>
            <p className="text-sm mt-2">Track birdies, rounds, courses, and more.</p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="all" className="text-xs">
                All ({allMilestones.length})
              </TabsTrigger>
              {activeTypes.map(type => (
                <TabsTrigger key={type} value={type} className="text-xs gap-1">
                  <span>{getMilestoneIcon(type)}</span>
                  <span className="hidden sm:inline">{getMilestoneLabel(type)}</span>
                  <span className="text-muted-foreground">({milestonesByType[type].length})</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <MilestoneList milestones={allMilestones} />
              </ScrollArea>
            </TabsContent>
            
            {activeTypes.map(type => (
              <TabsContent key={type} value={type} className="mt-4">
                <ScrollArea className="h-[400px] pr-4">
                  <MilestoneList milestones={milestonesByType[type]} />
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MilestoneList({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="space-y-3">
      {milestones.map((milestone) => (
        <MilestoneCard key={milestone.id} milestone={milestone} />
      ))}
    </div>
  );
}

function MilestoneCard({ milestone }: { milestone: Milestone }) {
  const icon = getMilestoneIcon(milestone.type);
  const formattedDate = format(new Date(milestone.date), "MMMM d, yyyy");
  const typeLabel = getMilestoneLabel(milestone.type);

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
      <div className="text-2xl flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold text-foreground">{milestone.title}</h4>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {typeLabel}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{milestone.description}</p>
        <p className="text-xs text-muted-foreground/70 mt-1">{formattedDate}</p>
      </div>
    </div>
  );
}
