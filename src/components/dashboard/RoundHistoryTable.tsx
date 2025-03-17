
import React, { useState } from "react";
import { ChevronUp, ChevronDown, Trash, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Round } from "./types";

interface RoundHistoryTableProps {
  courseRounds: Round[];
  scoreType: 'gross' | 'net';
  handicapIndex: number;
  onViewScorecard: (round: Round) => void;
  onDeleteRound: (id: number) => void;
}

export const RoundHistoryTable = ({ 
  courseRounds, 
  scoreType, 
  handicapIndex, 
  onViewScorecard, 
  onDeleteRound 
}: RoundHistoryTableProps) => {
  const [sortField, setSortField] = useState<'date' | 'gross_score' | 'to_par_gross'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [deletingRoundId, setDeletingRoundId] = useState<number | null>(null);

  const handleSort = (field: 'date' | 'gross_score' | 'to_par_gross') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const renderSortIndicator = (field: 'date' | 'gross_score' | 'to_par_gross') => {
    if (sortField !== field) {
      return <span className="text-muted-foreground opacity-50 ml-1">↕️</span>;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="inline-block h-4 w-4 ml-1" /> 
      : <ChevronDown className="inline-block h-4 w-4 ml-1" />;
  };

  const formatTeeName = (teeName: string | null | undefined): string => {
    if (!teeName || teeName === '') {
      return 'Standard Tees';
    }
    return teeName;
  };
  
  const sortedRounds = [...courseRounds].sort((a, b) => {
    if (sortField === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortField === 'gross_score') {
      return sortDirection === 'asc' ? a.gross_score - b.gross_score : b.gross_score - a.gross_score;
    } else { // to_par_gross
      return sortDirection === 'asc' ? a.to_par_gross - b.to_par_gross : b.to_par_gross - a.to_par_gross;
    }
  });

  return (
    <div className="overflow-x-auto rounded-lg border bg-background">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              <button
                onClick={() => handleSort('date')}
                className="flex items-center cursor-pointer hover:text-primary transition-colors"
              >
                <span>Date</span>
                {renderSortIndicator('date')}
              </button>
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              <span>Tee</span>
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              <button
                onClick={() => handleSort('gross_score')}
                className="flex items-center cursor-pointer hover:text-primary transition-colors"
              >
                <span>{scoreType === 'gross' ? 'Gross Score' : 'Net Score'}</span>
                {renderSortIndicator('gross_score')}
              </button>
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              <button
                onClick={() => handleSort('to_par_gross')}
                className="flex items-center cursor-pointer hover:text-primary transition-colors"
              >
                <span>To Par</span>
                {renderSortIndicator('to_par_gross')}
              </button>
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
              <span>Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedRounds.map((round) => {
            const netScore = round.net_score !== undefined && round.net_score !== null
              ? round.net_score
              : Math.max(0, round.gross_score - handicapIndex);
            
            const netToPar = round.to_par_net !== undefined && round.to_par_net !== null
              ? round.to_par_net
              : Math.max(-72, round.to_par_gross - handicapIndex);
            
            return (
              <tr key={round.id} className="border-b last:border-0">
                <td className="px-4 py-3 text-sm font-medium">
                  {new Date(round.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  {formatTeeName(round.tee_name)}
                </td>
                <td className="px-4 py-3 text-sm">
                  {scoreType === 'gross' 
                    ? round.gross_score 
                    : netScore}
                </td>
                <td className="px-4 py-3 text-sm">
                  {scoreType === 'gross' 
                    ? (round.to_par_gross > 0 ? '+' : '') + round.to_par_gross
                    : (netToPar > 0 ? '+' : '') + netToPar}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onViewScorecard(round)}
                      title="View scorecard"
                      className="h-8 px-2"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setDeletingRoundId(round.id)}
                          className="h-8 px-2 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          title="Delete round"
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to delete this round?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the round
                            data and remove it from all statistics.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDeletingRoundId(null)}>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => {
                              if (deletingRoundId) {
                                onDeleteRound(deletingRoundId);
                              }
                              setDeletingRoundId(null);
                            }} 
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
