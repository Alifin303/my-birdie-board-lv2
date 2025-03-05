
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { getSiteUrl } from "@/integrations/supabase/client";

export function ForgotPasswordDialog({ 
  open, 
  onOpenChange,
  email = ""
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  email?: string;
}) {
  const [emailInput, setEmailInput] = useState(email);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!emailInput) {
      setError("Please enter your email address");
      return;
    }

    try {
      setIsLoading(true);
      
      // Get the proper site URL for redirection
      const siteUrl = window.location.origin;
      console.log("Using redirect URL:", `${siteUrl}/reset-password`);
      
      // Use Supabase's built-in password reset functionality with the correct redirect URL
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(emailInput, {
        redirectTo: `${siteUrl}/reset-password`,
      });
      
      if (resetError) throw resetError;
      
      setIsSuccess(true);
      
      toast({
        title: "Reset link sent",
        description: "Check your email for a password reset link",
      });
      
    } catch (error: any) {
      console.error("Password reset error:", error);
      setError(error.message || "Failed to send password reset link");
      
      toast({
        title: "Reset request failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeDialog = () => {
    onOpenChange(false);
    // Reset the success state when dialog is closed
    setTimeout(() => {
      setIsSuccess(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl">Reset Password</DialogTitle>
          <DialogDescription>
            Enter your email to receive a password reset link
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="my-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <p className="text-center">
              We've sent a password reset link to <strong>{emailInput}</strong>. 
              Please check your email and click the link to reset your password.
            </p>
            <Button onClick={closeDialog} className="mt-4">Close</Button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="name@example.com"
                disabled={isLoading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Sending reset link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
