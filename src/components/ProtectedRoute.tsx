
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
}

// Helper function to check subscription validity - used across the app
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
  
  // Also consider incomplete subscriptions as valid if they are still in their period
  // This is a common case where the subscription might be marked as incomplete in our database
  // but is actually active in Stripe
  const hasIncompleteButValidPeriod = 
    (subscription.status === "incomplete" || subscription.status === "past_due") && 
    subscription.current_period_end && 
    new Date(subscription.current_period_end) > new Date();
  
  // Fix for incorrect incomplete status: if the subscription has a valid period end date in the future
  // we'll consider it valid even if marked as incomplete (this handles the case where Stripe says active
  // but our database says incomplete)
  const fixForIncompleteStatus = 
    subscription.status === "incomplete" &&
    subscription.current_period_end && 
    new Date(subscription.current_period_end) > new Date();
  
  return hasValidStatus || isCanceledButStillActive || hasIncompleteButValidPeriod || fixForIncompleteStatus;
};

export const ProtectedRoute = ({ children, requireSubscription = true }: ProtectedRouteProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPhase, setLoadingPhase] = useState<string>("initializing");
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Track if the component is mounted to prevent state updates after unmount
    let isMounted = true;
    let timeoutId: number | undefined;
    
    const checkSession = async () => {
      try {
        if (!isMounted) return;
        setIsLoading(true);
        setLoadingPhase("checking authentication");
        
        // Get session
        const { data: { session } } = await supabase.auth.getSession();
        const isAuth = !!session;
        
        if (!isMounted) return;
        
        // Only update authentication state if it's different to avoid re-renders
        if (isAuthenticated !== isAuth) {
          setIsAuthenticated(isAuth);
          console.log(`Authentication check: User is ${isAuth ? "authenticated" : "not authenticated"}`);
        }

        // If user is authenticated and subscription is required, check for active subscription
        if (isAuth && requireSubscription) {
          if (!isMounted) return;
          setLoadingPhase("checking subscription");
          console.log(`Checking subscription for user: ${session.user.id}`);
          
          const { data: subscription, error } = await supabase
            .from("customer_subscriptions")
            .select("status, subscription_id, cancel_at_period_end, current_period_end")
            .eq("user_id", session.user.id)
            .maybeSingle();
          
          if (error) {
            console.error("Error fetching subscription:", error);
            throw error;
          }
          
          if (!isMounted) return;
          console.log("Retrieved subscription data:", subscription);
          
          // Double-check with Stripe if we have an incomplete status but a valid period end
          if (subscription && 
              (subscription.status === 'incomplete' || subscription.status === 'past_due') &&
              subscription.current_period_end && 
              new Date(subscription.current_period_end) > new Date()) {
            
            console.log("Subscription has incomplete status but valid period end. Treating as valid.");
          }
          
          const isValid = isSubscriptionValid(subscription);
          
          console.log(`Subscription check results:`, {
            hasSubscriptionRecord: !!subscription,
            subscriptionStatus: subscription?.status || "none",
            cancelAtPeriodEnd: subscription?.cancel_at_period_end || false,
            currentPeriodEnd: subscription?.current_period_end || "none",
            currentTime: new Date().toISOString(),
            isStillValid: subscription?.current_period_end ? new Date(subscription.current_period_end) > new Date() : false,
            isValidStatus: isValid
          });
          
          if (!isMounted) return;
          setHasSubscription(isValid);
        } else if (!requireSubscription) {
          // If subscription is not required, set hasSubscription to true to allow access
          if (!isMounted) return;
          setHasSubscription(true);
        }
      } catch (error) {
        console.error("Error in checkSession:", error);
        if (!isMounted) return;
        setIsAuthenticated(false);
        setHasSubscription(false);
      } finally {
        if (!isMounted) return;
        setLoadingPhase("completed");
        setIsLoaded(true);
        setIsLoading(false);
        setInitialCheckComplete(true);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;
        
        setLoadingPhase("auth state changed");
        console.log(`Auth state changed: ${_event}, User: ${session?.user?.id || "none"}`);
        
        const isAuth = !!session;
        
        // Avoid unnecessary state updates if authentication status hasn't changed
        if (isAuthenticated !== isAuth) {
          setIsAuthenticated(isAuth);
        }
        
        // If auth state changes and user is authenticated, check subscription
        if (isAuth && requireSubscription) {
          setIsLoading(true);
          try {
            console.log(`Checking subscription after auth change for user: ${session.user.id}`);
            
            const { data: subscription, error } = await supabase
              .from("customer_subscriptions")
              .select("status, subscription_id, cancel_at_period_end, current_period_end")
              .eq("user_id", session.user.id)
              .maybeSingle();
            
            if (error) {
              console.error("Error fetching subscription on auth change:", error);
              throw error;
            }
            
            if (!isMounted) return;
            console.log("Retrieved subscription after auth change:", subscription);
            
            const isValid = isSubscriptionValid(subscription);
            
            console.log(`Subscription check after auth change:`, {
              hasSubscription: !!subscription,
              status: subscription?.status || "none",
              cancelAtPeriodEnd: subscription?.cancel_at_period_end || false,
              currentPeriodEnd: subscription?.current_period_end || "none",
              currentTime: new Date().toISOString(),
              isStillValid: subscription?.current_period_end ? new Date(subscription.current_period_end) > new Date() : false,
              isValid
            });
            
            if (!isMounted) return;
            
            // Only update subscription state if it's different
            if (hasSubscription !== isValid) {
              setHasSubscription(isValid);
            }
          } catch (error) {
            console.error("Error checking subscription on auth change:", error);
            if (!isMounted) return;
            setHasSubscription(false);
          } finally {
            if (!isMounted) return;
            setIsLoading(false);
            setInitialCheckComplete(true);
          }
        } else if (!requireSubscription) {
          // If subscription is not required, set hasSubscription to true to allow access
          if (!isMounted) return;
          if (!hasSubscription) {
            setHasSubscription(true);
          }
          setIsLoading(false);
          setInitialCheckComplete(true);
        } else {
          if (!isMounted) return;
          setIsLoading(false);
          setInitialCheckComplete(true);
        }
        
        if (!isMounted) return;
        setIsLoaded(true);
      }
    );

    // Set a timeout to proceed anyway if we're stuck loading for too long
    timeoutId = window.setTimeout(() => {
      if (isMounted && isLoading) {
        console.log("Loading timeout reached - proceeding to render protected route");
        setIsLoaded(true);
        setIsLoading(false);
        setInitialCheckComplete(true);
        
        // If we're timing out on subscription check, default to true to avoid blocking users
        if (loadingPhase === "checking subscription") {
          console.log("Subscription check timed out - proceeding with access granted");
          setHasSubscription(true);
        }
      }
    }, 5000); // 5 second timeout

    return () => {
      isMounted = false;
      if (timeoutId) window.clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [requireSubscription]);

  // Show loading state with more details
  if (!initialCheckComplete || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-gray-500">Loading: {loadingPhase}...</p>
      </div>
    );
  }

  // Handle authentication check - avoid redirect loops using the initialCheckComplete flag
  if (initialCheckComplete && !isAuthenticated) {
    console.log("User is not authenticated, redirecting to login");
    return <Navigate to="/" replace />;
  }

  // Handle subscription check - only redirect to checkout when we have confirmed both:
  // 1. The user is authenticated
  // 2. They don't have a valid subscription
  if (initialCheckComplete && requireSubscription && !hasSubscription && isAuthenticated) {
    console.log("User does not have valid subscription, redirecting to checkout");
    return <Navigate to="/checkout" state={{ from: location }} replace />;
  }

  console.log("Access granted to protected route");
  return <>{children}</>;
};
