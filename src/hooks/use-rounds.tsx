
import { useState, useEffect } from 'react';
import { supabase, logSupabaseOperation, fetchCourseById } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface Round {
  id?: number;
  user_id: string;
  course_id: number;
  date: string;
  tee_id: string;
  tee_name: string;
  gross_score: number;
  net_score?: number;
  to_par_gross: number;
  to_par_net?: number;
  hole_scores: any[];
}

export function useRounds() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check authentication state on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setAuthenticated(!!session);
        setSessionChecked(true);
      } catch (err) {
        console.error('Error checking authentication status:', err);
        setAuthenticated(false);
        setSessionChecked(true);
      }
    };

    checkSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAuthenticated(!!session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Add a new round
  const addRound = async (round: Round): Promise<number | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Check for session first 
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        const errorMessage = 'No active session found. Please log in to add rounds.';
        console.error(errorMessage);
        toast({
          title: "Authentication Error",
          description: errorMessage,
          variant: "destructive",
        });
        throw new Error(errorMessage);
      }
      
      console.log("Adding new round with data:", round);
      
      // Log the course details for this round
      const courseDetails = await fetchCourseById(round.course_id);
      console.log("Course for this round:", courseDetails);
      
      const { data, error } = await supabase
        .from('rounds')
        .insert(round)
        .select()
        .single();

      if (error) {
        console.error("Error inserting round:", error);
        throw error;
      }

      logSupabaseOperation('addRound', data);
      
      // Invalidate the rounds query to refresh data
      queryClient.invalidateQueries({ queryKey: ['userRounds'] });
      
      return data.id;
    } catch (err) {
      console.error('Error adding round:', err);
      setError(err instanceof Error ? err : new Error('Unknown error adding round'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get rounds for a specific course
  const getRoundsForCourse = async (courseId: number): Promise<any[]> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching rounds for course ID: ${courseId}`);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const errorMessage = 'No session found. Please log in to view rounds.';
        console.error(errorMessage);
        toast({
          title: "Authentication Error",
          description: errorMessage,
          variant: "destructive",
        });
        throw new Error(errorMessage);
      }
      
      const { data, error } = await supabase
        .from('rounds')
        .select(`
          *,
          courses:course_id(id, name, city, state)
        `)
        .eq('user_id', session.user.id)
        .eq('course_id', courseId)
        .order('date', { ascending: false });
        
      if (error) {
        console.error("Error fetching rounds for course:", error);
        throw error;
      }

      logSupabaseOperation('getRoundsForCourse', data);
      return data || [];
    } catch (err) {
      console.error('Error fetching rounds for course:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching rounds'));
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Delete a round
  const deleteRound = async (roundId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Deleting round with ID: ${roundId}`);
      
      // Check for session first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const errorMessage = 'No session found. Please log in to delete rounds.';
        console.error(errorMessage);
        toast({
          title: "Authentication Error",
          description: errorMessage,
          variant: "destructive",
        });
        throw new Error(errorMessage);
      }
      
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', roundId);
        
      if (error) {
        console.error("Error deleting round:", error);
        throw error;
      }

      logSupabaseOperation('deleteRound', { id: roundId });
      
      // Invalidate the rounds query to refresh data
      queryClient.invalidateQueries({ queryKey: ['userRounds'] });
      
      return true;
    } catch (err) {
      console.error('Error deleting round:', err);
      setError(err instanceof Error ? err : new Error('Unknown error deleting round'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    authenticated,
    sessionChecked,
    addRound,
    getRoundsForCourse,
    deleteRound
  };
}
