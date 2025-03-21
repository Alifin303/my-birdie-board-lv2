
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, CreditCard, Info } from "lucide-react";
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
      className="min-h-screen flex flex-col overflow-hidden"
      style={{
        backgroundImage: "url('/lovable-uploads/e0dc34c2-5f14-40b7-bcf1-f9c5e827b330.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
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
              Stop guessing your way to better golf — track your progress and lower your scores with MyBirdieBoard.
            </p>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-6">
            <div className="bg-accent/10 rounded-lg p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-accent mb-4">Your Golf Game, Tracked and Transformed</h2>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-accent mr-2" />
                    <span>Track unlimited rounds</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-accent mr-2" />
                    <span>Access detailed analytics to spot trends and patterns</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-accent mr-2" />
                    <span>Course leaderboards — see how you rank at every course you play</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-accent mr-2" />
                    <span>Advanced progress tracking — monitor your best rounds and personal records</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-accent mr-2" />
                    <span>Track your handicap</span>
                  </li>
                </ul>
              </div>
              
              <div className="mb-6">
                <div className="bg-primary/10 p-5 rounded-lg mb-5 text-center">
                  <p className="font-bold text-primary mb-2 text-xl">🎉 Start with a 7-day free trial 🎉</p>
                  <p className="text-sm">
                    Try MyBirdieBoard with no risk. Only £2.99/month after your trial ends.
                  </p>
                </div>
                
                <p className="text-center text-lg font-semibold mb-2">Only £2.99/month after your free trial</p>
                <p className="text-center text-sm text-muted-foreground">
                  Cheaper than a bucket of range balls — invest in your game and start improving today.
                </p>
                <div className="flex items-center justify-center mt-2 text-sm text-muted-foreground bg-primary/5 p-2 rounded-md">
                  <Info className="h-4 w-4 mr-2 text-primary/70" />
                  <p>Prices are shown in GBP. Your local currency price will be calculated at checkout.</p>
                </div>
                <p className="text-center text-sm mt-3">
                  No long-term commitment. Cancel anytime.
                </p>
              </div>
              
              <div className="mb-6">
                <p className="text-center font-medium mb-3">
                  Join thousands of golfers who trust MyBirdieBoard to sharpen their game.
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
                    👉 Start 7-Day Free Trial
                  </>
                )}
              </Button>
              
              <p className="text-center text-sm text-muted-foreground mt-3">
                Secure payment via Stripe. You won't be charged until your free trial ends.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
