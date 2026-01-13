import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, CreditCard, Info } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { clearSubscriptionCache } from "@/integrations/supabase/subscription/subscription-utils";
export default function Checkout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [processingStatus, setProcessingStatus] = useState<"idle" | "redirecting" | "success" | "error">("idle");
  const navigate = useNavigate();
  const location = useLocation();
  const {
    toast
  } = useToast();
  const canceled = new URLSearchParams(location.search).get("canceled");
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: {
            session
          },
          error: authError
        } = await supabase.auth.getSession();
        if (authError) {
          throw authError;
        }
        if (!session) {
          navigate("/");
          return;
        }
        setUser(session.user);
        if (session.user.id) {
          const {
            data: subscription,
            error: subError
          } = await supabase.from("customer_subscriptions").select("status, current_period_end").eq("user_id", session.user.id).maybeSingle();
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
        variant: "destructive"
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

      // Always clear subscription cache before starting checkout
      clearSubscriptionCache(user.id);
      const {
        data: profile,
        error: profileError
      } = await supabase.from("profiles").select("first_name, last_name").eq("id", user.id).single();
      if (profileError) {
        console.error("Profile fetch error:", profileError);
      }
      const userName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : user.email;
      const origin = window.location.origin;
      const successUrl = `${origin}/auth/callback?subscription_status=success`;
      const cancelUrl = `${origin}/checkout?canceled=true`;
      console.log("Making checkout request with user:", user.id);
      console.log("Success URL:", successUrl);
      console.log("Cancel URL:", cancelUrl);
      const {
        data,
        error
      } = await supabase.functions.invoke('create-checkout', {
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
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <>
    <Helmet>
      <title>Checkout | MyBirdieBoard</title>
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
    <div className="min-h-screen flex flex-col bg-cover bg-center bg-no-repeat" style={{
    backgroundImage: `url('https://www.suttongreengc.co.uk/wp-content/uploads/2023/02/membership-featured.jpg')`,
    backgroundColor: "#2C4A3B" // Fallback color if image fails to load
  }}>
      {/* Dark overlay div */}
      <div className="absolute inset-0 bg-black opacity-20 z-0"></div>
      
      <div className="container mx-auto px-4 flex justify-center relative z-10 py-0">
        <Link to="/" className="flex items-center">
          <img src="/lovable-uploads/e65e4018-8608-4c06-aefc-191f9e9de8e0.png" alt="MyBirdieBoard Logo" className="h-32 w-auto object-contain" />
        </Link>
      </div>
      
      <div className="flex-1 flex justify-center items-center relative z-10 py-0 px-[15px]">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 sm:p-8 max-w-2xl w-full">
          <div className="text-center mb-6">
            <h1 className="font-bold text-primary mb-3 text-3xl">Start your 30-Day Free Trial</h1>
            <p className="text-muted-foreground text-base">Unlock full access to MyBirdieBoard, track your rounds, handicap, and progress with no limits.</p>
          </div>
          
          {error && <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>}
          
          <div className="grid gap-6">
            <div className="bg-accent/10 rounded-lg p-6">
              <div className="mb-6">
                <ul className="space-y-4">
                  <li className="flex items-start text-lg font-medium">
                    <span className="mr-3 text-2xl">✅</span>
                    <span>Free for 30 days — No upfront payment required </span>
                  </li>
                  <li className="flex items-start text-lg font-medium">
                    <span className="mr-3 text-2xl">🛡️</span>
                    <span>Cancel anytime — No charge if you cancel during your trial</span>
                  </li>
                </ul>
              </div>
              
              <Button onClick={handleCreateCheckout} disabled={isLoading || !user} className="w-full bg-accent hover:bg-accent/90 text-white py-6 text-lg mb-3">
                {isLoading ? <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {processingStatus === "redirecting" ? "Redirecting to Stripe..." : "Processing..."}
                  </> : <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Continue
                  </>}
              </Button>
              
              <p className="text-center text-sm text-muted-foreground">Secure payment via Stripe. £2.99/month after trial. Billed in your local currency.</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="w-full mt-4 text-muted-foreground hover:text-foreground"
          >
            Return to dashboard
          </Button>
        </div>
      </div>
    </div>
  </>;
}