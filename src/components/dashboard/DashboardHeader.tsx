
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut, CreditCard, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface DashboardHeaderProps {
  profileData: any;
  onAddRound: () => void;
}

// Form schema for profile update
const profileFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address")
});

// Form schema for password change
const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password")
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const DashboardHeader = ({ profileData, onAddRound }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState("none"); // can be "none", "active", "cancelled"

  // Initialize the profile form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: profileData?.first_name || "",
      last_name: profileData?.last_name || "",
      username: profileData?.username || "",
      email: ""
    }
  });

  // Initialize the password form
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  // Load profile data into form when it changes
  React.useEffect(() => {
    if (profileData) {
      profileForm.reset({
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
        username: profileData.username || "",
        email: profileData.email || ""
      });

      // Fetch user email if not in profileData
      const getUserEmail = async () => {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.email) {
          profileForm.setValue("email", data.user.email);
        }
      };
      
      getUserEmail();
    }
  }, [profileData, profileForm]);

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

  const handleProfileUpdate = async (values: z.infer<typeof profileFormSchema>) => {
    setLoading(true);
    try {
      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          username: values.username
        })
        .eq('id', profileData.id);

      if (profileError) throw profileError;

      // Update email if changed
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user && userData.user.email !== values.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: values.email
        });
        
        if (emailError) throw emailError;
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      setProfileDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values: z.infer<typeof passwordFormSchema>) => {
    setLoading(true);
    try {
      // First verify current password
      const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
        email: profileForm.getValues("email"),
        password: values.currentPassword
      });

      if (signInError) throw new Error("Current password is incorrect");

      // Then update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.newPassword
      });

      if (updateError) throw updateError;

      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      });

      passwordForm.reset();
      setPasswordDialogOpen(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionAction = (action: string) => {
    // This is a placeholder for future Stripe integration
    toast({
      title: "Subscription",
      description: `${action} feature will be implemented with Stripe integration.`,
    });
  };

  const renderProfileContent = () => {
    return (
      <Form {...profileForm}>
        <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
          <FormField
            control={profileForm.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={profileForm.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={profileForm.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username (for leaderboard)</FormLabel>
                <FormControl>
                  <Input placeholder="Choose a username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={profileForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="Your email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setProfileDialogOpen(false);
                setPasswordDialogOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Key className="w-4 h-4" />
              Change Password
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3">Subscription Management</h4>
            {subscriptionStatus === "none" && (
              <Button 
                type="button" 
                variant="default" 
                className="flex items-center gap-2"
                onClick={() => handleSubscriptionAction("Add Subscription")}
              >
                <CreditCard className="w-4 h-4" />
                Add Subscription
              </Button>
            )}
            
            {subscriptionStatus === "active" && (
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => handleSubscriptionAction("Update Payment Details")}
                >
                  <CreditCard className="w-4 h-4" />
                  Update Payment Details
                </Button>
                
                <Button 
                  type="button" 
                  variant="destructive" 
                  className="flex items-center gap-2"
                  onClick={() => handleSubscriptionAction("Cancel Subscription")}
                >
                  Cancel Subscription
                </Button>
              </div>
            )}
            
            {subscriptionStatus === "cancelled" && (
              <Button 
                type="button" 
                variant="default" 
                className="flex items-center gap-2"
                onClick={() => handleSubscriptionAction("Re-subscribe")}
              >
                <CreditCard className="w-4 h-4" />
                Re-subscribe
              </Button>
            )}
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving Changes..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };
  
  const renderPasswordContent = () => {
    return (
      <Form {...passwordForm}>
        <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
          <FormField
            control={passwordForm.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter your current password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={passwordForm.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Enter your new password" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={passwordForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Confirm your new password" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                passwordForm.reset();
                setPasswordDialogOpen(false);
                setProfileDialogOpen(true);
              }}
              className="mr-2"
            >
              Back to Profile
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {profileData?.first_name || 'Golfer'}!</h1>
        </div>
        <Button 
          onClick={onAddRound}
          className="relative"
        >
          Add a New Round
        </Button>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="lg" className="rounded-full h-12 w-12 flex items-center justify-center border border-muted bg-background/80 backdrop-blur-sm">
              <User className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => {
                  e.preventDefault();
                  setProfileDialogOpen(true);
                }}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Profile Settings</DialogTitle>
                  <DialogDescription>
                    Update your profile information and manage your account
                  </DialogDescription>
                </DialogHeader>
                {renderProfileContent()}
              </DialogContent>
            </Dialog>
            
            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password to set a new one
                  </DialogDescription>
                </DialogHeader>
                {renderPasswordContent()}
              </DialogContent>
            </Dialog>
            
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};
