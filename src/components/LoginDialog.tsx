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
  DialogTrigger,
} from "@/components/ui/dialog";
import { SignUpDialog } from "./SignUpDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { ForgotPasswordDialog } from "./ForgotPasswordDialog";
import { canAccessPremiumFeatures } from "@/integrations/supabase/subscription/freemium-utils";

export function LoginDialog({ 
  open, 
  onOpenChange,
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkPremiumAccess = async (userId: string) => {
    try {
      console.log(`Checking premium access for user: ${userId}`);
      
      const { canAccess, hasSubscription, roundCount } = 
        await canAccessPremiumFeatures(userId, supabase);
      
      console.log("Login - Premium access check:", {
        canAccess,
        hasSubscription,
        roundCount
      });
      
      return canAccess;
    } catch (error) {
      console.error("Error in checkPremiumAccess:", error);
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${data.user?.user_metadata?.first_name || ""}!`,
      });
      
      onOpenChange(false);
      
      const canAccess = await checkPremiumAccess(data.user.id);
      
      if (canAccess) {
        console.log("User can access dashboard (subscription or free tier), redirecting");
        navigate("/dashboard");
      } else {
        console.log("User exceeded free tier and no subscription, redirecting to checkout");
        navigate("/checkout");
      }
      
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Failed to log in with those credentials");
      
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowForgotPassword(true);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] bg-card">
          <DialogHeader>
            <DialogTitle className="text-2xl">Log in to MyBirdieBoard</DialogTitle>
            <DialogDescription>
              Enter your credentials to access your account
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive" className="my-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="px-0 font-normal h-auto"
                  onClick={handleForgotPasswordClick}
                  type="button"
                >
                  Forgot password?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Logging in...
                </>
              ) : (
                "Log in"
              )}
            </Button>
          </form>
          
          <div className="text-center py-2">
            <div className="text-sm text-muted-foreground">Don't have an account?</div>
            <SignUpDialog />
          </div>
        </DialogContent>
      </Dialog>

      <ForgotPasswordDialog 
        open={showForgotPassword} 
        onOpenChange={setShowForgotPassword} 
        email={email}
      />
    </>
  );
}
