
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AuthConfirm = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleConfirmation = async () => {
      try {
        // Check if the URL contains a callback with an access_token and type=recovery|signup
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (data.session) {
          // User is already logged in
          setStatus("success");
          setMessage("Your account has been verified. You are now logged in.");
          
          toast({
            title: "Account Verified",
            description: "Your account has been successfully verified.",
          });
          
          // Redirect after a short delay
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
          return;
        }

        // Get hash parameters from URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        if (!accessToken) {
          throw new Error("No access token found in URL. Please try the verification link again.");
        }

        // Process based on type (signup or recovery)
        if (type === "signup") {
          const { error: signInError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });

          if (signInError) {
            throw signInError;
          }

          setStatus("success");
          setMessage("Your email has been verified. You are now logged in.");
          
          toast({
            title: "Email Verified",
            description: "Your email has been successfully verified.",
          });
          
          // Redirect after a short delay
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        } else if (type === "recovery") {
          // Handle password recovery if needed
          setStatus("success");
          setMessage("Your password has been reset. You are now logged in.");
          
          // Redirect after a short delay
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        } else {
          throw new Error("Unknown authentication type. Please try again.");
        }
      } catch (error: any) {
        console.error("Authentication confirmation error:", error);
        setStatus("error");
        setMessage(error.message || "An error occurred during account verification. Please try again.");
        
        toast({
          title: "Verification Error",
          description: error.message || "An error occurred during account verification. Please try again.",
          variant: "destructive",
        });
      }
    };

    handleConfirmation();
  }, [navigate, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {status === "loading" && "Verifying Your Account"}
            {status === "success" && "Account Verified"}
            {status === "error" && "Verification Error"}
          </CardTitle>
          <CardDescription className="text-center">
            {status === "loading" && "Please wait while we confirm your account..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          {status === "loading" && (
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          )}
          
          {status === "success" && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <p className="text-center">{message}</p>
            </>
          )}
          
          {status === "error" && (
            <>
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <p className="text-center">{message}</p>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {status === "error" && (
            <Button onClick={() => navigate("/")}>
              Return to Home
            </Button>
          )}
          
          {status === "success" && (
            <Button onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthConfirm;
