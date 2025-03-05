
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
  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const isAuth = !!session;
        setIsAuthenticated(isAuth);

        // If user is authenticated and subscription is required, check for active subscription
        if (isAuth && requireSubscription) {
          console.log("Checking subscription for user:", session.user.id);
          const { data: subscription, error } = await supabase
            .from("customer_subscriptions")
            .select("status, subscription_id")
            .eq("user_id", session.user.id)
            .maybeSingle();
          
          if (error) {
            console.error("Error fetching subscription:", error);
          }
            
          // Valid subscription statuses according to Stripe
          const validStatuses = ['active', 'trialing', 'paid'];
          const hasValidSubscription = subscription && validStatuses.includes(subscription.status);
          
          console.log("Subscription status:", subscription?.status, "Valid:", hasValidSubscription);
          setHasSubscription(hasValidSubscription);
          
          // If subscription is incomplete or incomplete_expired, user needs to complete checkout
          if (subscription && ['incomplete', 'incomplete_expired', 'past_due'].includes(subscription.status)) {
            console.log("Subscription needs attention:", subscription.status);
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsAuthenticated(false);
        setHasSubscription(false);
      } finally {
        setIsLoaded(true);
        setIsLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const isAuth = !!session;
        setIsAuthenticated(isAuth);
        
        // If auth state changes and user is authenticated, check subscription
        if (isAuth && requireSubscription) {
          setIsLoading(true);
          try {
            const { data: subscription, error } = await supabase
              .from("customer_subscriptions")
              .select("status")
              .eq("user_id", session.user.id)
              .maybeSingle();
            
            if (error) {
              console.error("Error fetching subscription on auth change:", error);
            }
              
            // Valid subscription statuses according to Stripe
            const validStatuses = ['active', 'trialing', 'paid'];
            setHasSubscription(subscription && validStatuses.includes(subscription.status));
          } catch (error) {
            console.error("Error checking subscription on auth change:", error);
            setHasSubscription(false);
          } finally {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
        
        setIsLoaded(true);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [requireSubscription]);

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If subscription is required but user doesn't have one, redirect to checkout
  if (requireSubscription && !hasSubscription) {
    return <Navigate to="/checkout" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
