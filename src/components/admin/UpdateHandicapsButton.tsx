
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function UpdateHandicapsButton() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleUpdateHandicaps = async () => {
    setIsUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-handicaps');
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Updated handicaps for ${data.updates.length} users`,
      });
      
      console.log('Handicap updates:', data.updates);
    } catch (error) {
      console.error('Error updating handicaps:', error);
      toast({
        title: "Error",
        description: "Failed to update handicaps. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Button 
      onClick={handleUpdateHandicaps}
      disabled={isUpdating}
    >
      {isUpdating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Updating Handicaps...
        </>
      ) : (
        'Update All Handicaps'
      )}
    </Button>
  );
}
