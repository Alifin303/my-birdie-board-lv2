
/**
 * Utilities for handling subscription validation and status checking
 */

// Helper function to check subscription validity - extracted from ProtectedRoute
export const isSubscriptionValid = (subscription: any): boolean => {
  if (!subscription) return false;
  
  // Valid subscription statuses
  const validStatuses = ['active', 'trialing', 'paid'];
  
  // Check if the subscription status is valid in Stripe
  const hasValidStatus = validStatuses.includes(subscription.status);
  
  // Check if it's canceled but still in active period
  const isCanceledButStillActive = 
    subscription.cancel_at_period_end === true && 
    subscription.current_period_end && 
    new Date(subscription.current_period_end) > new Date();
  
  // Special handling for incomplete subscriptions
  const hasValidPeriodEndDate = 
    subscription.current_period_end && 
    new Date(subscription.current_period_end) > new Date();
    
  // If the subscription has a valid end date in the future, we'll consider it valid
  // regardless of status - this is a more accurate measure of validity than the status field
  // when there are syncing issues between Stripe and our database
  
  return hasValidStatus || isCanceledButStillActive || 
         (hasValidPeriodEndDate && (subscription.status === "incomplete" || subscription.status === "past_due"));
};

/**
 * Fetch a user's subscription from Supabase
 */
export const fetchUserSubscription = async (userId: string, supabaseClient: any) => {
  if (!userId) return null;
  
  try {
    const { data: subscription, error } = await supabaseClient
      .from("customer_subscriptions")
      .select("status, subscription_id, cancel_at_period_end, current_period_end")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching subscription:", error);
      return null;
    }
    
    return subscription;
  } catch (error) {
    console.error("Error in fetchUserSubscription:", error);
    return null;
  }
};
