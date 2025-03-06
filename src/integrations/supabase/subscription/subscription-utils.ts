
/**
 * Utilities for handling subscription validation and status checking
 */

// Helper function to check subscription validity - extracted from ProtectedRoute
export const isSubscriptionValid = (subscription: any): boolean => {
  if (!subscription) {
    console.log("No subscription provided to isSubscriptionValid");
    return false;
  }
  
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
    
  // Log more details to help debug subscription validation
  console.log("Subscription validation details:", {
    subscriptionId: subscription.subscription_id,
    status: subscription.status,
    hasValidStatus,
    isCanceledButStillActive,
    hasValidPeriodEndDate,
    currentTime: new Date().toISOString(),
    endDate: subscription.current_period_end,
    timeDiff: subscription.current_period_end ? 
      (new Date(subscription.current_period_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) + " days" : 
      "no end date"
  });
  
  // Consider a subscription valid if:
  // 1. It has a valid status OR
  // 2. It's canceled but still in active period OR
  // 3. It has a valid end date and is either incomplete or past_due (temporary grace period)
  const isValid = hasValidStatus || isCanceledButStillActive || 
         (hasValidPeriodEndDate && (subscription.status === "incomplete" || subscription.status === "past_due"));
         
  console.log(`Subscription validity final result: ${isValid}`);
  
  return isValid;
};

/**
 * Fetch a user's subscription from Supabase with improved caching and error handling
 */
export const fetchUserSubscription = async (userId: string, supabaseClient: any) => {
  if (!userId) {
    console.log("Cannot fetch subscription: No user ID provided");
    return null;
  }
  
  try {
    console.log(`Fetching subscription for user: ${userId}`);
    
    // Check localStorage cache first for faster initial load
    try {
      const cachedSubscription = localStorage.getItem(`subscription_${userId}`);
      const cacheTimestamp = localStorage.getItem(`subscription_${userId}_timestamp`);
      
      // Only use cache if it's recent (less than 1 minute old for new subscriptions)
      if (cachedSubscription && cacheTimestamp) {
        const cacheTime = new Date(cacheTimestamp);
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000); // 1 minute cache for new subscriptions
        
        if (cacheTime > oneMinuteAgo) {
          console.log("Using cached subscription data");
          return JSON.parse(cachedSubscription);
        }
      }
    } catch (cacheError) {
      console.error("Error reading subscription cache:", cacheError);
    }
    
    // Fetch fresh data from Supabase
    const { data: subscription, error } = await supabaseClient
      .from("customer_subscriptions")
      .select("status, subscription_id, cancel_at_period_end, current_period_end")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching subscription:", error);
      return null;
    }
    
    console.log(`Subscription fetch result:`, subscription || "No subscription found");
    
    // Cache the result for faster subsequent checks
    if (subscription) {
      try {
        localStorage.setItem(`subscription_${userId}`, JSON.stringify(subscription));
        localStorage.setItem(`subscription_${userId}_timestamp`, new Date().toISOString());
      } catch (cacheError) {
        console.error("Error caching subscription data:", cacheError);
      }
    }
    
    return subscription;
  } catch (error) {
    console.error("Error in fetchUserSubscription:", error);
    return null;
  }
};

// Helper function to check if we should try Stripe verification
export const shouldVerifyWithStripe = (subscription: any): boolean => {
  if (!subscription) return false;
  
  const hasValidPeriodEndDate = 
    subscription.current_period_end && 
    new Date(subscription.current_period_end) > new Date();
    
  const needsVerification = 
    (subscription.status === 'incomplete' || subscription.status === 'past_due') && 
    hasValidPeriodEndDate;
    
  return needsVerification;
};

// Helper to clear subscription cache when needed
export const clearSubscriptionCache = (userId?: string) => {
  try {
    if (userId) {
      localStorage.removeItem(`subscription_${userId}`);
      localStorage.removeItem(`subscription_${userId}_timestamp`);
    }
    
    // Clear the general subscription status cache
    localStorage.removeItem('subscriptionStatus');
    localStorage.removeItem('subscriptionCheckedAt');
  } catch (error) {
    console.error("Error clearing subscription cache:", error);
  }
};
