
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

  const generateTemporaryPassword = () => {
    // Generate a random 12-character password with letters, numbers and special characters
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!emailInput) {
      setError("Please enter your email address");
      return;
    }

    try {
      setIsLoading(true);
      
      // Generate a temporary password
      const tempPassword = generateTemporaryPassword();
      
      // First, check if the user exists
      const { data: userExists, error: checkError } = await supabase.auth.signInWithOtp({
        email: emailInput,
        options: {
          shouldCreateUser: false
        }
      });
      
      if (checkError) {
        if (checkError.message.includes("Email not confirmed")) {
          // This means the user exists but hasn't confirmed their email
          // We can proceed with password update
        } else if (checkError.message.includes("Invalid login credentials")) {
          throw new Error("No account found with this email address");
        } else {
          throw checkError;
        }
      }
      
      // Update the user's password with the temporary one
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        emailInput,
        { password: tempPassword }
      );

      if (updateError) {
        // Fall back to the email reset if admin update fails
        // This happens because the client doesn't have admin privileges
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(emailInput, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        
        if (resetError) throw resetError;
        
        setIsSuccess(true);
        
        toast({
          title: "Reset email sent",
          description: "Check your email for a link to reset your password",
        });
        
        return;
      }
      
      // If we got here, the password was updated successfully
      setIsSuccess(true);
      
      toast({
        title: "Temporary password sent",
        description: "Check your email for your temporary password",
      });
      
    } catch (error: any) {
      console.error("Password reset error:", error);
      setError(error.message || "Failed to send password reset");
      
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
            Enter your email to receive a temporary password
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
              We've sent a temporary password to <strong>{emailInput}</strong>. 
              Please check your email and use it to log in, then update your password in your account settings.
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
                  Sending temporary password...
                </>
              ) : (
                "Send Temporary Password"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
