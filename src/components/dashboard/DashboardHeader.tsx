import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut, CreditCard, Key, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface Subscription {
  id?: string;
  subscription_id?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
}

interface DashboardHeaderProps {
  profileData: any;
  onAddRound: () => void;
  subscription?: Subscription | null;
}

const profileFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address")
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password")
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const DashboardHeader = ({ profileData, onAddRound, subscription }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  const getSubscriptionState = () => {
    if (!subscription) {
      return "none";
    }
    
    const validStatuses = ['active', 'trialing', 'paid'];
    const isPeriodActive = subscription.current_period_end && new Date(subscription.current_period_end) > new Date();
    
    if (validStatuses.includes(subscription.status || "")) {
      return "active";
    }
    
    if (subscription.cancel_at_period_end && isPeriodActive) {
      return "canceled_active";
    }
    
    if ((subscription.status === "past_due" || subscription.status === "incomplete") && isPeriodActive) {
      return "payment_issue";
    }
    
    return "expired";
  };

  const subscriptionState = getSubscriptionState();
  console.log("Current subscription state:", subscriptionState, subscription);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: profileData?.first_name || "",
      last_name: profileData?.last_name || "",
      username: profileData?.username || "",
      email: ""
    }
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  React.useEffect(() => {
    if (profileData) {
      profileForm.reset({
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
        username: profileData.username || "",
        email: profileData.email || ""
      });

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
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          username: values.username
        })
        .eq('id', profileData.id);

      if (profileError) throw profileError;

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
      const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
        email: profileForm.getValues("email"),
        password: values.currentPassword
      });

      if (signInError) throw new Error("Current password is incorrect");

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

  const handleSubscriptionAction = async (action: string) => {
    try {
      setCheckoutLoading(true);
      
      if (action === "create_checkout") {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("You must be logged in to subscribe");
        }
        
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: { 
            user_id: session.user.id,
            email: session.user.email,
            return_url: window.location.origin + '/dashboard'
          }
        });
        
        if (error) throw error;
        
        if (data?.url) {
          window.location.href = data.url;
        } else {
          throw new Error("Failed to create checkout session");
        }
      } 
      else if (action === "manage_subscription") {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("You must be logged in to manage your subscription");
        }
        
        console.log("Calling create-portal-session with user ID:", session.user.id);
        
        try {
          const { data, error } = await supabase.functions.invoke('create-portal-session', {
            body: { 
              user_id: session.user.id,
              return_url: window.location.origin + '/dashboard'
            }
          });
          
          console.log("Portal session response:", { data, error });
          
          if (error) {
            console.error("Portal session error:", error);
            throw new Error(error.message || "Failed to create customer portal session");
          }
          
          if (data?.url) {
            console.log("Redirecting to portal URL:", data.url);
            window.location.href = data.url;
          } else if (data?.error) {
            throw new Error(data.error);
          } else {
            throw new Error("Failed to create customer portal session");
          }
        } catch (e) {
          console.error("Error invoking create-portal-session:", e);
          throw e;
        }
      }
    } catch (error: any) {
      console.error('Error managing subscription:', error);
      toast({
        title: "Subscription Error",
        description: error.message || "An error occurred with your subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const renderSubscriptionManagement = () => {
    return (
      <div className="pt-4 border-t">
        <h4 className="font-medium mb-3">Subscription Management</h4>
        
        {subscriptionState === "none" && (
          <>
            <Button 
              type="button" 
              variant="default" 
              className="flex items-center gap-2 mb-2 w-full sm:w-auto"
              onClick={() => handleSubscriptionAction("create_checkout")}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              {checkoutLoading ? "Processing..." : "Subscribe Now"}
            </Button>
            
            <div className="flex items-center gap-2 text-sm py-1 px-2 bg-zinc-100 text-zinc-700 rounded-md w-fit mt-2">
              <div className="w-2 h-2 bg-zinc-400 rounded-full"></div>
              <span>No active subscription</span>
            </div>
          </>
        )}
        
        {subscriptionState === "active" && (
          <>
            <div className="flex items-center gap-2 text-sm py-1 px-2 bg-green-50 text-green-700 rounded-md w-fit mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Active Subscription</span>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              className="flex items-center gap-2 mb-2 w-full sm:w-auto"
              onClick={() => handleSubscriptionAction("manage_subscription")}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              {checkoutLoading ? "Processing..." : "Manage Billing"}
            </Button>
          </>
        )}
        
        {subscriptionState === "canceled_active" && (
          <>
            <div className="flex items-center gap-2 text-sm py-1 px-2 bg-amber-50 text-amber-700 rounded-md w-fit mb-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span>Subscription Canceled</span>
            </div>
            
            {subscription?.current_period_end && (
              <p className="text-sm text-muted-foreground mb-3">
                You can still use BirdieBoard Premium until {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            )}
            
            <Button 
              type="button" 
              variant="default" 
              className="flex items-center gap-2 w-full sm:w-auto"
              onClick={() => handleSubscriptionAction("create_checkout")}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              {checkoutLoading ? "Processing..." : "Renew Subscription"}
            </Button>
          </>
        )}
        
        {subscriptionState === "payment_issue" && (
          <>
            <div className="flex items-center gap-2 text-sm py-1 px-2 bg-red-50 text-red-700 rounded-md w-fit mb-2">
              <AlertCircle className="w-4 h-4" />
              <span>Payment Issue Detected</span>
            </div>
            
            {subscription?.current_period_end && (
              <p className="text-sm text-muted-foreground mb-3">
                Access available until {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            )}
            
            <Button 
              type="button" 
              variant="default" 
              className="flex items-center gap-2 w-full sm:w-auto"
              onClick={() => handleSubscriptionAction("manage_subscription")}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              {checkoutLoading ? "Processing..." : "Update Payment Method"}
            </Button>
          </>
        )}
        
        {subscriptionState === "expired" && (
          <>
            <div className="flex items-center gap-2 text-sm py-1 px-2 bg-zinc-100 text-zinc-700 rounded-md w-fit mb-3">
              <div className="w-2 h-2 bg-zinc-400 rounded-full"></div>
              <span>Subscription Expired</span>
            </div>
            
            <Button 
              type="button" 
              variant="default" 
              className="flex items-center gap-2 w-full sm:w-auto"
              onClick={() => handleSubscriptionAction("create_checkout")}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              {checkoutLoading ? "Processing..." : "Subscribe Again"}
            </Button>
          </>
        )}
      </div>
    );
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
          
          {renderSubscriptionManagement()}
          
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
