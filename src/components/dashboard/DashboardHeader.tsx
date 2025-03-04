
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardHeaderProps {
  profileData: any;
  onAddRound: () => void;
}

export const DashboardHeader = ({ profileData, onAddRound }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderProfileContent = () => {
    if (!profileData) return null;
    return (
      <div className="space-y-4">
        <div>
          <p><strong>Name:</strong> {profileData.first_name} {profileData.last_name}</p>
          <p><strong>Username:</strong> {profileData.username}</p>
          <p><strong>Handicap:</strong> {profileData.handicap || 'Not set'}</p>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight drop-shadow-md">Welcome, {profileData?.first_name || 'Golfer'}!</h1>
        </div>
        <Button 
          onClick={onAddRound}
          className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all"
        >
          Add a New Round
        </Button>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="lg" className="rounded-full h-12 w-12 flex items-center justify-center border border-muted bg-white/10 backdrop-blur-sm text-white">
              <User className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => {
                  e.preventDefault();
                  setProfileDialogOpen(true);
                }} className="hover:bg-white/20">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-white/10 backdrop-blur-md border-white/20 text-white">
                <DialogHeader>
                  <DialogTitle>Profile Settings</DialogTitle>
                  <DialogDescription className="text-white/80">
                    Update your profile information
                  </DialogDescription>
                </DialogHeader>
                {renderProfileContent()}
              </DialogContent>
            </Dialog>
            
            <DropdownMenuItem onClick={handleLogout} className="hover:bg-white/20">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};
