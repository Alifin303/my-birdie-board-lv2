
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
}

export const ProtectedRoute = ({ children, requireSubscription = true }: ProtectedRouteProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPhase, setLoadingPhase] = useState<string>("initializing");
  const location = useLocation();

  // Function to check if a subscription is valid
  const checkSubscriptionValidity = (subscription: any) => {
    if (!subscription) return false;
    
    // Valid subscription statuses
    const validStatuses = ['active', 'trialing', 'paid'];
    
    // Check if subscription is valid OR if it's canceled but still in active period
    const hasValidSubscription = 
      validStatuses.includes(subscription.status) || 
      (subscription.cancel_at_period_end === true && 
       subscription.current_period_end && 
       new Date(subscription.current_period_end) > new Date());
    
    // Also consider incomplete subscriptions as valid if they are still in their period
    const hasIncompleteButValidPeriod = 
      subscription.status === "incomplete" && 
      subscription.current_period_end && 
      new Date(subscription.current_period_end) > new Date();
    
    return hasValidSubscription || hasIncompleteButValidPeriod;
  };

  useEffect(() => {
    // Track if the component is mounted to prevent state updates after unmount
    let isMounted = true;
    
    const checkSession = async () => {
      try {
        if (!isMounted) return;
        setIsLoading(true);
        setLoadingPhase("checking authentication");
        
        // Get session
        const { data: { session } } = await supabase.auth.getSession();
        const isAuth = !!session;
        
        if (!isMounted) return;
        setIsAuthenticated(isAuth);
        
        console.log(`Authentication check: User is ${isAuth ? "authenticated" : "not authenticated"}`);

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
          
          const isValid = checkSubscriptionValidity(subscription);
          
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
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;
        
        setLoadingPhase("auth state changed");
        console.log(`Auth state changed: ${_event}, User: ${session?.user?.id || "none"}`);
        
        const isAuth = !!session;
        setIsAuthenticated(isAuth);
        
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
            
            const isValid = checkSubscriptionValidity(subscription);
            
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
            setHasSubscription(isValid);
          } catch (error) {
            console.error("Error checking subscription on auth change:", error);
            if (!isMounted) return;
            setHasSubscription(false);
          } finally {
            if (!isMounted) return;
            setIsLoading(false);
          }
        } else if (!requireSubscription) {
          // If subscription is not required, set hasSubscription to true to allow access
          if (!isMounted) return;
          setHasSubscription(true);
          setIsLoading(false);
        } else {
          if (!isMounted) return;
          setIsLoading(false);
        }
        
        if (!isMounted) return;
        setIsLoaded(true);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [requireSubscription, location.pathname]);

  // Set a timeout to proceed anyway if we're stuck loading for too long
  useEffect(() => {
    let timeoutId: number;
    
    if (isLoading) {
      timeoutId = window.setTimeout(() => {
        console.log("Loading timeout reached - proceeding to render protected route");
        setIsLoaded(true);
        setIsLoading(false);
        
        // If we're timing out on subscription check, default to true to avoid blocking users
        if (loadingPhase === "checking subscription") {
          console.log("Subscription check timed out - proceeding with access granted");
          setHasSubscription(true);
        }
      }, 5000); // 5 second timeout
    }
    
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isLoading, loadingPhase]);

  // Show loading state with more details
  if (!isLoaded || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-gray-500">Loading: {loadingPhase}...</p>
      </div>
    );
  }

  // Handle authentication check
  if (!isAuthenticated) {
    console.log("User is not authenticated, redirecting to login");
    return <Navigate to="/" replace />;
  }

  // Handle subscription check - Redirect to checkout instead of homepage
  if (requireSubscription && !hasSubscription) {
    console.log("User does not have valid subscription, redirecting to checkout");
    return <Navigate to="/checkout" state={{ from: location }} replace />;
  }

  console.log("Access granted to protected route");
  return <>{children}</>;
};
