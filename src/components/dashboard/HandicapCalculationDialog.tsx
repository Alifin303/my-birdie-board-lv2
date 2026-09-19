import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useHandicapBreakdown } from "@/hooks/use-handicap-breakdown";
import { formatDifferential, formatIndex, MAX_SCORING_RECORD } from "@/lib/whs";

interface HandicapCalculationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export const HandicapCalculationDialog = ({ open, onOpenChange, userId }: HandicapCalculationDialogProps) => {
  const { data, isLoading } = useHandicapBreakdown(userId, open);

  const entries = data?.entries ?? [];
  const selection = data?.selection ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1rem)] max-w-3xl max-h-[calc(100dvh-1rem)] overflow-y-auto sm:max-h-[90vh]">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle className="text-xl leading-tight">How your handicap is calculated</DialogTitle>
          <DialogDescription>
            Your handicap index uses the lowest score differentials from your most recent{" "}
            {MAX_SCORING_RECORD} rounds, under the World Handicap System.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-10 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : entries.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground">
            We need rounds with course rating and slope data before we can show this.
          </p>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="rounded-lg border bg-muted/40 p-3 sm:p-4 space-y-2 text-sm">
              {selection ? (
                <>
                  <p>
                    <span className="font-medium">Rounds in your scoring record:</span>{" "}
                    {data?.scoringRecordSize}
                  </p>
                  <p>
                    <span className="font-medium">Differentials used:</span> lowest {selection.count}
                    {selection.adjustment !== 0 && ` (with a ${selection.adjustment} stroke adjustment)`}
                  </p>
                  <p>
                    <span className="font-medium">Average of those differentials:</span>{" "}
                    {data?.average != null ? formatDifferential(data.average) : "—"}
                  </p>
                  <p className="text-base font-semibold text-primary pt-1">
                    Handicap Index: {data?.index != null ? formatIndex(data.index) : "—"}
                  </p>
                </>
              ) : (
                <p>You need at least 3 rounds with rating and slope data for a handicap index.</p>
              )}
            </div>

            {/* Legend */}
            <div className="grid gap-2 text-xs sm:flex sm:flex-wrap sm:items-center sm:gap-3">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Counts towards your handicap
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/50" /> In record, not used
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" /> Outside your last{" "}
                {MAX_SCORING_RECORD} rounds
              </span>
            </div>

            {/* Table */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-2 font-medium">Date</th>
                    <th className="py-2 pr-2 font-medium">Course</th>
                    <th className="py-2 pr-2 font-medium text-right">Score</th>
                    <th className="py-2 pr-2 font-medium text-right">CR / Slope</th>
                    <th className="py-2 pr-2 font-medium text-right">Diff</th>
                    <th className="py-2 font-medium text-right">Used</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className={`border-b last:border-0 ${
                        entry.counting ? "bg-primary/5" : !entry.inScoringRecord ? "opacity-50" : ""
                      }`}
                    >
                      <td className="py-2 pr-2 whitespace-nowrap">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="py-2 pr-2">
                        <span className="font-medium">{entry.courseName}</span>
                        <span className="block text-xs text-muted-foreground">
                          {entry.teeName}
                          {entry.holesPlayed === 9 ? " · 9 holes" : ""}
                        </span>
                      </td>
                      <td className="py-2 pr-2 text-right font-semibold">{entry.grossScore}</td>
                      <td className="py-2 pr-2 text-right whitespace-nowrap text-muted-foreground">
                        {entry.rating.toFixed(1)} / {entry.slope}
                      </td>
                      <td className="py-2 pr-2 text-right">{formatDifferential(entry.differential)}</td>
                      <td className="py-2 text-right">
                        {entry.counting ? (
                          <Badge className="bg-primary text-primary-foreground">Counting</Badge>
                        ) : entry.inScoringRecord ? (
                          <Badge variant="secondary">Not used</Badge>
                        ) : (
                          <Badge variant="outline">Outside 20</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Compact mobile round list */}
            <div className="space-y-2 sm:hidden">
              {entries.map((entry) => (
                <article
                  key={entry.id}
                  className={`rounded-lg border p-3 ${
                    entry.counting ? "border-primary/40 bg-primary/5" : !entry.inScoringRecord ? "opacity-60" : "bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-semibold leading-snug">{entry.courseName}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {entry.teeName}
                        {entry.holesPlayed === 9 ? " · 9 holes" : ""}
                      </p>
                    </div>
                    {entry.counting ? (
                      <Badge className="shrink-0 bg-primary text-primary-foreground">Counting</Badge>
                    ) : entry.inScoringRecord ? (
                      <Badge variant="secondary" className="shrink-0">Not used</Badge>
                    ) : (
                      <Badge variant="outline" className="shrink-0">Outside 20</Badge>
                    )}
                  </div>

                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t pt-3 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">Date</dt>
                      <dd className="font-medium">{new Date(entry.date).toLocaleDateString()}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Score</dt>
                      <dd className="font-semibold">{entry.grossScore}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Course rating / slope</dt>
                      <dd>{entry.rating.toFixed(1)} / {entry.slope}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Differential</dt>
                      <dd className="font-semibold">{formatDifferential(entry.differential)}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              9-hole rounds are converted to an 18-hole equivalent (doubled, plus one stroke) as the World
              Handicap System requires.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
