
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { ProfileDialog } from "./ProfileDialog";
import { PasswordDialog } from "./PasswordDialog";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { stripeService } from "@/services/stripeService";

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

interface UserMenuProps {
  profileData: any;
  subscriptionData: any;
  subscriptionLoading: boolean;
  subscriptionError: any;
}

export const UserMenu = ({ 
  profileData,
  subscriptionData,
  subscriptionLoading,
  subscriptionError
}: UserMenuProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

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
        email: profileData.email,
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
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to manage subscriptions");
      }
      
      const baseUrl = window.location.origin;
      
      switch (action) {
        case "subscribe": {
          let customerId = subscriptionData?.data?.customerId;
          
          if (!customerId) {
            const { data: userData } = await supabase.auth.getUser();
            const customer = await stripeService.createCustomer(userData.user?.email || "");
            customerId = customer.id;
            
            await supabase
              .from('customer_subscriptions')
              .upsert({
                user_id: session.user.id,
                customer_id: customerId,
                status: "created"
              });
          }
          
          // Use a test price ID that works with Stripe Checkout for testing
          const priceId = 'price_1OtfvdKvwWfM66JCUMZGhw9c';
          const checkoutSession = await stripeService.createCheckoutSession(
            customerId,
            priceId,
            `${baseUrl}/dashboard?subscription=success`,
            `${baseUrl}/dashboard?subscription=canceled`
          );
          
          window.location.href = checkoutSession.url;
          break;
        }
        
        case "manage": {
          if (!subscriptionData?.data?.customerId) {
            throw new Error("No customer found");
          }
          
          const portalSession = await stripeService.createBillingPortalSession(
            subscriptionData.data.customerId,
            `${baseUrl}/dashboard`
          );
          
          window.location.href = portalSession.url;
          break;
        }
        
        case "cancel": {
          if (!subscriptionData?.data?.id) {
            throw new Error("No subscription found");
          }
          
          await stripeService.cancelSubscription(subscriptionData.data.id);
          
          toast({
            title: "Subscription Cancelled",
            description: "Your subscription will end at the current billing period.",
          });
          
          queryClient.invalidateQueries({ queryKey: ['subscription'] });
          break;
        }
        
        case "reactivate": {
          if (!subscriptionData?.data?.id) {
            throw new Error("No subscription found");
          }
          
          await stripeService.reactivateSubscription(subscriptionData.data.id);
          
          toast({
            title: "Subscription Reactivated",
            description: "Your subscription has been successfully reactivated.",
          });
          
          queryClient.invalidateQueries({ queryKey: ['subscription'] });
          break;
        }
      }
    } catch (error: any) {
      console.error('Error managing subscription:', error);
      toast({
        title: "Subscription Error",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
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
            <ProfileDialog 
              profileData={profileData}
              setProfileDialogOpen={setProfileDialogOpen}
              setPasswordDialogOpen={setPasswordDialogOpen}
              loading={loading}
              setLoading={setLoading}
              handleProfileUpdate={handleProfileUpdate}
              subscriptionData={subscriptionData}
              subscriptionLoading={subscriptionLoading}
              subscriptionError={subscriptionError}
              handleSubscriptionAction={handleSubscriptionAction}
            />
          </Dialog>
          
          <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
            <PasswordDialog 
              setProfileDialogOpen={setProfileDialogOpen}
              setPasswordDialogOpen={setPasswordDialogOpen}
              loading={loading}
              handlePasswordChange={handlePasswordChange}
            />
          </Dialog>
          
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
