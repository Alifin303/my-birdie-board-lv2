import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Round } from "./types";

interface RoundHistoryTableProps {
  courseRounds: Round[];
  scoreType: 'gross' | 'net';
  handicapIndex: number;
  onViewScorecard: (round: Round) => void;
  onDeleteRound?: (roundId: number) => void;
  isDemo?: boolean;
}

export const RoundHistoryTable = ({
  courseRounds,
  scoreType,
  handicapIndex,
  onViewScorecard,
  onDeleteRound,
  isDemo = false
}: RoundHistoryTableProps) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateNetScore = (round: Round, handicapIndex: number): number => {
    return round.gross_score - handicapIndex;
  };

  const formatToPar = (value: number) => {
    if (value === 0) return 'E';
    return (value > 0 ? '+' : '') + value;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-muted">
            <th className="text-left py-3 px-2 font-semibold text-xs">Date</th>
            <th className="text-center py-3 px-2 font-semibold text-xs">Tee</th>
            <th className="text-center py-3 px-2 font-semibold text-xs">Score</th>
            <th className="text-center py-3 px-2 font-semibold text-xs">To Par</th>
            <th className="text-center py-3 px-2 font-semibold text-xs">HCP</th>
            <th className="text-center py-3 px-2 font-semibold text-xs">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courseRounds.map((round) => (
            <tr key={round.id} className="border-b border-muted/50 hover:bg-muted/20">
              <td className="py-3 px-2 text-xs">
                {formatDate(round.date)}
              </td>
              <td className="text-center py-3 px-2 text-xs">
                {round.tee_name || 'Unknown'}
              </td>
              <td className="text-center py-3 px-2 text-xs font-medium">
                {scoreType === 'gross' ? round.gross_score : (round.net_score || calculateNetScore(round, handicapIndex))}
              </td>
              <td className="text-center py-3 px-2 text-xs font-medium">
                {formatToPar(scoreType === 'gross' ? (round.to_par_gross || 0) : (round.to_par_net || 0))}
              </td>
              <td className="text-center py-3 px-2 text-xs">
                {round.handicap_at_posting ? round.handicap_at_posting.toFixed(1) : handicapIndex.toFixed(1)}
              </td>
              <td className="text-center py-3 px-2">
                <div className="flex justify-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewScorecard(round)}
                    className="h-7 w-7 p-0"
                    title={isDemo ? "View Demo Scorecard" : "View Scorecard"}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  {!isDemo && onDeleteRound && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteRound(round.id)}
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      title="Delete Round"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
