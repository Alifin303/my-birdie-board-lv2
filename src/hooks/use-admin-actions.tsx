import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { HoleScore } from '@/components/dashboard/scorecard/types';

export function useAdminActions() {
  const [isRecalculatingHandicaps, setIsRecalculatingHandicaps] = useState(false);
  const [isRecalculatingStableford, setIsRecalculatingStableford] = useState(false);
  const { toast } = useToast();

  const recalculateAllHandicaps = async () => {
    setIsRecalculatingHandicaps(true);
    try {
      const { data, error } = await supabase.rpc('recalculate_all_handicaps');
      
      if (error) {
        console.error('Error recalculating handicaps:', error);
        toast({
          title: 'Error',
          description: 'Failed to recalculate handicaps. Please try again.',
          variant: 'destructive',
        });
        return false;
      }
      
      toast({
        title: 'Success',
        description: 'All handicaps have been recalculated successfully.',
      });
      return true;
    } catch (err) {
      console.error('Error in recalculate all handicaps:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsRecalculatingHandicaps(false);
    }
  };

  const recalculateAllStableford = async () => {
    setIsRecalculatingStableford(true);
    try {
      const { data, error } = await supabase.rpc('recalculate_all_stableford_scores');
      
      if (error) {
        console.error('Error recalculating Stableford scores:', error);
        toast({
          title: 'Error',
          description: 'Failed to recalculate Stableford scores. Please try again.',
          variant: 'destructive',
        });
        return false;
      }
      
      toast({
        title: 'Success',
        description: 'All Stableford scores have been recalculated successfully.',
      });
      return true;
    } catch (err) {
      console.error('Error in recalculate all Stableford scores:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsRecalculatingStableford(false);
    }
  };

  const updateRoundScoreAndHoles = async (
    roundId: number,
    updates: { 
      gross_score?: number; 
      holes_played?: number; 
      to_par_gross?: number;
      hole_scores?: HoleScore[];
    }
  ) => {
    try {
      const { data: roundData, error: roundError } = await supabase
        .from('rounds')
        .select('user_id')
        .eq('id', roundId)
        .single();
      
      if (roundError) {
        console.error('Error fetching round:', roundError);
        toast({
          title: 'Error',
          description: 'Could not fetch round details.',
          variant: 'destructive',
        });
        return false;
      }

      const updateData = {
        ...updates,
        hole_scores: updates.hole_scores ? JSON.stringify(updates.hole_scores) : undefined
      };
      
      const { error } = await supabase
        .from('rounds')
        .update(updateData)
        .eq('id', roundId);
      
      if (error) {
        console.error('Error updating round:', error);
        toast({
          title: 'Error',
          description: 'Failed to update round.',
          variant: 'destructive',
        });
        return false;
      }
      
      const { data: userRounds, error: userRoundsError } = await supabase
        .from('rounds')
        .select('gross_score, holes_played')
        .eq('user_id', roundData.user_id)
        .order('date', { ascending: false });
      
      if (!userRoundsError && userRounds) {
        const scores = userRounds.map(round => round.gross_score);
        const holeCounts = userRounds.map(round => round.holes_played || 18);
        
        const { updateUserHandicap } = await import('@/integrations/supabase');
        await updateUserHandicap(roundData.user_id);
      }
      
      toast({
        title: 'Success',
        description: 'Round updated and handicap recalculated.',
      });
      
      return true;
    } catch (err) {
      console.error('Error updating round and handicap:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
      return false;
    }
  };
  
  return {
    recalculateAllHandicaps,
    isRecalculatingHandicaps,
    recalculateAllStableford,
    isRecalculatingStableford,
    updateRoundScoreAndHoles
  };
}
