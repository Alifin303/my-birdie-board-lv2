
import React from "react";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Key, ExternalLink, CreditCard } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

// Form schema for profile update
const profileFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address")
});

interface ProfileDialogProps {
  profileData: any;
  setProfileDialogOpen: (open: boolean) => void;
  setPasswordDialogOpen: (open: boolean) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  handleProfileUpdate: (values: z.infer<typeof profileFormSchema>) => Promise<void>;
  subscriptionData: any;
  subscriptionLoading: boolean;
  subscriptionError: any;
  handleSubscriptionAction: (action: string) => Promise<void>;
}

export const ProfileDialog = ({ 
  profileData, 
  setProfileDialogOpen,
  setPasswordDialogOpen,
  loading,
  setLoading,
  handleProfileUpdate,
  subscriptionData,
  subscriptionLoading,
  subscriptionError,
  handleSubscriptionAction
}: ProfileDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: profileData?.first_name || "",
      last_name: profileData?.last_name || "",
      username: profileData?.username || "",
      email: ""
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
    }
  }, [profileData, profileForm]);

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Profile Settings</DialogTitle>
        <DialogDescription>
          Update your profile information and manage your account
        </DialogDescription>
      </DialogHeader>

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
          
          <SubscriptionSection 
            subscriptionData={subscriptionData} 
            subscriptionLoading={subscriptionLoading} 
            subscriptionError={subscriptionError}
            handleSubscriptionAction={handleSubscriptionAction}
            loading={loading}
            queryClient={queryClient}
          />
          
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving Changes..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

interface SubscriptionSectionProps {
  subscriptionData: any;
  subscriptionLoading: boolean;
  subscriptionError: any;
  handleSubscriptionAction: (action: string) => Promise<void>;
  loading: boolean;
  queryClient: any;
}

const SubscriptionSection = ({ 
  subscriptionData, 
  subscriptionLoading, 
  subscriptionError, 
  handleSubscriptionAction,
  loading,
  queryClient
}: SubscriptionSectionProps) => {
  // Helper function to determine subscription state
  const getSubscriptionState = () => {
    if (!subscriptionData) return "none";
    
    // Check if subscription has a status field
    if (subscriptionData.status === "none") return "none";
    if (subscriptionData.status === "config_error") return "config_error";
    if (subscriptionData.status === "error") return "error";
    
    // Check if subscription is active
    if (subscriptionData.status === "active") return "active";
    
    // Check if subscription is cancelled but still has time remaining
    if (subscriptionData.status === "cancelled") {
      // If we have end date data, the subscription still has time remaining
      return "cancelled_with_time";
    }
    
    // Default to none
    return "none";
  };
  
  const subscriptionState = getSubscriptionState();
  
  return (
    <div className="pt-4 border-t">
      <h4 className="font-medium mb-3">Subscription Management</h4>
      {subscriptionLoading ? (
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          <span>Loading subscription info...</span>
        </div>
      ) : subscriptionData?.status === "config_error" ? (
        <div className="text-sm text-amber-600 mb-3">
          <p>Stripe configuration issue: {subscriptionData.message}</p>
          <p className="mt-2">Please contact support to enable subscriptions.</p>
        </div>
      ) : subscriptionError || subscriptionData?.error ? (
        <div className="text-sm text-destructive mb-3">
          <p>Error loading subscription data: {subscriptionError?.message || subscriptionData?.error}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-2"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['subscription'] })}
          >
            Retry
          </Button>
        </div>
      ) : (
        <>
          {/* 1. No Subscription */}
          {subscriptionState === "none" && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground mb-3">
                You don't currently have an active subscription.
              </div>
              <Button 
                type="button" 
                variant="default" 
                className="flex items-center gap-2"
                onClick={() => handleSubscriptionAction("subscribe")}
                disabled={loading}
              >
                <CreditCard className="w-4 h-4" />
                {loading ? "Processing..." : "Add Subscription"}
              </Button>
            </div>
          )}
          
          {/* 2. Active Subscription */}
          {subscriptionState === "active" && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground mb-3">
                Your subscription is active until {subscriptionData.data?.endDate}.
              </div>
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => handleSubscriptionAction("manage")}
                  disabled={loading}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Update Payment Details</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
                
                <Button 
                  type="button" 
                  variant="destructive" 
                  className="flex items-center gap-2"
                  onClick={() => handleSubscriptionAction("cancel")}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Cancel Subscription"}
                </Button>
              </div>
            </div>
          )}
          
          {/* 3. Cancelled Subscription (with time remaining) */}
          {subscriptionState === "cancelled_with_time" && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground mb-3">
                Your subscription will end on {subscriptionData.data?.endDate}.
              </div>
              <Button 
                type="button" 
                variant="default" 
                className="flex items-center gap-2"
                onClick={() => handleSubscriptionAction("reactivate")}
                disabled={loading}
              >
                <CreditCard className="w-4 h-4" />
                {loading ? "Processing..." : "Re-subscribe"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
