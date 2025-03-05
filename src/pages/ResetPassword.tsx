
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if we have a hash fragment in the URL (from password reset email)
    const hash = window.location.hash;
    
    if (!hash || !hash.includes('type=recovery')) {
      // Inform the user if this is not a valid reset link
      toast({
        title: "Invalid Reset Link",
        description: "Use the link from your email to reset your password",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate password
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    
    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      
      if (error) throw error;
      
      setSuccess(true);
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully reset",
      });
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
      
    } catch (error: any) {
      console.error("Password reset error:", error);
      setError(error.message || "Failed to reset password. Please try again.");
      
      toast({
        title: "Reset failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>
            Create a new password for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-center">
                Your password has been successfully reset. You'll be redirected to the dashboard shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
              
              <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
