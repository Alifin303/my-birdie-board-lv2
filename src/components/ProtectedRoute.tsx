
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
  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const isAuth = !!session;
        setIsAuthenticated(isAuth);

        // If user is authenticated and subscription is required, check for active subscription
        if (isAuth && requireSubscription) {
          const { data: subscription } = await supabase
            .from("customer_subscriptions")
            .select("status")
            .eq("user_id", session.user.id)
            .maybeSingle();
            
          setHasSubscription(subscription?.status === "active");
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsAuthenticated(false);
        setHasSubscription(false);
      } finally {
        setIsLoaded(true);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const isAuth = !!session;
        setIsAuthenticated(isAuth);
        
        // If auth state changes and user is authenticated, check subscription
        if (isAuth && requireSubscription) {
          const { data: subscription } = await supabase
            .from("customer_subscriptions")
            .select("status")
            .eq("user_id", session.user.id)
            .maybeSingle();
            
          setHasSubscription(subscription?.status === "active");
        }
        
        setIsLoaded(true);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [requireSubscription]);

  if (!isLoaded) {
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
