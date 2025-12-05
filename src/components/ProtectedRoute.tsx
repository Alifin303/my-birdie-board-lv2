import { useEffect, useState, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { isSubscriptionValid, fetchUserSubscription } from "@/integrations/supabase/subscription/subscription-utils";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
}

// Cache duration: 24 hours in milliseconds
const SUBSCRIPTION_CACHE_DURATION = 24 * 60 * 60 * 1000;

// Check if cached subscription is still valid (not expired)
const isCacheValid = (): boolean => {
  const checkedAt = localStorage.getItem('subscriptionCheckedAt');
  if (!checkedAt) return false;
  
  const lastChecked = new Date(checkedAt).getTime();
  const now = Date.now();
  return (now - lastChecked) < SUBSCRIPTION_CACHE_DURATION;
};

// Get cached subscription status
const getCachedSubscription = (): boolean | null => {
  if (!isCacheValid()) return null;
  const status = localStorage.getItem('subscriptionStatus');
  return status === 'valid';
};

// Cache subscription status
const cacheSubscription = (isValid: boolean) => {
  localStorage.setItem('subscriptionStatus', isValid ? 'valid' : 'invalid');
  localStorage.setItem('subscriptionCheckedAt', new Date().toISOString());
};

export const ProtectedRoute = ({ children, requireSubscription = true }: ProtectedRouteProps) => {
  // Initialize from cache to avoid loading flash
  const cachedAuth = localStorage.getItem('userAuthenticated') === 'true';
  const cachedSubscription = getCachedSubscription();
  
  const [isAuthenticated, setIsAuthenticated] = useState(cachedAuth);
  const [hasSubscription, setHasSubscription] = useState(cachedSubscription ?? true); // Default true to avoid flash
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);
  const [showLoading, setShowLoading] = useState(!cachedAuth); // Only show loading if not cached
  
  const hasCheckedRef = useRef(false);
  const location = useLocation();

  // Single effect to check auth and subscription on mount only
  useEffect(() => {
    // Skip if already checked this session
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;
    
    let isMounted = true;

    const checkAuthAndSubscription = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        const isAuth = !!session;
        
        if (!isMounted) return;
        
        // Update auth state
        setIsAuthenticated(isAuth);
        
        if (isAuth) {
          localStorage.setItem('userAuthenticated', 'true');
          localStorage.setItem('userId', session.user.id);
          
          // Check if we have a valid cached subscription
          const cachedSub = getCachedSubscription();
          
          if (cachedSub !== null && requireSubscription) {
            // Use cached value
            console.log("Using cached subscription status:", cachedSub);
            setHasSubscription(cachedSub);
          } else if (requireSubscription) {
            // Fetch fresh subscription data
            console.log("Fetching fresh subscription data...");
            const subscription = await fetchUserSubscription(session.user.id, supabase);
            
            if (!isMounted) return;
            
            const isValid = subscription ? isSubscriptionValid(subscription) : false;
            setHasSubscription(isValid);
            cacheSubscription(isValid);
            
            console.log("Subscription check result:", { isValid, subscription });
          } else {
            setHasSubscription(true);
          }
        } else {
          // Not authenticated - clear cache
          localStorage.removeItem('userAuthenticated');
          localStorage.removeItem('userId');
          localStorage.removeItem('subscriptionStatus');
          localStorage.removeItem('subscriptionCheckedAt');
          setHasSubscription(false);
        }
      } catch (error) {
        console.error("Error checking auth/subscription:", error);
        if (!isMounted) return;
        setIsAuthenticated(false);
        setHasSubscription(false);
      } finally {
        if (isMounted) {
          setInitialCheckComplete(true);
          setShowLoading(false);
        }
      }
    };

    checkAuthAndSubscription();

    return () => {
      isMounted = false;
    };
  }, []); // Empty deps - only run once on mount

  // Listen for auth state changes (login/logout only)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change:", event);
        
        // Only handle actual login/logout events
        if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setHasSubscription(false);
          localStorage.removeItem('userAuthenticated');
          localStorage.removeItem('userId');
          localStorage.removeItem('subscriptionStatus');
          localStorage.removeItem('subscriptionCheckedAt');
        } else if (event === 'SIGNED_IN' && session) {
          setIsAuthenticated(true);
          localStorage.setItem('userAuthenticated', 'true');
          localStorage.setItem('userId', session.user.id);
          
          // Fetch subscription on new login
          if (requireSubscription) {
            const sub = await fetchUserSubscription(session.user.id, supabase);
            const isValid = sub ? isSubscriptionValid(sub) : false;
            setHasSubscription(isValid);
            cacheSubscription(isValid);
          }
        }
        // Ignore TOKEN_REFRESHED, USER_UPDATED, etc. - these shouldn't affect UI
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [requireSubscription]);

  // Show loading only on initial page load when no cache exists
  if (showLoading && !initialCheckComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Wait for initial check to complete before redirecting
  if (!initialCheckComplete) {
    return null; // Render nothing briefly while checking
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    console.log("User is not authenticated, redirecting to login");
    return <Navigate to="/" replace />;
  }

  // Redirect if no subscription
  if (requireSubscription && !hasSubscription) {
    console.log("User does not have valid subscription, redirecting to checkout");
    return <Navigate to="/checkout" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
