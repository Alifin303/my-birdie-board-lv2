
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
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        // Check for code in URL search params (traditional redirect)
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        
        // Also check hash fragment for access_token (hash-based redirect)
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        console.log("URL params:", { 
          search: location.search,
          hash: location.hash,
          code,
          accessToken,
          type
        });

        // If we have a code, it's the traditional OAuth flow (email confirmation)
        if (code) {
          // Let Supabase handle the code exchange
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            throw exchangeError;
          }

          if (data?.session) {
            // Check for recovery tokens by looking at the request URL
            const urlParams = new URLSearchParams(window.location.search);
            const fullUrl = window.location.href;
            
            // If this is a recovery operation
            if (fullUrl.includes('type=recovery') || data.session.user.recovery_sent_at) {
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
          const { error: signInError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });

          if (signInError) {
            throw signInError;
          }

          // Check what type of operation this was
          if (type === "signup") {
            toast({
              title: "Email Verified",
              description: "Your email has been successfully verified.",
            });
            navigate("/dashboard");
          } else if (type === "recovery") {
            // For password recovery, redirect to the reset password page
            toast({
              title: "Password Reset",
              description: "Please enter your new password.",
            });
            navigate("/auth/reset-password");
            return;
          } else {
            toast({
              title: "Success",
              description: "You have successfully logged in.",
            });
            navigate("/dashboard");
          }
          return;
        }

        // If no code or token was found
        if (!code && !accessToken) {
          // Check if user is already logged in
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            // If this is a recovery operation (check the URL)
            if (window.location.href.includes('type=recovery')) {
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
        }
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
      }
    };

    handleAuthRedirect();
  }, [location, navigate, toast]);

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
