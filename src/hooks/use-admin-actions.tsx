
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useAdminActions() {
  const [isRecalculatingHandicaps, setIsRecalculatingHandicaps] = useState(false);
  const { toast } = useToast();

  const recalculateAllHandicaps = async () => {
    setIsRecalculatingHandicaps(true);
    try {
      // Call the database function to recalculate all handicaps
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

  const updateRoundScoreAndHoles = async (
    roundId: number,
    updates: { 
      gross_score?: number; 
      holes_played?: number; 
      to_par_gross?: number;
    }
  ) => {
    try {
      // Get the round details first to check user_id
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
      
      // Update the round with the provided updates
      const { error } = await supabase
        .from('rounds')
        .update(updates)
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
      
      // After updating the round, recalculate the user's handicap
      const { calculateHandicapIndex, updateUserHandicap } = await import('@/integrations/supabase');
      
      // Get all rounds for this user to recalculate handicap
      const { data: userRounds, error: userRoundsError } = await supabase
        .from('rounds')
        .select('gross_score, holes_played')
        .eq('user_id', roundData.user_id)
        .order('date', { ascending: false });
      
      if (userRoundsError) {
        console.error('Error fetching user rounds:', userRoundsError);
        toast({
          title: 'Warning',
          description: 'Round updated but handicap recalculation failed.',
          variant: 'destructive',
        });
        return true; // Return true because the round was updated
      }
      
      // Extract scores and hole counts
      const scores = userRounds.map(round => round.gross_score);
      const holeCounts = userRounds.map(round => round.holes_played || 18);
      
      // Update the user's handicap
      await updateUserHandicap(
        roundData.user_id,
        scores,
        holeCounts
      );
      
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
    updateRoundScoreAndHoles
  };
}
