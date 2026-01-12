import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut, CreditCard, Key, Loader2, AlertCircle, ExternalLink, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PasswordForm } from "./PasswordForm";
import { MilestonesDialog } from "./MilestonesDialog";
import { FREE_ROUND_LIMIT, getRemainingFreeRounds } from "@/integrations/supabase/subscription/freemium-utils";
import { isSubscriptionValid } from "@/integrations/supabase/subscription/subscription-utils";

interface Round {
  id: number;
  date: string;
  gross_score: number;
  hole_scores?: { score: number; par: number }[] | null;
  holes_played?: number;
  course_id?: number;
  courses?: { id: number; name: string };
  stableford_gross?: number;
  handicap_at_posting?: number;
}

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
  rounds?: Round[];
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
export const DashboardHeader = ({
  profileData,
  onAddRound,
  subscription,
  rounds = []
}: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
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
  const hasValidSubscription = subscription ? isSubscriptionValid(subscription) : false;
  const roundCount = rounds?.length || 0;
  const remainingFreeRounds = getRemainingFreeRounds(roundCount, hasValidSubscription);
  const isFreeTier = !hasValidSubscription && roundCount < FREE_ROUND_LIMIT;
  console.log("Current subscription state:", subscriptionState, subscription, { roundCount, remainingFreeRounds, isFreeTier });
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
        const {
          data
        } = await supabase.auth.getUser();
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
        variant: "destructive"
      });
    }
  };
  const handleProfileUpdate = async (values: z.infer<typeof profileFormSchema>) => {
    setLoading(true);
    try {
      const {
        error: profileError
      } = await supabase.from('profiles').update({
        first_name: values.first_name,
        last_name: values.last_name,
        username: values.username
      }).eq('id', profileData.id);
      if (profileError) throw profileError;
      const {
        data: userData
      } = await supabase.auth.getUser();
      if (userData?.user && userData.user.email !== values.email) {
        const {
          error: emailError
        } = await supabase.auth.updateUser({
          email: values.email
        });
        if (emailError) throw emailError;
      }
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated."
      });
      setProfileDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handlePasswordChange = async (values: z.infer<typeof passwordFormSchema>) => {
    setLoading(true);
    try {
      const {
        data: {
          session
        },
        error: signInError
      } = await supabase.auth.signInWithPassword({
        email: profileForm.getValues("email"),
        password: values.currentPassword
      });
      if (signInError) throw new Error("Current password is incorrect");
      const {
        error: updateError
      } = await supabase.auth.updateUser({
        password: values.newPassword
      });
      if (updateError) throw updateError;
      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated."
      });
      passwordForm.reset();
      setPasswordDialogOpen(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleSubscriptionAction = async (action: string) => {
    try {
      setCheckoutLoading(true);
      if (action === "create_checkout") {
        const {
          data: {
            session
          }
        } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("You must be logged in to subscribe");
        }
        console.log("Creating checkout session for user:", session.user.id);
        const {
          data,
          error
        } = await supabase.functions.invoke('create-checkout', {
          body: {
            user_id: session.user.id,
            user_email: session.user.email,
            user_name: profileData?.first_name && profileData?.last_name ? `${profileData.first_name} ${profileData.last_name}` : undefined,
            success_url: window.location.origin + '/auth/callback?subscription_status=success',
            cancel_url: window.location.origin + '/checkout?canceled=true'
          }
        });
        if (error) {
          console.error("Checkout creation error:", error);
          throw new Error(error.message || "Failed to create checkout session");
        }
        if (!data || !data.url) {
          console.error("No checkout URL returned:", data);
          throw new Error("No checkout URL returned");
        }
        console.log("Redirecting to Stripe Checkout:", data.url);
        window.location.href = data.url;
      } else if (action === "manage_subscription") {
        const {
          data: {
            session
          }
        } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("You must be logged in to manage your subscription");
        }
        console.log("Creating portal session for user:", session.user.id);
        try {
          const {
            data,
            error
          } = await supabase.functions.invoke('create-portal-session', {
            body: {
              user_id: session.user.id,
              return_url: window.location.origin + '/dashboard'
            }
          });
          console.log("Portal session response:", {
            data,
            error
          });
          if (error) {
            console.error("Portal session error:", error);
            throw new Error(error.message || "Failed to create customer portal session");
          }
          if (!data || !data.url) {
            console.error("No portal URL returned:", data);
            throw new Error("Failed to create customer portal session");
          }
          console.log("Redirecting to Stripe Portal:", data.url);
          window.location.href = data.url;
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
        variant: "destructive"
      });
    } finally {
      setCheckoutLoading(false);
    }
  };
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const renderSubscriptionManagement = () => {
    return <div className="pt-4 border-t">
        <h4 className="font-medium mb-3">Subscription Management</h4>
        
        {subscriptionState === "none" && <>
            <Button type="button" variant="default" className="flex items-center gap-2 mb-2 w-full sm:w-auto" onClick={() => handleSubscriptionAction("create_checkout")} disabled={checkoutLoading}>
              {checkoutLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              {checkoutLoading ? "Processing..." : "Subscribe Now"}
            </Button>
            
            <div className="flex items-center gap-2 text-sm py-1 px-2 bg-zinc-100 text-zinc-700 rounded-md w-fit mt-2">
              <div className="w-2 h-2 bg-zinc-400 rounded-full"></div>
              <span>No active subscription</span>
            </div>
          </>}
        
        {subscriptionState === "active" && <>
            <div className="flex items-center gap-2 text-sm py-1 px-2 bg-green-50 text-green-700 rounded-md w-fit mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Active Subscription</span>
            </div>
            
            <Button type="button" variant="outline" className="flex items-center gap-2 mb-2 w-full sm:w-auto" onClick={() => handleSubscriptionAction("manage_subscription")} disabled={checkoutLoading}>
              {checkoutLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              {checkoutLoading ? "Processing..." : "Manage Billing"}
            </Button>
          </>}
        
        {subscriptionState === "canceled_active" && <>
            <div className="flex items-center gap-2 text-sm py-1 px-2 bg-amber-50 text-amber-700 rounded-md w-fit mb-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span>Subscription Canceled</span>
            </div>
            
            {subscription?.current_period_end && <p className="text-sm text-muted-foreground mb-3">
                Your subscription will end on {formatDate(subscription.current_period_end)}
              </p>}
            
            <Button type="button" variant="default" className="flex items-center gap-2 w-full sm:w-auto" onClick={() => handleSubscriptionAction("create_checkout")} disabled={checkoutLoading}>
              {checkoutLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              {checkoutLoading ? "Processing..." : "Renew Subscription"}
            </Button>
          </>}
        
        {subscriptionState === "payment_issue" && <>
            <div className="flex items-center gap-2 text-sm py-1 px-2 bg-red-50 text-red-700 rounded-md w-fit mb-2">
              <AlertCircle className="w-4 h-4" />
              <span>Payment Issue Detected</span>
            </div>
            
            {subscription?.current_period_end && <p className="text-sm text-muted-foreground mb-3">
                Access available until {formatDate(subscription.current_period_end)}
              </p>}
            
            <Button type="button" variant="default" className="flex items-center gap-2 w-full sm:w-auto" onClick={() => handleSubscriptionAction("manage_subscription")} disabled={checkoutLoading}>
              {checkoutLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              {checkoutLoading ? "Processing..." : "Update Payment Method"}
            </Button>
          </>}
        
        {subscriptionState === "expired" && <>
            <div className="flex items-center gap-2 text-sm py-1 px-2 bg-zinc-100 text-zinc-700 rounded-md w-fit mb-3">
              <div className="w-2 h-2 bg-zinc-400 rounded-full"></div>
              <span>Subscription Expired</span>
            </div>
            
            <Button type="button" variant="default" className="flex items-center gap-2 w-full sm:w-auto" onClick={() => handleSubscriptionAction("create_checkout")} disabled={checkoutLoading}>
              {checkoutLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              {checkoutLoading ? "Processing..." : "Subscribe Again"}
            </Button>
          </>}
      </div>;
  };
  const renderProfileContent = () => {
    return <Form {...profileForm}>
        <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
          <FormField control={profileForm.control} name="first_name" render={({
          field
        }) => <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>} />
          
          <FormField control={profileForm.control} name="last_name" render={({
          field
        }) => <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>} />
          
          <FormField control={profileForm.control} name="username" render={({
          field
        }) => <FormItem>
                <FormLabel>Username (for leaderboard)</FormLabel>
                <FormControl>
                  <Input placeholder="Choose a username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>} />
          
          <FormField control={profileForm.control} name="email" render={({
          field
        }) => <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="Your email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>} />
          
          
          
          {renderSubscriptionManagement()}
          
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving Changes..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </Form>;
  };
  // The renderPasswordContent component has issues with dialog accessibility
  // Let's update it to fix the password input focus problem
  const renderPasswordContent = () => {
    return <div className="space-y-4">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>Please complete all the fields below to change your password</DialogDescription>
        </DialogHeader>
        <PasswordForm userEmail={profileForm.getValues("email")} onBack={() => {
        setPasswordDialogOpen(false);
        setProfileDialogOpen(true);
      }} onSuccess={() => {
        setPasswordDialogOpen(false);
        setProfileDialogOpen(true);
      }} />
      </div>;
  };
  return <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-4">
          <img src="/lovable-uploads/e65e4018-8608-4c06-aefc-191f9e9de8e0.png" alt="BirdieBoard Logo" className="h-10 sm:h-12 w-auto object-contain brightness-[0.85] contrast-[1.15]" />
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">Welcome, {profileData?.first_name || 'Golfer'}!</h1>
            {isFreeTier && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>Free tier: {remainingFreeRounds} round{remainingFreeRounds !== 1 ? 's' : ''} remaining</span>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                  onClick={() => handleSubscriptionAction("create_checkout")}
                >
                  <Sparkles className="h-3 w-3 mr-0.5" />
                  Upgrade
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <MilestonesDialog rounds={rounds} />
          <Button onClick={onAddRound} className="text-sm sm:text-base px-3 sm:px-4" size="sm" title="Add a New Round">
            Add a New Round
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full h-9 w-9 sm:h-10 sm:w-10 border border-primary text-primary hover:bg-primary hover:text-white">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={e => {
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
                    <DialogDescription className="font-thin text-xs">Need to change your password? Log out and select 'Forgot Password?' at login.</DialogDescription>
                  </DialogHeader>
                  {renderProfileContent()}
                </DialogContent>
              </Dialog>
              
              {/* Separated dialog to avoid focus issues */}
              <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                <DialogContent className="sm:max-w-[500px]"
              // Force this dialog to have the highest z-index to ensure inputs work correctly
              style={{
                zIndex: 9999
              }}>
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
      </div>
    </>;
};