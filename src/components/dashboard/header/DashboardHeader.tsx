
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { DashboardWelcome } from "./DashboardWelcome";
import { UserMenu } from "./UserMenu";
import { supabase } from "@/integrations/supabase/client";
import { stripeService } from "@/services/stripeService";

interface DashboardHeaderProps {
  profileData: any;
  onAddRound: () => void;
}

export const DashboardHeader = ({ profileData, onAddRound }: DashboardHeaderProps) => {
  const { toast } = useToast();

  const { data: subscriptionData, isLoading: subscriptionLoading, error: subscriptionError, refetch: refetchSubscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      try {
        // First check if Stripe environment is correctly set up
        const envCheck = await stripeService.checkEnvironment();
        
        if (!envCheck.success) {
          console.error("Stripe environment check failed:", envCheck.message);
          return { status: "config_error", message: envCheck.message };
        }
        
        // Get customer subscription data from the database first
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No session found');
        
        console.log("Fetching subscription data for user:", session.user.id);
        
        const { data: dbSubscription, error: dbError } = await supabase
          .from('customer_subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (dbError) {
          console.error("Error fetching subscription data from database:", dbError);
          throw dbError;
        }
        
        if (!dbSubscription) {
          console.log("No subscription data found for user");
          return { status: "none" };
        }
        
        console.log("Database subscription status:", dbSubscription.status);
        
        // If we have an 'expired' status in the database, the subscription is completely gone
        if (dbSubscription.status === 'expired') {
          return { 
            status: "none",
            data: {
              customerId: dbSubscription.customer_id
            }
          };
        }
        
        // If we have a subscription ID, get details from Stripe
        if (dbSubscription.subscription_id) {
          try {
            console.log("Fetching subscription details from Stripe:", dbSubscription.subscription_id);
            const subscription = await stripeService.getSubscription(dbSubscription.subscription_id);
            
            // Format subscription data
            const isActive = subscription.status === 'active' || subscription.status === 'trialing';
            const isCancelled = subscription.cancel_at_period_end;
            
            const endDate = new Date(subscription.current_period_end * 1000).toLocaleDateString();
            
            console.log("Subscription status from Stripe:", {
              stripeStatus: subscription.status,
              isActive,
              isCancelled,
              endDate
            });
            
            return {
              status: isActive ? (isCancelled ? "cancelled" : "active") : "inactive",
              data: {
                id: subscription.id,
                customerId: dbSubscription.customer_id,
                status: subscription.status,
                endDate,
                priceId: subscription.items.data[0]?.price?.id
              }
            };
          } catch (subscriptionError) {
            console.error("Error fetching subscription details from Stripe:", subscriptionError);
            
            // If the error is because the subscription doesn't exist in Stripe,
            // but we have a record in our database, update our record
            if (subscriptionError.message.includes("No such subscription")) {
              console.log("Subscription not found in Stripe, updating local record to expired");
              await supabase
                .from('customer_subscriptions')
                .update({
                  status: 'expired',
                  updated_at: new Date().toISOString()
                })
                .eq('id', dbSubscription.id);
                
              return {
                status: "none",
                data: {
                  customerId: dbSubscription.customer_id
                }
              };
            }
            
            // Return customer ID so we can still manage the subscription
            return {
              status: "error",
              error: subscriptionError.message,
              data: {
                customerId: dbSubscription.customer_id
              }
            };
          }
        }
        
        // Customer exists but no active subscription (default or 'created' status)
        return {
          status: "none",
          data: {
            customerId: dbSubscription.customer_id
          }
        };
      } catch (error) {
        console.error("Error fetching subscription data:", error);
        return { status: "error", error: error.message };
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Check for URL query parameters for subscription status
  React.useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const subscriptionStatus = queryParams.get('subscription');
    
    if (subscriptionStatus === 'success') {
      console.log("Subscription success detected in URL, refetching subscription data");
      toast({
        title: "Subscription Activated",
        description: "Your subscription has been successfully activated.",
      });
      refetchSubscription();
      
      // Remove the query parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('subscription');
      window.history.replaceState({}, document.title, url.toString());
    } else if (subscriptionStatus === 'canceled') {
      toast({
        title: "Subscription Canceled",
        description: "Your subscription process was canceled.",
        variant: "destructive",
      });
      
      // Remove the query parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('subscription');
      window.history.replaceState({}, document.title, url.toString());
    }
  }, [toast, refetchSubscription]);

  return (
    <div className="mb-6 relative flex flex-col">
      <DashboardWelcome 
        firstName={profileData?.first_name} 
        onAddRound={onAddRound} 
      />
      
      <UserMenu 
        profileData={profileData}
        subscriptionData={subscriptionData}
        subscriptionLoading={subscriptionLoading}
        subscriptionError={subscriptionError}
        refetchSubscription={refetchSubscription}
      />
    </div>
  );
};
