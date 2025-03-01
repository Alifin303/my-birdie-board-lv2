
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DeleteRoundDialogProps {
  roundId: number | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => Promise<void>;
}

export const DeleteRoundDialog = ({
  roundId,
  isOpen,
  onOpenChange,
  onSuccess
}: DeleteRoundDialogProps) => {
  const handleDeleteRound = async () => {
    if (!roundId) return;
    
    try {
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', roundId);

      if (error) {
        console.error("Error deleting round:", error);
        toast({
          title: "Error",
          description: "Failed to delete round. Please try again.",
          variant: "destructive"
        });
        return;
      }

      await onSuccess();
      toast({
        title: "Success",
        description: "Round deleted successfully",
      });
    } catch (err) {
      console.error("Error in delete operation:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Round</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this round? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteRound} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
