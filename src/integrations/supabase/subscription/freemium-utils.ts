/**
 * Freemium model utilities
 * Free tier allows up to 4 rounds, after which a subscription is required
 */

import { supabase } from "@/integrations/supabase/client";
import { isSubscriptionValid } from "./subscription-utils";

export const FREE_ROUND_LIMIT = 4;

/**
 * Fetch the user's round count from the database
 */
export const fetchUserRoundCount = async (userId: string): Promise<number> => {
  if (!userId) {
    console.log("Cannot fetch round count: No user ID provided");
    return 0;
  }

  try {
    const { count, error } = await supabase
      .from("rounds")
      .select("id", { count: 'exact', head: true })
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching round count:", error);
      return 0;
    }

    console.log(`User ${userId} has ${count} rounds`);
    return count || 0;
  } catch (error) {
    console.error("Error in fetchUserRoundCount:", error);
    return 0;
  }
};

/**
 * Check if user can access premium features (dashboard)
 * Returns true if user has valid subscription OR has fewer than FREE_ROUND_LIMIT rounds
 */
export const canAccessPremiumFeatures = async (
  userId: string,
  supabaseClient: typeof supabase
): Promise<{ canAccess: boolean; hasSubscription: boolean; roundCount: number }> => {
  try {
    // Check subscription status
    const { data: subscription, error: subError } = await supabaseClient
      .from("customer_subscriptions")
      .select("status, subscription_id, cancel_at_period_end, current_period_end")
      .eq("user_id", userId)
      .maybeSingle();

    if (subError) {
      console.error("Error checking subscription:", subError);
    }

    const hasValidSubscription = subscription ? isSubscriptionValid(subscription) : false;

    // If they have a subscription, they can access
    if (hasValidSubscription) {
      return { canAccess: true, hasSubscription: true, roundCount: 0 };
    }

    // Check round count for free tier
    const roundCount = await fetchUserRoundCount(userId);
    const canAccess = roundCount < FREE_ROUND_LIMIT;

    console.log(`Freemium check: ${roundCount} rounds, canAccess=${canAccess}`);

    return { canAccess, hasSubscription: false, roundCount };
  } catch (error) {
    console.error("Error checking premium access:", error);
    return { canAccess: false, hasSubscription: false, roundCount: 0 };
  }
};

/**
 * Check if user can add more rounds
 * Returns true if user has valid subscription OR has fewer than FREE_ROUND_LIMIT rounds
 */
export const canAddMoreRounds = async (
  userId: string
): Promise<{ canAdd: boolean; hasSubscription: boolean; roundCount: number; remainingRounds: number }> => {
  const { canAccess, hasSubscription, roundCount } = await canAccessPremiumFeatures(userId, supabase);
  
  const remainingRounds = hasSubscription ? Infinity : Math.max(0, FREE_ROUND_LIMIT - roundCount);
  
  return {
    canAdd: canAccess,
    hasSubscription,
    roundCount,
    remainingRounds
  };
};

/**
 * Get the number of remaining free rounds
 */
export const getRemainingFreeRounds = (roundCount: number, hasSubscription: boolean): number => {
  if (hasSubscription) return Infinity;
  return Math.max(0, FREE_ROUND_LIMIT - roundCount);
};
