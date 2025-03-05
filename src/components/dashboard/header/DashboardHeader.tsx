
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

  const { data: subscriptionData, isLoading: subscriptionLoading, error: subscriptionError } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      try {
        // First check if Stripe environment is correctly set up
        const envCheck = await stripeService.checkEnvironment();
        
        if (!envCheck.success) {
          console.error("Stripe environment check failed:", envCheck.message);
          return { status: "config_error", message: envCheck.message };
        }
        
        // Get customer subscription data
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No session found');
        
        const { data, error } = await supabase
          .from('customer_subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching subscription data from database:", error);
          throw error;
        }
        
        if (!data) {
          console.log("No subscription data found for user");
          return { status: "none" };
        }
        
        // If we have a subscription ID, get details from Stripe
        if (data.subscription_id) {
          try {
            const subscription = await stripeService.getSubscription(data.subscription_id);
            
            // Format subscription data
            const isActive = subscription.status === 'active' || subscription.status === 'trialing';
            const isCancelled = subscription.cancel_at_period_end;
            
            const endDate = new Date(subscription.current_period_end * 1000).toLocaleDateString();
            
            return {
              status: isActive ? (isCancelled ? "cancelled" : "active") : "inactive",
              data: {
                id: subscription.id,
                customerId: data.customer_id,
                status: subscription.status,
                endDate,
                priceId: subscription.items.data[0]?.price?.id
              }
            };
          } catch (subscriptionError) {
            console.error("Error fetching subscription details from Stripe:", subscriptionError);
            
            // Return customer ID so we can still manage the subscription
            return {
              status: "error",
              error: subscriptionError.message,
              data: {
                customerId: data.customer_id
              }
            };
          }
        }
        
        // Customer exists but no subscription
        return {
          status: "none",
          data: {
            customerId: data.customer_id
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
      />
    </div>
  );
};
