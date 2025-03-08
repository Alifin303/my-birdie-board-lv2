import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
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
      
      const origin = window.location.origin;
      const successUrl = `${origin}/auth/callback?subscription_status=success`;
      const cancelUrl = `${origin}/checkout?canceled=true`;
      
      console.log("Making checkout request with user:", user.id);
      console.log("Success URL:", successUrl);
      console.log("Cancel URL:", cancelUrl);
      
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
        console.error("No checkout URL returned:", data);
        throw new Error("No checkout URL returned");
      }
      
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
    <div 
      className="min-h-screen flex flex-col bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('https://www.suttongreengc.co.uk/wp-content/uploads/2023/02/membership-featured.jpg')`,
        backgroundColor: "#2C4A3B", // Fallback color if image fails to load
      }}
    >
      {/* Dark overlay div */}
      <div className="absolute inset-0 bg-black opacity-20 z-0"></div>
      
      <div className="container mx-auto px-4 py-8 flex justify-center relative z-10">
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/e65e4018-8608-4c06-aefc-191f9e9de8e0.png" 
            alt="MyBirdieBoard Logo" 
            className="h-32 w-auto object-contain" 
          />
        </Link>
      </div>
      
      <div className="flex-1 flex justify-center items-center px-4 py-8 relative z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 sm:p-8 max-w-2xl w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary mb-3">Join MyBirdieBoard</h1>
            <p className="text-muted-foreground">
              Stop guessing your way to better golf - use MyBirdieBoard
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
                  <h2 className="text-2xl font-bold text-accent mb-1">MyBirdieBoard</h2>
                  <p className="text-xl font-semibold">£2.99 / month</p>
                  <p className="text-sm text-muted-foreground">Cancel anytime</p>
                </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-accent mr-2" />
                  <span>Track unlimited rounds</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-accent mr-2" />
                  <span>Access to detailed analytics</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-accent mr-2" />
                  <span>Course leaderboards</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-accent mr-2" />
                  <span>Advanced progress tracking</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-accent mr-2" />
                  <span>Compare with other golfers</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-accent mr-2" />
                  <span>Track handicap</span>
                </li>
              </ul>
              
              <div className="mb-6">
                <p className="text-center font-medium mb-2">Ready to start improving your game?</p>
                <p className="text-center text-sm text-muted-foreground">
                  Join thousands of golfers who are using MyBirdieBoard to track their progress and improve their scores.
                </p>
              </div>
              
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
          </div>
        </div>
      </div>
    </div>
  );
}
