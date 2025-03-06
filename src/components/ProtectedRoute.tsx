
import { useEffect, useState, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { isSubscriptionValid, fetchUserSubscription } from "@/integrations/supabase/subscription/subscription-utils";

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
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);
  const authCheckCompleted = useRef(false);
  const subscriptionCheckCompleted = useRef(false);
  const authStateChangeInProgress = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const sessionChecksAttempted = useRef(0);
  const location = useLocation();

  // Function to clear timeout safely
  const clearTimeoutSafely = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Function to store session data in localStorage for persistence
  const storeSessionData = (session: any) => {
    if (session) {
      try {
        // Store minimal session info to improve persistence between refreshes
        localStorage.setItem('lastAuthenticated', new Date().toISOString());
        localStorage.setItem('userAuthenticated', 'true');
        
        // Optional: store user ID for faster lookups
        if (session.user && session.user.id) {
          localStorage.setItem('userId', session.user.id);
        }
      } catch (error) {
        console.error("Error storing session data:", error);
      }
    } else {
      // Clear session data if logged out
      localStorage.removeItem('lastAuthenticated');
      localStorage.removeItem('userAuthenticated');
      localStorage.removeItem('userId');
    }
  };

  // This effect runs once on mount to check the initial session and subscription
  useEffect(() => {
    // Track if the component is mounted to prevent state updates after unmount
    let isMounted = true;
    
    const checkSession = async () => {
      if (authCheckCompleted.current && sessionChecksAttempted.current > 2) return; // Prevent excessive checks
      
      sessionChecksAttempted.current += 1;
      
      try {
        if (!isMounted) return;
        setIsLoading(true);
        setLoadingPhase("checking authentication");
        
        // Get session
        const { data: { session } } = await supabase.auth.getSession();
        const isAuth = !!session;
        
        if (!isMounted) return;
        
        // Update authentication state if it's different
        if (isAuthenticated !== isAuth) {
          setIsAuthenticated(isAuth);
          console.log(`Authentication check: User is ${isAuth ? "authenticated" : "not authenticated"}`);
          
          // Store session data for persistence
          storeSessionData(session);
        }

        // If user is authenticated and subscription is required, check for active subscription
        if (isAuth && requireSubscription) {
          if (!isMounted) return;
          setLoadingPhase("checking subscription");
          
          const subscription = await fetchUserSubscription(session.user.id, supabase);
          
          if (!isMounted) return;
          
          if (subscription) {
            console.log("Retrieved subscription data:", subscription);
            
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
            
            // Cache subscription status in localStorage to improve refresh experience
            try {
              localStorage.setItem('subscriptionStatus', isValid ? 'valid' : 'invalid');
              localStorage.setItem('subscriptionCheckedAt', new Date().toISOString());
            } catch (error) {
              console.error("Error caching subscription status:", error);
            }
            
            subscriptionCheckCompleted.current = true;
          } else {
            // If no subscription found, log this information
            console.log("No subscription found for user");
            if (!isMounted) return;
            setHasSubscription(false);
            
            // Cache negative subscription result
            try {
              localStorage.setItem('subscriptionStatus', 'invalid');
              localStorage.setItem('subscriptionCheckedAt', new Date().toISOString());
            } catch (error) {
              console.error("Error caching subscription status:", error);
            }
            
            subscriptionCheckCompleted.current = true;
          }
        } else if (!requireSubscription) {
          // If subscription is not required, set hasSubscription to true to allow access
          if (!isMounted) return;
          setHasSubscription(true);
          subscriptionCheckCompleted.current = true;
        }

        // Mark authentication check as completed
        authCheckCompleted.current = true;
        
        // Clear any existing timeout since we've completed the check
        clearTimeoutSafely();
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

    // Check for cached authentication data for a smoother initial load
    const cachedAuth = localStorage.getItem('userAuthenticated') === 'true';
    const userId = localStorage.getItem('userId');
    const cachedSubscription = localStorage.getItem('subscriptionStatus');
    const subscriptionCheckedAt = localStorage.getItem('subscriptionCheckedAt');
    
    // If we have cached data, use it for initial state to avoid spinners
    if (cachedAuth && !authCheckCompleted.current) {
      console.log("Using cached authentication data");
      setIsAuthenticated(true);
      
      // For subscription data, only use cache if checked recently (within last hour)
      if (cachedSubscription && subscriptionCheckedAt) {
        const lastChecked = new Date(subscriptionCheckedAt);
        const oneHourAgo = new Date(Date.now() - 3600000);
        
        if (lastChecked > oneHourAgo) {
          console.log("Using cached subscription data");
          setHasSubscription(cachedSubscription === 'valid');
        }
      }
    }

    // Run the session check
    checkSession();

    // Set a timeout to proceed anyway if we're stuck loading for too long
    // Using a shorter timeout (4 seconds) for better UX but still giving enough time for checks
    timeoutRef.current = window.setTimeout(() => {
      if (isMounted && isLoading) {
        console.log("Loading timeout reached - proceeding to render protected route");
        console.log("Current state of checks:", {
          authCheckCompleted: authCheckCompleted.current,
          subscriptionCheckCompleted: subscriptionCheckCompleted.current,
          loadingPhase,
          isAuthenticated
        });
        
        // IMPORTANT: If we're authenticated but subscription check is timing out,
        // assume the subscription is valid to avoid blocking the user
        if (loadingPhase === "checking subscription" && !subscriptionCheckCompleted.current && isAuthenticated) {
          console.log("Subscription check timed out - defaulting to allowing access");
          setHasSubscription(true);
        }
        
        setIsLoaded(true);
        setIsLoading(false);
        setInitialCheckComplete(true);
      }
    }, 4000); // Reduced timeout for better UX

    return () => {
      isMounted = false;
      clearTimeoutSafely();
    };
  }, [requireSubscription, isAuthenticated]);

  // This effect handles auth state changes
  useEffect(() => {
    // Track if the component is mounted to prevent state updates after unmount
    let isMounted = true;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        // Prevent concurrent auth state change processing
        if (authStateChangeInProgress.current) return;
        authStateChangeInProgress.current = true;
        
        try {
          if (!isMounted) return;
          
          setLoadingPhase("auth state changed");
          console.log(`Auth state changed: ${_event}, User: ${session?.user?.id || "none"}`);
          
          const isAuth = !!session;
          
          // Update session persistence data
          storeSessionData(session);
          
          // Avoid unnecessary state updates if authentication status hasn't changed
          if (isAuthenticated !== isAuth) {
            setIsAuthenticated(isAuth);
          }
          
          // If auth state changes and user is authenticated, check subscription
          if (isAuth && requireSubscription) {
            setIsLoading(true);
            try {
              const subscription = await fetchUserSubscription(session.user.id, supabase);
              
              if (!isMounted) return;
              
              if (subscription) {
                console.log("Retrieved subscription after auth change:", subscription);
                
                const isValid = isSubscriptionValid(subscription);
                
                console.log(`Subscription check after auth change:`, {
                  hasSubscription: !!subscription,
                  status: subscription?.status || "none",
                  currentTime: new Date().toISOString(),
                  isValid
                });
                
                if (!isMounted) return;
                
                // Store subscription validation result
                setHasSubscription(isValid);
                
                // Cache subscription status
                try {
                  localStorage.setItem('subscriptionStatus', isValid ? 'valid' : 'invalid');
                  localStorage.setItem('subscriptionCheckedAt', new Date().toISOString());
                } catch (error) {
                  console.error("Error caching subscription status:", error);
                }
                
                subscriptionCheckCompleted.current = true;
              } else {
                console.log("No subscription found after auth change");
                if (!isMounted) return;
                setHasSubscription(false);
                
                // Cache negative subscription result
                try {
                  localStorage.setItem('subscriptionStatus', 'invalid');
                  localStorage.setItem('subscriptionCheckedAt', new Date().toISOString());
                } catch (error) {
                  console.error("Error caching subscription status:", error);
                }
                
                subscriptionCheckCompleted.current = true;
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
            setHasSubscription(true);
            subscriptionCheckCompleted.current = true;
            setIsLoading(false);
            setInitialCheckComplete(true);
          } else {
            if (!isMounted) return;
            setIsLoading(false);
            setInitialCheckComplete(true);
          }
          
          if (!isMounted) return;
          setIsLoaded(true);
        } finally {
          authStateChangeInProgress.current = false;
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [requireSubscription, isAuthenticated]);

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
  // 3. The subscription check has actually completed
  if (initialCheckComplete && requireSubscription && !hasSubscription && isAuthenticated && subscriptionCheckCompleted.current) {
    console.log("User does not have valid subscription, redirecting to checkout");
    return <Navigate to="/checkout" state={{ from: location }} replace />;
  }

  console.log("Access granted to protected route");
  return <>{children}</>;
};
