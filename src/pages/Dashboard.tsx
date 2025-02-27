import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AddRoundModal } from "@/components/AddRoundModal";

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (error) throw error;
      return data;
    }
  });

  // Handle logout
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

  // Render profile content
  const renderProfileContent = () => {
    if (!profile) return null;
    return (
      <div className="space-y-4">
        <div>
          <p><strong>Name:</strong> {profile.first_name} {profile.last_name}</p>
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Handicap:</strong> {profile.handicap || 'Not set'}</p>
        </div>
      </div>
    );
  };

  // Render dashboard content
  const renderDashboard = () => {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Welcome, {profile?.first_name || 'Golfer'}!</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            Add a New Round
          </Button>
        </div>
        
        <div className="grid gap-6">
          {/* Dashboard content here */}
        </div>
      </div>
    );
  };

  // Render course detail
  const renderCourseDetail = () => {
    if (!selectedCourse) return null;
    return (
      <div>
        {/* Course detail content here */}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* User Account Menu */}
      <div className="absolute top-4 right-4 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Dialog>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Profile Settings</DialogTitle>
                  <DialogDescription>
                    Update your profile information
                  </DialogDescription>
                </DialogHeader>
                {renderProfileContent()}
              </DialogContent>
            </Dialog>
            
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {selectedCourse ? renderCourseDetail() : renderDashboard()}

      <AddRoundModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
