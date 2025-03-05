
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isSubscriptionValid } from "@/components/ProtectedRoute";

export default function Checkout() {
  const [isLoading, setIsLoading] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("");
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        // First set initial state - prevent flashes
        setIsLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log("No session found, redirecting to homepage");
          navigate("/");
          return;
        }
        
        setUser(session.user);
        
        // Check if the user already has an active subscription
        const { data: sub, error } = await supabase
          .from("customer_subscriptions")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching subscription:", error);
        }
        
        setSubscription(sub);
        
        if (sub) {
          setSubscriptionStatus(sub.status);
          if (sub.current_period_end) {
            setSubscriptionEndDate(new Date(sub.current_period_end).toLocaleDateString());
          }
          
          console.log("Current subscription data:", sub);
          console.log("Subscription validation:", {
            status: sub.status,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            currentPeriodEnd: sub.current_period_end,
            now: new Date().toISOString(),
            isStillValid: sub.current_period_end ? new Date(sub.current_period_end) > new Date() : false
          });
          
          // Use the shared isSubscriptionValid function
          const hasValidSubscription = isSubscriptionValid(sub);
          
          if (hasValidSubscription) {
            console.log("User has valid subscription, but staying on checkout page");
            // We don't auto-redirect anymore to prevent loops
            // Just show the current subscription status on this page
          }
        }
      } catch (err) {
        console.error("Error in checkSession:", err);
      } finally {
        setIsLoading(false);
        setInitialCheckDone(true);
      }
    };
    
    checkSession();
  }, [navigate, toast]);

  const handleCheckout = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Get return URL (current origin + /dashboard)
      const returnUrl = `${window.location.origin}/dashboard`;
      
      // Call the create-checkout Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          user_id: user.id,
          email: user.email,
          return_url: returnUrl
        }
      });
      
      if (error) throw error;
      
      if (data && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Error",
        description: error.message || "There was a problem setting up the payment page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get a human-readable subscription status message
  const getSubscriptionMessage = () => {
    if (!subscription) return null;
    
    if (subscription.status === "active") {
      return "Active subscription";
    }
    
    if (subscription.cancel_at_period_end && subscriptionEndDate) {
      return `Canceled - active until ${subscriptionEndDate}`;
    }
    
    if (subscription.status === "past_due" || subscription.status === "incomplete") {
      return `Payment issue - access until ${subscriptionEndDate || 'unknown date'}`;
    }
    
    return `Status: ${subscription.status}`;
  };

  if (!initialCheckDone) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Check if user exists
  if (!user) {
    navigate("/");
    return null;
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{
        backgroundImage: `url('https://www.suttongreengc.co.uk/wp-content/uploads/2023/02/membership-featured.jpg')`,
        backgroundColor: "#2C4A3B", // Fallback color if image fails to load
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black opacity-60 z-0"></div>
      
      <div className="relative z-10 py-12 px-4 flex flex-col justify-center min-h-screen">
        <div className="max-w-3xl mx-auto w-full">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl overflow-hidden">
            <div className="bg-primary p-6 sm:p-8 text-primary-foreground">
              <h1 className="text-2xl sm:text-3xl font-bold">Join BirdieBoard Premium</h1>
              <p className="mt-2 opacity-90">Take your golf game to the next level with our premium features</p>
              
              {subscription && (
                <div className="mt-2 p-2 bg-white/20 rounded">
                  <p className="text-sm">
                    {getSubscriptionMessage()}
                    {subscription.status === "active" && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-8">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-4 text-white">BirdieBoard Premium</h2>
                  <div className="text-3xl font-bold mb-2 text-white">£2.99<span className="text-base font-normal text-white/70">/month</span></div>
                  <p className="text-white/70 mb-6">Cancel anytime</p>
                  
                  <ul className="space-y-3">
                    {[
                      "Track unlimited rounds",
                      "Access to detailed analytics",
                      "Course leaderboards",
                      "Advanced progress tracking",
                      "Compare with other golfers",
                      "Track handicap trends"
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-white">
                        <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex-1 flex flex-col justify-between text-white">
                  <div>
                    <h3 className="font-medium mb-3">Ready to start improving your game?</h3>
                    <p className="text-white/80 mb-6">
                      Join thousands of golfers who are using BirdieBoard to track their progress and improve their scores.
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleCheckout} 
                    disabled={isLoading} 
                    size="lg"
                    className="w-full bg-accent hover:bg-accent/90 text-white text-lg px-8 h-12 shadow-lg transition-all duration-300"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Setting up payment...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">🏌️‍♂️</span>
                        {subscription ? 
                          (subscription.cancel_at_period_end ? "Renew Subscription" : "Update Subscription") 
                          : "Subscribe Now"}
                      </>
                    )}
                  </Button>
                  
                  {isSubscriptionValid(subscription) && (
                    <Button 
                      onClick={() => navigate("/dashboard")} 
                      variant="outline"
                      className="mt-4 w-full"
                    >
                      Return to Dashboard
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
