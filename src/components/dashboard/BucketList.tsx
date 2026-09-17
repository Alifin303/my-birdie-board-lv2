import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Flag, Plus, Trash2 } from "lucide-react";
import { courseDisplayName } from "@/lib/course-seo";
import { useBucketList } from "@/hooks/use-bucket-list";
import { AddToBucketListDialog } from "./AddToBucketListDialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CollapseToggle } from "./CollapseToggle";
import { useCollapsibleSection } from "@/hooks/use-collapsible-section";

interface BucketListProps {
  playedCourseIds: number[];
}

export function BucketList({ playedCourseIds }: BucketListProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { bucketList, isLoading, removeCourse } = useBucketList();
  const [isOpen, setIsOpen] = useCollapsibleSection("bucket-list");

  const played = new Set(playedCourseIds);
  const courses = bucketList.filter((c) => !played.has(c.id));

  return (
    <div className="space-y-3 sm:space-y-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-xl sm:text-2xl font-semibold text-primary flex items-center gap-2">
          <Flag className="h-5 w-5 text-destructive" />
          Your Bucket List
        </h2>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add a course
          </Button>
          <CollapsibleTrigger asChild>
            <CollapseToggle open={isOpen} label="your bucket list" />
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent className="space-y-3 sm:space-y-4">

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading your bucket list…</p>
      ) : courses.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Courses you'd love to play go here. Add one and it'll show as a red pin on your map — once you
          log a round there, it moves into Your Courses automatically.
        </p>
      ) : (
        <ul className="divide-y rounded-md border">
          {courses.map((course) => (
            <li key={course.id} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="font-medium truncate">{courseDisplayName(course.name)}</p>
                {(course.city || course.state) && (
                  <p className="text-xs text-muted-foreground truncate">
                    {[course.city, course.state].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeCourse.mutate(course.id)}
                aria-label={`Remove ${courseDisplayName(course.name)} from your bucket list`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      </CollapsibleContent>
      </Collapsible>

      <AddToBucketListDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
    </div>
  );
}
