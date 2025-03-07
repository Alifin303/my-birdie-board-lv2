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
        
        // Check if this is a recovery operation from URL
        // We need to check multiple places as the type can be in different locations
        const isRecovery = 
          fullUrl.includes('type=recovery') || 
          urlSearchParams.get('type') === 'recovery' || 
          urlHashParams.get('type') === 'recovery';
        
        if (isRecovery) {
          console.log("Recovery flow detected");
          
          // Look for token in multiple places
          const token = 
            urlSearchParams.get('token') || 
            urlHashParams.get('token') ||
            urlSearchParams.get('code') || 
            urlHashParams.get('code');
          
          if (token) {
            console.log("Recovery token found:", token);
            try {
              // Exchange the token for a session
              const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(token);
              
              if (exchangeError) {
                console.error("Token exchange error:", exchangeError);
                throw exchangeError;
              }
              
              console.log("Token exchange successful:", data);
              
              // Navigate to reset password page
              toast({
                title: "Password Reset",
                description: "Please enter your new password",
              });
              navigate("/auth/reset-password");
              return;
            } catch (tokenError) {
              console.error("Failed to process recovery token:", tokenError);
              // Continue to check other auth methods before giving up
            }
          } else {
            console.log("No recovery token found in URL, checking for active session");
          }
          
          // Even without a valid token, check if we have an active session that might be a recovery session
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session) {
            console.log("Active session found, checking for recovery status");
            
            // Check if this is a recovery flow based on session data
            if (sessionData.session.user.recovery_sent_at) {
              console.log("Recovery session confirmed from session data");
              toast({
                title: "Password Reset",
                description: "Please enter your new password",
              });
              navigate("/auth/reset-password");
              return;
            }
          }
          
          // If we've reached this point in a recovery flow but couldn't establish a valid recovery session,
          // still redirect to reset password page where further validation will happen
          toast({
            title: "Password Reset Verification",
            description: "Verifying your reset request...",
          });
          navigate("/auth/reset-password");
          return;
        }
        
        // Handle normal authentication flows (non-recovery)
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
