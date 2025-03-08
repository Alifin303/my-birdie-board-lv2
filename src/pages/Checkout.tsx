
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, CreditCard } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function Checkout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [processingStatus, setProcessingStatus] = useState<"idle" | "redirecting" | "success" | "error">("idle");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const canceled = new URLSearchParams(location.search).get("canceled");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          throw authError;
        }
        
        if (!session) {
          navigate("/");
          return;
        }
        
        setUser(session.user);
        
        // Check if user already has an active subscription
        if (session.user.id) {
          const { data: subscription, error: subError } = await supabase
            .from("customer_subscriptions")
            .select("status, current_period_end")
            .eq("user_id", session.user.id)
            .maybeSingle();
            
          if (!subError && subscription) {
            const isActive = subscription.status === "active" || subscription.status === "trialing";
            const currentPeriodEnd = subscription.current_period_end ? new Date(subscription.current_period_end) : null;
            const isStillValid = currentPeriodEnd ? currentPeriodEnd > new Date() : false;
            
            if (isActive && isStillValid) {
              // User already has a subscription, redirect to dashboard
              navigate("/dashboard");
              return;
            }
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setError("Authentication error. Please try logging in again.");
      }
    };
    
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (canceled) {
      toast({
        title: "Checkout Canceled",
        description: "You can try again whenever you're ready.",
        variant: "destructive",
      });
    }
  }, [canceled, toast]);

  const handleCreateCheckout = async () => {
    if (!user) {
      setError("You must be logged in to subscribe.");
      return;
    }
    
    try {
      setIsLoading(true);
      setProcessingStatus("redirecting");
      setError(null);
      
      // Get the user's profile information
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();
      
      if (profileError) {
        console.error("Profile fetch error:", profileError);
      }
      
      const userName = profile 
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() 
        : user.email;
      
      // Construct request URL
      const origin = window.location.origin;
      const successUrl = `${origin}/auth/callback?subscription_status=success`;
      const cancelUrl = `${origin}/checkout?canceled=true`;
      
      console.log("Making checkout request with user:", user.id);
      
      // Call the Supabase Edge Function to create a Stripe Checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          user_id: user.id,
          user_email: user.email,
          user_name: userName,
          success_url: successUrl,
          cancel_url: cancelUrl
        }
      });
      
      if (error) {
        console.error("Checkout creation error:", error);
        throw new Error(error.message || "Failed to create checkout session");
      }
      
      if (!data || !data.url) {
        throw new Error("No checkout URL returned");
      }
      
      // Redirect to Stripe Checkout
      console.log("Redirecting to Stripe Checkout:", data.url);
      window.location.href = data.url;
      
    } catch (error) {
      console.error("Checkout error:", error);
      setError(error.message || "An error occurred. Please try again.");
      setProcessingStatus("error");
      
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-foreground/30 flex flex-col">
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Logo />
      </div>
      
      <div className="flex-1 flex justify-center items-center px-4 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 sm:p-8 max-w-2xl w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary mb-3">Join MyBirdieBoard Premium</h1>
            <p className="text-muted-foreground">
              Unlock all features and take your golf game to the next level
            </p>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-6">
            <div className="bg-accent/10 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-accent mb-1">Pro Membership</h2>
                  <p className="text-xl font-semibold">$9.99 / month</p>
                </div>
                <div className="bg-accent/20 text-accent font-semibold rounded-full px-3 py-1 text-sm">
                  Best Value
                </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-accent mr-2" />
                  <span>Round tracking with advanced stats</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-accent mr-2" />
                  <span>Official handicap calculation</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-accent mr-2" />
                  <span>Performance analytics and trends</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-accent mr-2" />
                  <span>Course leaderboards with friends</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-accent mr-2" />
                  <span>Unlimited round storage</span>
                </li>
              </ul>
              
              <Button 
                onClick={handleCreateCheckout}
                disabled={isLoading || !user}
                className="w-full bg-accent hover:bg-accent/90 text-white py-6 text-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {processingStatus === "redirecting" ? "Redirecting to Stripe..." : "Processing..."}
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Subscribe Now
                  </>
                )}
              </Button>
              
              <p className="text-center text-sm text-muted-foreground mt-3">
                Secure payment via Stripe. Cancel anytime.
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                By subscribing, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
