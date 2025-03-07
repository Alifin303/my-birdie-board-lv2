import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AuthRedirect = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Prevent multiple processing attempts
    if (isProcessing) return;
    
    const handleAuthRedirect = async () => {
      try {
        setIsProcessing(true);
        
        // Get the full URL including search params and hash
        const fullUrl = window.location.href;
        const urlSearchParams = new URLSearchParams(window.location.search);
        const urlHashParams = new URLSearchParams(window.location.hash.substring(1));
        
        console.log("Auth redirect - Full URL:", fullUrl);
        console.log("Auth redirect - Search params:", urlSearchParams.toString());
        console.log("Auth redirect - Hash params:", urlHashParams.toString());
        
        // Check if this is a recovery operation from search parameters
        const isRecovery = fullUrl.includes('type=recovery') || urlSearchParams.get('type') === 'recovery';
        
        if (isRecovery) {
          console.log("Recovery flow detected from URL params");
          
          // Get the code or token from URL if present
          const code = urlSearchParams.get('code') || urlSearchParams.get('token');
          
          if (code) {
            console.log("Code/token found for recovery:", code);
            // Exchange the code for a session - this establishes the recovery session
            await supabase.auth.exchangeCodeForSession(code);
            
            // After exchange, check if we have a valid session for recovery
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData.session) {
              console.log("Recovery session established, redirecting to reset password");
              toast({
                title: "Password Reset",
                description: "Please enter your new password",
              });
              navigate("/auth/reset-password");
              return;
            }
          }
          
          // Redirect to reset password page even if code exchange fails
          // The ResetPassword component will handle validating the session
          toast({
            title: "Password Reset",
            description: "Please enter your new password",
          });
          navigate("/auth/reset-password");
          return;
        }
        
        // Check for code in URL search params (traditional redirect)
        const code = urlSearchParams.get('code');
        
        // Also check hash fragment for access_token (hash-based redirect)
        const accessToken = urlHashParams.get('access_token');
        const refreshToken = urlHashParams.get('refresh_token');
        const type = urlHashParams.get('type');

        // If we have a code, it's the traditional OAuth flow (email confirmation)
        if (code) {
          console.log("Code found in URL:", code);
          
          // Let Supabase handle the code exchange
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            throw exchangeError;
          }

          if (data?.session) {
            // Check if this might be a recovery flow based on session
            if (data.session.user.recovery_sent_at) {
              console.log("Recovery detected from session data");
              toast({
                title: "Password Reset",
                description: "Please enter your new password",
              });
              navigate("/auth/reset-password");
              return;
            }
            
            toast({
              title: "Success",
              description: "You have successfully verified your email.",
            });
            navigate("/dashboard");
            return;
          }
        }
        
        // If we have an access token, it's the token-based flow
        if (accessToken) {
          console.log("Access token found in URL hash");
          
          const { error: signInError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });

          if (signInError) {
            throw signInError;
          }

          // Check what type of operation this was
          if (type === "recovery") {
            console.log("Recovery type found in hash params");
            // For password recovery, redirect to the reset password page
            toast({
              title: "Password Reset",
              description: "Please enter your new password.",
            });
            navigate("/auth/reset-password");
            return;
          } else if (type === "signup") {
            toast({
              title: "Email Verified",
              description: "Your email has been successfully verified.",
            });
            navigate("/dashboard");
            return;
          } else {
            toast({
              title: "Success",
              description: "You have successfully logged in.",
            });
            navigate("/dashboard");
            return;
          }
        }

        // If no code or token was found, check if user is already logged in
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log("User already has an active session");
          
          // Check recovery timestamp to see if this might be a recovery flow
          if (data.session.user.recovery_sent_at) {
            console.log("Recovery detected from session recovery timestamp");
            toast({
              title: "Password Reset",
              description: "Please enter your new password.",
            });
            navigate("/auth/reset-password");
            return;
          }
          
          navigate("/dashboard");
          return;
        }
          
        throw new Error("No authentication code or token found in the URL. Please try logging in again.");
      } catch (err: any) {
        console.error("Auth redirect error:", err);
        setError(err.message || "An unexpected error occurred during authentication.");
        toast({
          title: "Authentication Error",
          description: err.message || "An unexpected error occurred during authentication.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsProcessing(false);
      }
    };

    handleAuthRedirect();
  }, [location, navigate, toast, isProcessing]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Processing Authentication</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <p className="text-center">Please wait while we verify your account...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-500">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-center mb-4">{error}</p>
            <Button onClick={() => navigate("/")}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default AuthRedirect;
