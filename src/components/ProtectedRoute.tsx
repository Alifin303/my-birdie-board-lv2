import { useEffect, useState } from "react";
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
  
  // Use cached values immediately if available
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(cachedAuth ? true : null);
  const [hasSubscription, setHasSubscription] = useState(cachedSubscription ?? true);
  const [isLoading, setIsLoading] = useState(!cachedAuth); // Don't show loading if cached
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const location = useLocation();

  // Single effect to check auth and subscription on mount - only once
  useEffect(() => {
    if (hasInitialized) return; // Prevent re-running
    
    let isMounted = true;

    const checkAuthAndSubscription = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        const isAuth = !!session;
        
        if (!isMounted) return;
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
            // For freemium model: always allow access to dashboard
            // The round limit is enforced in AddRoundModal, not here
            // This allows users to view their existing rounds even after hitting the limit
            console.log("Freemium model: allowing dashboard access for authenticated user");
            setHasSubscription(true);
            cacheSubscription(true);
          } else {
            setHasSubscription(true);
          }
        } else {
          // Not authenticated - clear cache
          localStorage.removeItem('userAuthenticated');
          localStorage.removeItem('userId');
          setHasSubscription(false);
        }
      } catch (error) {
        console.error("Error checking auth/subscription:", error);
        if (!isMounted) return;
        setIsAuthenticated(false);
        setHasSubscription(false);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setHasInitialized(true);
        }
      }
    };

    checkAuthAndSubscription();

    return () => {
      isMounted = false;
    };
  }, [hasInitialized]); // Include hasInitialized to satisfy linter but guard prevents re-run

  // Listen for auth state changes (login/logout only)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change:", event);
        
        // Only handle actual login/logout events, ignore token refreshes
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
          
          // For freemium model: always allow dashboard access
          if (requireSubscription) {
            setTimeout(() => {
              setHasSubscription(true);
              cacheSubscription(true);
            }, 0);
          }
        }
        // Ignore TOKEN_REFRESHED, USER_UPDATED, INITIAL_SESSION etc.
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [requireSubscription]);

  // Show loading only if no cached auth AND still loading
  // This prevents loading flash when returning to tab with valid cache
  if (isLoading && isAuthenticated === null) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-gray-500">Loading...</p>
      </div>
    );
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
