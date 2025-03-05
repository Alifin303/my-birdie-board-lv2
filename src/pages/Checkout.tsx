
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Checkout() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }
      setUser(session.user);
      
      // Check if the user already has an active subscription
      const { data: subscription } = await supabase
        .from("customer_subscriptions")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
        
      if (subscription && subscription.status === "active") {
        // User already has an active subscription, redirect to dashboard
        navigate("/dashboard");
      }
    };
    
    checkSession();
  }, [navigate]);

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

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
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
                        Subscribe Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
