
import React from "react";
import { DashboardWelcome } from "./DashboardWelcome";
import { UserMenu } from "./UserMenu";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { stripeService } from "@/services/stripeService";
import { supabase } from "@/integrations/supabase/client";

interface DashboardHeaderProps {
  profileData: any;
  onAddRound: () => void;
}

export const DashboardHeader = ({ profileData, onAddRound }: DashboardHeaderProps) => {
  const queryClient = useQueryClient();
  
  const { data: subscriptionData, isLoading: subscriptionLoading, error: subscriptionError } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return { status: "none" };
        
        try {
          const envCheck = await stripeService.checkEnvironment();
          if (!envCheck.success) {
            console.warn("Stripe environment not properly configured:", envCheck.message);
            return { status: "config_error", message: envCheck.message };
          }
        } catch (envError) {
          console.error("Error checking Stripe environment:", envError);
        }
        
        const { data, error } = await supabase
          .from('customer_subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching subscription:", error);
          throw error;
        }
        
        if (!data) return { status: "none" };
        
        if (data.subscription_id) {
          try {
            const subscription = await stripeService.getSubscription(data.subscription_id);
            return {
              status: subscription.cancel_at_period_end ? "cancelled" : "active",
              data: {
                id: subscription.id,
                customerId: data.customer_id,
                endDate: new Date(subscription.current_period_end * 1000).toLocaleDateString(),
                priceId: subscription.items.data[0]?.price.id
              }
            };
          } catch (stripeError) {
            console.error("Error fetching Stripe subscription:", stripeError);
            return {
              status: data.status || "error",
              data: {
                id: data.subscription_id,
                customerId: data.customer_id
              },
              error: stripeError.message
            };
          }
        }
        
        return { 
          status: data.status || "none",
          data: { customerId: data.customer_id }
        };
      } catch (error) {
        console.error("Error fetching subscription:", error);
        return { status: "error", error: error.message };
      }
    },
    retry: 1,
    retryDelay: 1000
  });

  return (
    <>
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
    </>
  );
};
